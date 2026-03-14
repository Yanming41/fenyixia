import { supabase } from '../supabase'
import type { Member } from '../types'
import { getCurrentUser } from './auth'

export async function getFriends(): Promise<Member[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase.rpc('get_friends', { uid: user.id })

  if (error) {
    const [r1, r2] = await Promise.all([
      supabase.from('friendships').select('user_b(id,name,emoji,color)').eq('user_a', user.id),
      supabase.from('friendships').select('user_a(id,name,emoji,color)').eq('user_b', user.id),
    ])
    const friends = [
      ...(r1.data || []).map((r: any) => r.user_b),
      ...(r2.data || []).map((r: any) => r.user_a),
    ]
    return friends
  }
  return data || []
}

export type AddFriendResult =
  | { type: 'added'; id: string }
  | { type: 'invited'; email: string }
  | { type: 'already_invited'; email: string }

export async function addFriend(email: string): Promise<AddFriendResult> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  if (email === user.email) throw new Error('不能加自己')

  // 1. 查找已注册用户
  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (target) {
    // 用户已存在，直接加好友
    const [a, b] = [user.id, target.id].sort()
    const { error } = await supabase.from('friendships').upsert({ user_a: a, user_b: b })
    if (error) throw error
    return { type: 'added', id: target.id }
  }

  // 2. 用户不存在，检查是否已邀请过
  const { data: existing } = await supabase
    .from('invitations')
    .select('id')
    .eq('inviter_id', user.id)
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return { type: 'already_invited', email }
  }

  // 3. 创建邀请记录
  const { data: invitation, error: insertErr } = await supabase
    .from('invitations')
    .insert({ inviter_id: user.id, email })
    .select('token')
    .single()
  if (insertErr || !invitation) throw new Error('创建邀请失败')

  // 4. 获取邀请人昵称
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  // 5. 发送邀请邮件
  const { error: emailErr } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'invite',
      to: email,
      data: {
        inviterName: profile?.name || '你的朋友',
        token: invitation.token,
      },
    },
  })
  if (emailErr) throw new Error('邀请邮件发送失败')

  return { type: 'invited', email }
}
