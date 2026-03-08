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

export async function addFriend(email: string): Promise<{ id: string }> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  const { data: target, error: findErr } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  if (findErr || !target) throw new Error('找不到该用户')
  if (target.id === user.id) throw new Error('不能加自己')

  const [a, b] = [user.id, target.id].sort()
  const { error } = await supabase.from('friendships').upsert({ user_a: a, user_b: b })
  if (error) throw error
  return target
}
