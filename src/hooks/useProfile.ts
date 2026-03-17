import useSWR, { mutate } from 'swr'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface Profile {
  name: string
  emoji: string
  color: string
  email: string
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('users')
    .select('name, emoji, color, email')
    .eq('id', userId)
    .single()
  return data as Profile | null
}

export function useProfile() {
  const { user } = useAuth()

  const { data: profile, isLoading } = useSWR(
    user ? `profile:${user.id}` : null,
    () => fetchProfile(user!.id),
  )

  return { profile: profile ?? null, loading: isLoading }
}

export function mutateProfile() {
  // Invalidate all profile keys
  return mutate(key => typeof key === 'string' && key.startsWith('profile:'))
}
