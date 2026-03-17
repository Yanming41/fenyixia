import { useCallback } from 'react'
import useSWR from 'swr'
import type { UserIdentity } from '@supabase/supabase-js'
import { getGoogleIdentity, linkGoogle, unlinkGoogle } from '../lib/api/auth'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UseGoogleIdentityReturn {
  googleIdentity: UserIdentity | null
  loading: boolean
  error: string | null
  link: () => Promise<void>
  unlink: () => Promise<void>
  refresh: () => Promise<void>
}

export function useGoogleIdentity(): UseGoogleIdentityReturn {
  const { user } = useAuth()

  const { data, isLoading, error: swrError, mutate } = useSWR(
    user ? 'google-identity' : null,
    () => getGoogleIdentity(),
  )

  const link = useCallback(async () => {
    try {
      await linkGoogle()
      // OAuth will redirect — no need to refresh here
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('already linked') || msg.includes('identity_already_exists')) {
        throw new Error('此 Google 账号已被其他用户绑定')
      }
      throw new Error(msg || '绑定失败，请重试')
    }
  }, [])

  const unlink = useCallback(async () => {
    if (!data) return
    // Check if this is the only identity
    const { data: identitiesData } = await supabase.auth.getUserIdentities()
    if (identitiesData && identitiesData.identities.length <= 1) {
      throw new Error('无法解绑，这是你唯一的登录方式')
    }
    await unlinkGoogle(data)
    mutate(null, { revalidate: false })
  }, [data, mutate])

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    googleIdentity: data ?? null,
    loading: isLoading,
    error: swrError ? (swrError instanceof Error ? swrError.message : '获取绑定状态失败') : null,
    link,
    unlink,
    refresh,
  }
}
