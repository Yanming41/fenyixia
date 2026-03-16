import { supabase } from '../supabase'
import type { User as SupabaseUser, UserIdentity } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
    },
  })
  if (error) throw error
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

// ── Profile ──────────────────────────────────────────

export async function checkProfileCompleted(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('profile_completed')
    .eq('id', userId)
    .maybeSingle()
  return data?.profile_completed === true
}

export async function updateProfile(name: string, emoji: string, color: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')
  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    name,
    emoji,
    color,
    profile_completed: true,
  })
  if (error) throw error
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
