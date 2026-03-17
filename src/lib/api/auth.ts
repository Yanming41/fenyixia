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

export function onAuthChange(callback: (user: SupabaseUser | null, event: string) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event)
  })
}

export async function verifySession(): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser()
  return !error && !!user
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

  // Auto-create friend requests from inviters
  if (user.email) {
    try {
      const { data: invitations } = await supabase
        .from('invitations')
        .select('inviter_id')
        .eq('email', user.email)
        .eq('status', 'pending')
      if (invitations && invitations.length > 0) {
        // Mark invitations as accepted
        await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('email', user.email)
          .eq('status', 'pending')
        // Create friend requests from each inviter to this new user
        const requests = invitations.map(inv => ({
          from_user: inv.inviter_id,
          to_user: user.id,
          status: 'pending',
        }))
        await supabase.from('friend_requests').upsert(requests, { onConflict: 'from_user,to_user' })
      }
    } catch (e) {
      console.error('Auto-friend-request failed:', e)
    }
  }
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
