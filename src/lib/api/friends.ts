import { supabase } from '../supabase'
import type { Member } from '../types'
import { getCurrentUser } from './auth'

// ── Get confirmed friends ──

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

// ── Search user by email (RPC) ──

export interface SearchUserResult {
  id: string
  name: string
  emoji: string
}

export async function searchUserByEmail(email: string): Promise<SearchUserResult | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  if (email === user.email) throw new Error('不能添加自己为好友')

  const { data, error } = await supabase.rpc('search_user_by_email', { search_email: email })
  if (error) throw new Error('搜索失败')
  return data && data.length > 0 ? data[0] : null
}

// ── Friend requests ──

export interface FriendRequest {
  id: string
  from_user: string
  to_user: string
  status: string
  created_at: string
  user: { id: string; name: string; emoji: string } | null
}

export async function sendFriendRequest(toUserId: string): Promise<'sent' | 'auto_accepted'> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  // Check if the other person already sent us a pending request
  const { data: reverse } = await supabase
    .from('friend_requests')
    .select('id')
    .eq('from_user', toUserId)
    .eq('to_user', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (reverse) {
    // Auto-accept their request
    await supabase.rpc('accept_friend_request', { request_id: reverse.id })
    return 'auto_accepted'
  }

  // Send new request
  const { error } = await supabase.from('friend_requests').upsert(
    { from_user: user.id, to_user: toUserId, status: 'pending' },
    { onConflict: 'from_user,to_user' }
  )
  if (error) throw new Error('发送申请失败')
  return 'sent'
}

export async function getReceivedRequests(): Promise<FriendRequest[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, from_user, to_user, status, created_at')
    .eq('to_user', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error

  const requests: FriendRequest[] = (data || []).map(r => ({ ...r, user: null }))
  const uids = [...new Set(requests.map(r => r.from_user))]
  if (uids.length > 0) {
    const { data: users } = await supabase.from('users').select('id,name,emoji').in('id', uids)
    const umap: Record<string, { id: string; name: string; emoji: string }> = {}
    ;(users || []).forEach((u: { id: string; name: string; emoji: string }) => { umap[u.id] = u })
    requests.forEach(r => { r.user = umap[r.from_user] || null })
  }
  return requests
}

export async function getSentRequests(): Promise<FriendRequest[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, from_user, to_user, status, created_at')
    .eq('from_user', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error

  const requests: FriendRequest[] = (data || []).map(r => ({ ...r, user: null }))
  const uids = [...new Set(requests.map(r => r.to_user))]
  if (uids.length > 0) {
    const { data: users } = await supabase.from('users').select('id,name,emoji').in('id', uids)
    const umap: Record<string, { id: string; name: string; emoji: string }> = {}
    ;(users || []).forEach((u: { id: string; name: string; emoji: string }) => { umap[u.id] = u })
    requests.forEach(r => { r.user = umap[r.to_user] || null })
  }
  return requests
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('accept_friend_request', { request_id: requestId })
  if (error) throw new Error('接受失败: ' + error.message)
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('reject_friend_request', { request_id: requestId })
  if (error) throw new Error('拒绝失败: ' + error.message)
}

// ── Add friend (modified: registered users get request, unregistered get invitation) ──

export type AddFriendResult =
  | { type: 'request_sent' }
  | { type: 'auto_accepted' }
  | { type: 'already_friends' }
  | { type: 'already_requested' }
  | { type: 'invited'; email: string }
  | { type: 'already_invited'; email: string }

export async function addFriend(email: string): Promise<AddFriendResult> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  if (email === user.email) throw new Error('不能添加自己为好友')

  // 1. Search for registered user
  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (target) {
    // Check if already friends
    const [a, b] = [user.id, target.id].sort()
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_a', a)
      .eq('user_b', b)
      .maybeSingle()

    if (existing) return { type: 'already_friends' }

    // Check if already sent request
    const { data: sentReq } = await supabase
      .from('friend_requests')
      .select('id')
      .eq('from_user', user.id)
      .eq('to_user', target.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (sentReq) return { type: 'already_requested' }

    // Send request (or auto-accept if they already sent us one)
    const result = await sendFriendRequest(target.id)
    return result === 'auto_accepted' ? { type: 'auto_accepted' } : { type: 'request_sent' }
  }

  // 2. User not registered — check existing invitation
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('inviter_id', user.id)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInvite) return { type: 'already_invited', email }

  // 3. Create invitation
  const { data: invitation, error: insertErr } = await supabase
    .from('invitations')
    .insert({ inviter_id: user.id, email })
    .select('token')
    .single()
  if (insertErr || !invitation) throw new Error('创建邀请失败')

  // 4. Get inviter name
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  // 5. Send invitation email
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
