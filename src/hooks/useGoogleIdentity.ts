import { useState, useEffect, useCallback } from 'react'
import type { UserIdentity } from '@supabase/supabase-js'
import { getGoogleIdentity, linkGoogle, unlinkGoogle } from '../lib/api/auth'
import { supabase } from '../lib/supabase'

interface UseGoogleIdentityReturn {
  googleIdentity: UserIdentity | null
  loading: boolean
  error: string | null
  link: () => Promise<void>
  unlink: () => Promise<void>
  refresh: () => Promise<void>
}

export function useGoogleIdentity(): UseGoogleIdentityReturn {
  const [googleIdentity, setGoogleIdentity] = useState<UserIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const identity = await getGoogleIdentity()
      setGoogleIdentity(identity)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取绑定状态失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const link = useCallback(async () => {
    try {
      setError(null)
      await linkGoogle()
      // OAuth will redirect — no need to refresh here
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('already linked') || msg.includes('identity_already_exists')) {
        setError('此 Google 账号已被其他用户绑定')
      } else {
        setError(msg || '绑定失败，请重试')
      }
    }
  }, [])

  const unlink = useCallback(async () => {
    if (!googleIdentity) return

    try {
      setError(null)
      // Check if this is the only identity
      const { data } = await supabase.auth.getUserIdentities()
      if (data && data.identities.length <= 1) {
        setError('无法解绑，这是你唯一的登录方式')
        return
      }

      await unlinkGoogle(googleIdentity)
      setGoogleIdentity(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(msg || '解绑失败，请重试')
    }
  }, [googleIdentity])

  return { googleIdentity, loading, error, link, unlink, refresh }
}
