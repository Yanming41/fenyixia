import { supabase } from '../supabase'
import { getCurrentUser } from './auth'

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

// ── Get all tags for current user ──

export async function getTags(): Promise<Tag[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_tags')
    .select('id, name, color, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw new Error('获取标签失败')
  return data || []
}

// ── Create a tag ──

export async function createTag(name: string, color: string = '#0A84FF'): Promise<Tag> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  const { data, error } = await supabase
    .from('user_tags')
    .insert({ user_id: user.id, name, color })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('标签已存在')
    throw new Error('创建标签失败')
  }
  return data
}

// ── Update a tag ──

export async function updateTag(tagId: string, name: string, color: string): Promise<void> {
  const { error } = await supabase
    .from('user_tags')
    .update({ name, color })
    .eq('id', tagId)

  if (error) throw new Error('更新标签失败')
}

// ── Delete a tag ──

export async function deleteTag(tagId: string): Promise<void> {
  const { error } = await supabase
    .from('user_tags')
    .delete()
    .eq('id', tagId)

  if (error) throw new Error('删除标签失败')
}

// ── Get tags assigned to a friendship ──

export async function getFriendTags(friendshipId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('friend_tags')
    .select('tag_id, user_tags:tag_id(id, name, color, created_at)')
    .eq('friendship_id', friendshipId)

  if (error) throw new Error('获取好友标签失败')
  return (data || []).map((d: any) => d.user_tags).filter(Boolean)
}

// ── Set tags for a friendship (replace all) ──

export async function setFriendTags(friendshipId: string, tagIds: string[]): Promise<void> {
  // Remove all existing tags for this friendship
  await supabase.from('friend_tags').delete().eq('friendship_id', friendshipId)

  // Insert new ones
  if (tagIds.length > 0) {
    const rows = tagIds.map(tagId => ({ tag_id: tagId, friendship_id: friendshipId }))
    const { error } = await supabase.from('friend_tags').insert(rows)
    if (error) throw new Error('设置标签失败')
  }
}
