import { supabase } from './supabase';
import type { UserRef } from '../types/user';

/** 获取我的所有好友 */
export async function getFriends(userId: string): Promise<UserRef[]> {
    const { data, error } = await supabase.rpc('get_friends', { uid: userId });

    if (error) {
        // fallback: rpc 不存在时用两次查询
        const [r1, r2] = await Promise.all([
            supabase.from('friendships').select('user_b(id,name,emoji,color)').eq('user_a', userId),
            supabase.from('friendships').select('user_a(id,name,emoji,color)').eq('user_b', userId),
        ]);
        const friends: UserRef[] = [
            ...(r1.data ?? []).map((r: Record<string, unknown>) => r.user_b as UserRef),
            ...(r2.data ?? []).map((r: Record<string, unknown>) => r.user_a as UserRef),
        ];
        return friends;
    }
    return (data ?? []) as UserRef[];
}

/** 通过邮箱添加好友 */
export async function addFriend(userId: string, email: string): Promise<UserRef> {
    const { data: target, error: findErr } = await supabase
        .from('users')
        .select('id, name, emoji')
        .eq('email', email)
        .single();

    if (findErr || !target) throw new Error('找不到该用户');
    if (target.id === userId) throw new Error('不能加自己');

    const [a, b] = [userId, target.id].sort();
    const { error } = await supabase.from('friendships').upsert({ user_a: a, user_b: b });
    if (error) throw error;

    return target as UserRef;
}
