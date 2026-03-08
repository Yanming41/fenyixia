import { supabase } from '../supabase'
import type { BillReaction } from '../types'
import { getCurrentUser } from './auth'

export async function addAnger(billId: string): Promise<number> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  const { data: existing } = await supabase
    .from('bill_reactions')
    .select('id, anger_count')
    .eq('bill_id', billId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { error } = await supabase.from('bill_reactions')
      .update({
        anger_count: existing.anger_count + 1,
        updated_at: new Date().toISOString(),
        seen: false,
      })
      .eq('id', existing.id)
    if (error) throw error
    return existing.anger_count + 1
  } else {
    const { error } = await supabase.from('bill_reactions')
      .insert({ bill_id: billId, user_id: user.id, anger_count: 1 })
    if (error) throw error
    return 1
  }
}

export async function getUnseenAnger(): Promise<BillReaction[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data: myBills } = await supabase
    .from('bills').select('id').eq('payer_id', user.id)
  if (!myBills || myBills.length === 0) return []

  const billIds = myBills.map((b: { id: string }) => b.id)

  const { data, error } = await supabase
    .from('bill_reactions')
    .select('*')
    .in('bill_id', billIds)
    .eq('seen', false)
    .gt('anger_count', 0)
  if (error) { console.error('getUnseenAnger error:', error); return [] }

  const reactions: BillReaction[] = data || []
  const uids = [...new Set(reactions.map(r => r.user_id))]
  if (uids.length > 0) {
    const { data: users } = await supabase.from('users').select('id,name,emoji').in('id', uids)
    const umap: Record<string, { id: string; name: string; emoji: string }> = {}
    ;(users || []).forEach((u: { id: string; name: string; emoji: string }) => { umap[u.id] = u })
    reactions.forEach(r => { r.user = umap[r.user_id] || null })
  }
  return reactions
}

export async function markAngerSeen(reactionIds: string[]) {
  if (!reactionIds.length) return
  const { error } = await supabase.from('bill_reactions')
    .update({ seen: true })
    .in('id', reactionIds)
  if (error) console.error('markAngerSeen error:', error)
}
