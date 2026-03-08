import { useState, useEffect, useCallback } from 'react'
import type { Bill } from '../lib/types'
import { fetchMyBills } from '../lib/api/bills'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBills() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  const loadBills = useCallback(async () => {
    if (!user) { setBills([]); setLoading(false); return }
    try {
      setLoading(true)
      const data = await fetchMyBills()
      // Mark bills with payment proofs
      await markBillsWithProofs(data, user.id)
      setBills(data)
    } catch (e) {
      console.error('[useBills] Failed to load:', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadBills()
  }, [loadBills])

  return { bills, loading, reload: loadBills }
}

async function markBillsWithProofs(billList: Bill[], currentUserId: string) {
  try {
    const { data } = await supabase
      .from('payment_proofs')
      .select('bill_id, user_id')
    if (!data) return

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
  } catch (e) {
    console.error('markBillsWithProofs:', e)
  }
}
