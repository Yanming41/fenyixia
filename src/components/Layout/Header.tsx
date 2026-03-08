import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useDebugConfig } from '../../contexts/DebugContext'

interface Profile {
  name: string
  emoji: string
  color: string
}

export default function Header() {
  const { user } = useAuth()
  const { setIsDebugOpen } = useDebugConfig()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clickCount, setClickCount] = useState(0)

  const handleLogoClick = () => {
    const nextCount = clickCount + 1
    if (nextCount >= 5) {
      setIsDebugOpen(true)
      setClickCount(0)
    } else {
      setClickCount(nextCount)
      setTimeout(() => setClickCount(0), 2000)
    }
  }

  useEffect(() => {
    if (!user) return
    supabase
      .from('users')
      .select('name, emoji, color')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile)
      })
  }, [user])


  return (
    <div className="header">
      <div className="nav-row">
        <div className="h-title" id="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>分一下</div>
        <div className="av-wrap">
          {/* The snippet shows the old avatar div, not the new Avatar component.
              I will keep the old div as per the snippet's explicit content. */}
          <div
            className="av"
            style={profile?.color ? { background: profile.color } : undefined}
          >
            {profile?.emoji || '😀'}
          </div>
          <div className="av-name">{profile?.name || '加载中'}</div>
        </div>
      </div>
      <div className="large-title-row">
        <div className="h-large">账单记录</div>
        <div className="h-sub">Split Bills</div>
      </div>
    </div>
  )
}
