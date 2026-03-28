import { supabase } from '../supabase'

const ADMIN_OPS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ops`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

async function callAdminOps(action: string, params: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(ADMIN_OPS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({ action, ...params }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Admin API error ${res.status}`)
  return data
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  emoji: string | null
  created_at: string
  last_sign_in_at: string | null
}

export interface EmailLogEntry {
  recipient_email: string
  email_type: string
  sent_at: string
}

export interface EmailStats {
  last_hour: number
  last_day: number
  recent: EmailLogEntry[]
}

export async function adminListUsers(): Promise<AdminUser[]> {
  const data = await callAdminOps('list_users')
  return data.users
}

export async function adminGenerateMagicLink(email: string): Promise<string> {
  const data = await callAdminOps('generate_magic_link', { email })
  return data.action_link
}

export async function adminGetEmailStats(): Promise<EmailStats> {
  return callAdminOps('get_email_stats')
}
