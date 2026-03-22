import useSWR, { mutate } from 'swr'
import type { Bill } from '../lib/types'
import { fetchMyBills } from '../lib/api/bills'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

async function fetchBillsWithProofs(userId: string): Promise<Bill[]> {
  const data = await fetchMyBills()
  await markBillsWithProofs(data, userId)
  await markBillsWithDisputes(data)
  return data
}

export function useBills() {
  const { user } = useAuth()

  const { data: bills, isLoading } = useSWR(
    user ? 'bills' : null,
    () => fetchBillsWithProofs(user!.id),
  )

  return {
    bills: bills || [],
    loading: isLoading,
    reload: () => mutate('bills'),
  }
}

export function mutateBills() {
  return mutate('bills')
}

async function markBillsWithDisputes(billList: Bill[]) {
  try {
    const billIds = billList.map(b => b.id)
    const { data } = await supabase
      .from('bill_disputes')
      .select('id, bill_id, challenger_id, reason, suggested_items, status, created_at')
      .in('bill_id', billIds)
      .eq('status', 'pending')

    if (data && data.length > 0) {
      // Fetch challenger user info separately
      const challengerIds = [...new Set(data.map(d => d.challenger_id))]
      const { data: users } = await supabase
        .from('users')
        .select('id, name, emoji')
        .in('id', challengerIds)
      const userMap = new Map((users || []).map(u => [u.id, u]))

      const disputeByBill: Record<string, typeof data[0]> = {}
      data.forEach(d => { disputeByBill[d.bill_id] = d })
      billList.forEach(b => {
        const d = disputeByBill[b.id]
        if (d) {
          b._dispute = {
            id: d.id,
            bill_id: d.bill_id,
            challenger_id: d.challenger_id,
            challenger: userMap.get(d.challenger_id) || undefined,
            reason: d.reason,
            suggested_items: d.suggested_items as import('../lib/types').DisputeSuggestedItem[],
            status: d.status as 'pending',
            created_at: d.created_at,
          }
        }
      })
    }
  } catch (e) {
    console.error('markBillsWithDisputes:', e)
  }
}

async function markBillsWithProofs(billList: Bill[], currentUserId: string) {
  try {
    const { data } = await supabase
      .from('payment_proofs')
      .select('bill_id, user_id')
    if (data) {
      const proofSet = new Set(data.map(p => `${p.bill_id}_${p.user_id}`))
      const proofByBill: Record<string, Set<string>> = {}
      data.forEach(p => {
        if (!proofByBill[p.bill_id]) proofByBill[p.bill_id] = new Set()
        proofByBill[p.bill_id]!.add(p.user_id)
      })

      billList.forEach(b => {
        b._hasMeProof = proofSet.has(`${b.id}_${currentUserId}`)
        b._proofUserIds = proofByBill[b.id] || new Set()
      })
    }

    const { data: manualData } = await supabase
      .from('manual_payments')
      .select('bill_id, user_id')
    if (manualData) {
      const manualByBill: Record<string, Set<string>> = {}
      manualData.forEach(p => {
        if (!manualByBill[p.bill_id]) manualByBill[p.bill_id] = new Set()
        manualByBill[p.bill_id]!.add(p.user_id)
      })
      billList.forEach(b => {
        b._manualPaidUserIds = manualByBill[b.id] || new Set()
      })
    }
  } catch (e) {
    console.error('markBillsWithProofs:', e)
  }
}
