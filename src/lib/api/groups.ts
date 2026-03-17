import { supabase } from '../supabase'
import type { Member } from '../types'
import { getCurrentUser } from './auth'

export interface Group {
  id: string
  name: string
  emoji: string
  owner_id: string
  created_at: string
  members: Member[]
}

// ── Get all groups the user is a member of ──

export async function getGroups(): Promise<Group[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('groups')
    .select('id, name, emoji, owner_id, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error('获取群聊失败')

  // Fetch members for each group
  const groups: Group[] = (data || []).map(g => ({ ...g, members: [] }))
  if (groups.length === 0) return groups

  const groupIds = groups.map(g => g.id)
  const { data: membersData } = await supabase
    .from('group_members')
    .select('group_id, user_id, users:user_id(id, name, emoji, color)')
    .in('group_id', groupIds)

  const membersByGroup: Record<string, Member[]> = {}
  ;(membersData || []).forEach((m: any) => {
    if (!membersByGroup[m.group_id]) membersByGroup[m.group_id] = []
    if (m.users) membersByGroup[m.group_id]!.push(m.users)
  })
  groups.forEach(g => { g.members = membersByGroup[g.id] || [] })

  return groups
}

// ── Create a group ──

export async function createGroup(name: string, emoji: string, memberIds: string[]): Promise<Group> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, emoji, owner_id: user.id })
    .select()
    .single()

  if (error || !group) throw new Error('创建群聊失败')

  // Add all selected members + the creator
  const allMemberIds = [...new Set([user.id, ...memberIds])]
  const rows = allMemberIds.map(uid => ({ group_id: group.id, user_id: uid }))
  await supabase.from('group_members').insert(rows)

  return { ...group, members: [] }
}

// ── Update group ──

export async function updateGroup(groupId: string, name: string, emoji: string): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .update({ name, emoji })
    .eq('id', groupId)

  if (error) throw new Error('更新群聊失败')
}

// ── Delete group ──

export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) throw new Error('删除群聊失败')
}

// ── Add members to group ──

export async function addGroupMembers(groupId: string, userIds: string[]): Promise<void> {
  const rows = userIds.map(uid => ({ group_id: groupId, user_id: uid }))
  const { error } = await supabase.from('group_members').upsert(rows, { onConflict: 'group_id,user_id' })
  if (error) throw new Error('添加成员失败')
}

// ── Remove member from group ──

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) throw new Error('移除成员失败')
}
