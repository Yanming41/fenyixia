import { supabase } from './supabase';
import type { UserRef } from '../types/user';
import type { PaymentProof, AngerReaction } from '../types/bill';

/** 发送怒气 */
export async function addAnger(userId: string, billId: string): Promise<number> {
    const { data: existing } = await supabase
        .from('bill_reactions')
        .select('id, anger_count')
        .eq('bill_id', billId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('bill_reactions')
            .update({
                anger_count: existing.anger_count + 1,
                updated_at: new Date().toISOString(),
                seen: false,
            })
            .eq('id', existing.id);
        if (error) throw error;
        return existing.anger_count + 1;
    } else {
        const { error } = await supabase
            .from('bill_reactions')
            .insert({ bill_id: billId, user_id: userId, anger_count: 1 });
        if (error) throw error;
        return 1;
    }
}

/** 获取未读怒气 */
export async function getUnseenAnger(userId: string): Promise<AngerReaction[]> {
    const { data: myBills } = await supabase
        .from('bills')
        .select('id')
        .eq('payer_id', userId);

    if (!myBills || myBills.length === 0) return [];
    const billIds = myBills.map((b) => b.id);

    const { data, error } = await supabase
        .from('bill_reactions')
        .select('*')
        .in('bill_id', billIds)
        .eq('seen', false)
        .gt('anger_count', 0);

    if (error) {
        console.error('getUnseenAnger error:', error);
        return [];
    }

    const reactions = (data ?? []) as AngerReaction[];
    const uids = [...new Set(reactions.map((r) => r.user_id))];
    if (uids.length > 0) {
        const { data: users } = await supabase
            .from('users')
            .select('id,name,emoji')
            .in('id', uids);
        const umap: Record<string, UserRef> = {};
        (users ?? []).forEach((u: UserRef) => { umap[u.id] = u; });
        reactions.forEach((r) => { r.user = umap[r.user_id] ?? null; });
    }
    return reactions;
}

/** 标记怒气已读 */
export async function markAngerSeen(reactionIds: string[]) {
    if (!reactionIds.length) return;
    const { error } = await supabase
        .from('bill_reactions')
        .update({ seen: true })
        .in('id', reactionIds);
    if (error) console.error('markAngerSeen error:', error);
}

/** 上传付款凭证 */
export async function uploadPaymentProof(
    userId: string,
    billId: string,
    file: File
): Promise<string> {
    const ext = file.name?.split('.').pop() ?? 'jpg';
    const path = `${billId}/${userId}_${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file, { upsert: true });
    if (upErr) throw upErr;

    const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(path);
    const imageUrl = urlData.publicUrl;

    const { error } = await supabase.from('payment_proofs').insert({
        bill_id: billId,
        user_id: userId,
        image_url: imageUrl,
    });
    if (error) throw error;
    return imageUrl;
}

/** 获取付款凭证 */
export async function getPaymentProofs(billId: string): Promise<PaymentProof[]> {
    const { data, error } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('bill_id', billId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const proofs = (data ?? []) as PaymentProof[];
    const uids = [...new Set(proofs.map((p) => p.user_id))];
    if (uids.length > 0) {
        const { data: users } = await supabase
            .from('users')
            .select('id,name,emoji')
            .in('id', uids);
        const umap: Record<string, UserRef> = {};
        (users ?? []).forEach((u: UserRef) => { umap[u.id] = u; });
        proofs.forEach((p) => { p.user = umap[p.user_id] ?? null; });
    }
    return proofs;
}
