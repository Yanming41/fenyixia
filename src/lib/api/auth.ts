import { supabase } from '../supabase'
import type { User as SupabaseUser, UserIdentity } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  emoji?: string,
  color?: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
    },
  })
  if (error) throw error

  if (data.user) {
    await supabase.from('users').upsert({
      id: data.user.id,
      email,
      name,
      emoji: emoji || '😀',
      color: color || '#1c1c26',
    })
  }
  return data
}

export async function resendVerification(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
    },
  })
  if (error) throw error
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function onAuthChange(callback: (user: SupabaseUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
}

// ── Google OAuth ──────────────────────────────────────

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
  })
  if (error) throw error
}

export async function getGoogleIdentity(): Promise<UserIdentity | null> {
  const { data, error } = await supabase.auth.getUserIdentities()
  if (error) throw error
  return data.identities.find(i => i.provider === 'google') ?? null
}

export async function linkGoogle() {
  const { error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}settings` },
  })
  if (error) throw error
}

export async function unlinkGoogle(identity: UserIdentity) {
  const { error } = await supabase.auth.unlinkIdentity(identity)
  if (error) throw error
}
