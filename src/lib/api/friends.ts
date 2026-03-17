import { supabase } from '../supabase'
import type { Member } from '../types'
import { getCurrentUser } from './auth'
import { getInitial, getPinyinSortKey } from '../pinyin'


// ── Types ──

export interface FriendWithAlias extends Member {
  friendship_id: string
  alias?: string  // alias set by current user for this friend
  _pinyinInitial?: string
  _pinyinSortKey?: string
}

export interface FriendRequest {
  id: string
  from_user: string
  to_user: string
  status: string
  created_at: string
  user: { id: string; name: string; emoji: string } | null
}

export interface SearchUserResult {
  id: string
  name: string
  emoji: string
}

export type AddFriendResult =
  | { type: 'request_sent' }
  | { type: 'auto_accepted' }
  | { type: 'already_friends' }
  | { type: 'already_requested' }
  | { type: 'invited'; email: string }
  | { type: 'already_invited'; email: string }

// ── Get confirmed friends (with alias support) ──

export async function getFriends(): Promise<FriendWithAlias[]> {
  const user = await getCurrentUser()
  if (!user) return []

  // Try RPC first, fallback to direct query
  const { data, error } = await supabase.rpc('get_friends', { uid: user.id })

  if (!error && data) {
    // RPC returns basic Member[], augment with friendship/alias data
    const friends: FriendWithAlias[] = (data as Member[]).map(f => ({
      ...f,
      friendship_id: '',
    }))
    // Try to get alias data from friendships table
    const [r1, r2] = await Promise.all([
      supabase.from('friendships').select('id, user_b, alias_a').eq('user_a', user.id).eq('status', 'accepted'),
      supabase.from('friendships').select('id, user_a, alias_b').eq('user_b', user.id).eq('status', 'accepted'),
    ])
    const aliasMap: Record<string, { friendship_id: string; alias?: string }> = {}
      ; (r1.data || []).forEach((r: any) => {
        aliasMap[r.user_b] = { friendship_id: r.id, alias: r.alias_a || undefined }
      })
      ; (r2.data || []).forEach((r: any) => {
        aliasMap[r.user_a] = { friendship_id: r.id, alias: r.alias_b || undefined }
      })
    friends.forEach(f => {
      if (aliasMap[f.id]) {
        f.friendship_id = aliasMap[f.id].friendship_id
        f.alias = aliasMap[f.id].alias
      }
      f._pinyinInitial = getInitial(f.alias || f.name || '')
      f._pinyinSortKey = getPinyinSortKey(f.alias || f.name || '')
    })
    return friends
  }

  // Fallback: direct query
  const [r1, r2] = await Promise.all([
    supabase.from('friendships').select('id, user_b(id,name,emoji,color), alias_a').eq('user_a', user.id).eq('status', 'accepted'),
    supabase.from('friendships').select('id, user_a(id,name,emoji,color), alias_b').eq('user_b', user.id).eq('status', 'accepted'),
  ])
  const friends: FriendWithAlias[] = [
    ...(r1.data || []).map((r: any) => ({
      ...r.user_b,
      friendship_id: r.id,
      alias: r.alias_a || undefined,
    })),
    ...(r2.data || []).map((r: any) => ({
      ...r.user_a,
      friendship_id: r.id,
      alias: r.alias_b || undefined,
    })),
  ]

  friends.forEach(f => {
    f._pinyinInitial = getInitial(f.alias || f.name || '')
    f._pinyinSortKey = getPinyinSortKey(f.alias || f.name || '')
  })

  return friends
}

// ── Update alias for a friend ──

export async function updateFriendAlias(friendshipId: string, friendId: string, alias: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  // Determine which alias column to update based on user position
  const { data: friendship } = await supabase
    .from('friendships')
    .select('user_a, user_b')
    .eq('id', friendshipId)
    .single()

  if (!friendship) throw new Error('好友关系不存在')

  const column = friendship.user_a === user.id ? 'alias_a' : 'alias_b'
  const { error } = await supabase
    .from('friendships')
    .update({ [column]: alias || null })
    .eq('id', friendshipId)

  if (error) throw new Error('更新备注失败')
}

// ── Search user by email (RPC) ──

export async function searchUserByEmail(email: string): Promise<SearchUserResult | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  if (email === user.email) throw new Error('不能添加自己为好友')

  const { data, error } = await supabase.rpc('search_user_by_email', { search_email: email })
  if (error) throw new Error('搜索失败')
  return data && data.length > 0 ? data[0] : null
}

// ── Friend requests (using friend_requests table for backward compat) ──

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
    await supabase.rpc('accept_friend_request', { request_id: reverse.id })
    return 'auto_accepted'
  }

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
      ; (users || []).forEach((u: { id: string; name: string; emoji: string }) => { umap[u.id] = u })
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
      ; (users || []).forEach((u: { id: string; name: string; emoji: string }) => { umap[u.id] = u })
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

// ── Add friend ──

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
