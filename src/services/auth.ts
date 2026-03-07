import { supabase } from './supabase';
import type { User } from '../types/user';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/** 获取当前登录用户（null = 未登录） — 会发网络请求验证 token */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 从 users 表获取用户详细信息
    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return data as User | null;
}

/** 从本地 session 获取用户（不发网络请求，用于初始化） */
export async function getSessionUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return data as User | null;
}

/** 获取当前 auth session 中的 user id（不查 users 表，更快） */
export async function getAuthUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

/** 邮箱 + 密码注册（PIN 作为密码） */
export async function signUp(
    email: string,
    password: string,
    name: string,
    emoji = '😀',
    color = '#1c1c26'
) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
        await supabase.from('users').upsert({
            id: data.user.id,
            email,
            name,
            emoji,
            color,
        });
    }
    return data;
}

/** 登录 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

/** 登出 */
export async function signOut() {
    await supabase.auth.signOut();
}

/** 监听登录状态变化（只传 event，不查 DB） */
export function onAuthChange(
    callback: (event: AuthChangeEvent, hasSession: boolean) => void
) {
    return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        console.log('[auth.ts] onAuthStateChange event=', event, 'has session=', !!session);
        callback(event, !!session);
    });
}
