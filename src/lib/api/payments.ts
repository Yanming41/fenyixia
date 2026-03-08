import { supabase } from '../supabase'
import type { PaymentProof } from '../types'
import { getCurrentUser } from './auth'

export async function uploadPaymentProof(billId: string, file: File): Promise<string> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  const ext = file.name?.split('.').pop() || 'jpg'
  const path = `${billId}/${user.id}_${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, { upsert: true })
  if (upErr) throw upErr

  const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(path)
  const imageUrl = urlData.publicUrl

  const { error } = await supabase.from('payment_proofs').insert({
    bill_id: billId,
    user_id: user.id,
    image_url: imageUrl,
  })
  if (error) throw error

  return imageUrl
}

export async function getPaymentProofs(billId: string): Promise<PaymentProof[]> {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*')
    .eq('bill_id', billId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const proofs: PaymentProof[] = data || []
  const uids = [...new Set(proofs.map(p => p.user_id))]
  if (uids.length > 0) {
    const { data: users } = await supabase.from('users').select('id,name,emoji').in('id', uids)
    const umap: Record<string, { id: string; name: string; emoji: string }> = {}
    ;(users || []).forEach((u: { id: string; name: string; emoji: string }) => { umap[u.id] = u })
    proofs.forEach(p => { p.user = umap[p.user_id] || null })
  }
  return proofs
}
