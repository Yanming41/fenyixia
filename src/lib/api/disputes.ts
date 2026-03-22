import { supabase } from '../supabase'
import { updateBill } from './bills'
import type { BillDispute, DisputeSuggestedItem } from '../types'

export async function fetchDispute(billId: string): Promise<BillDispute | null> {
  const { data, error } = await supabase
    .from('bill_disputes')
    .select('*, challenger:users!bill_disputes_challenger_id_fkey(id,name,emoji)')
    .eq('bill_id', billId)
    .eq('status', 'pending')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    bill_id: data.bill_id,
    challenger_id: data.challenger_id,
    challenger: data.challenger || undefined,
    reason: data.reason,
    suggested_items: data.suggested_items as DisputeSuggestedItem[],
    status: data.status,
    created_at: data.created_at,
  }
}

export async function createDispute(
  billId: string,
  challengerId: string,
  reason: string,
  suggestedItems: DisputeSuggestedItem[]
): Promise<void> {
  const { error } = await supabase.from('bill_disputes').insert({
    bill_id: billId,
    challenger_id: challengerId,
    reason,
    suggested_items: suggestedItems,
  })
  if (error) throw error
}

export async function resolveDispute(
  disputeId: string,
  billId: string,
  accepted: boolean,
  suggestedItems?: DisputeSuggestedItem[],
  billTitle?: string,
  billIcon?: string
): Promise<void> {
  // Update dispute status
  const { error } = await supabase
    .from('bill_disputes')
    .update({ status: accepted ? 'accepted' : 'rejected' })
    .eq('id', disputeId)
  if (error) throw error

  // If accepted, update the bill with suggested items
  if (accepted && suggestedItems && billTitle && billIcon) {
    await updateBill(billId, {
      title: billTitle,
      icon: billIcon,
      items: suggestedItems.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
        member_ids: item.member_ids,
      })),
    })
  }
}
