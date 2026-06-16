import { supabase } from '../supabase'
import { getCurrentUser } from './auth'

export interface ApiToken {
  id: string
  token: string
  name: string
  created_at: string
  last_used_at: string | null
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `fyx_${hex}`
}

export async function getApiToken(): Promise<ApiToken | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data } = await supabase
    .from('api_tokens')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data ?? null
}

export async function createApiToken(name = 'AI Token'): Promise<ApiToken> {
  const user = await getCurrentUser()
  if (!user) throw new Error('未登录')

  // Delete any existing tokens first (one token per user)
  await supabase.from('api_tokens').delete().eq('user_id', user.id)

  const token = generateToken()
  const { data, error } = await supabase
    .from('api_tokens')
    .insert({ user_id: user.id, token, name })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function revokeApiToken(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return
  await supabase.from('api_tokens').delete().eq('user_id', user.id)
}
