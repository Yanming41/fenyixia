import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useDebugConfig } from '../../contexts/DebugContext'

interface Profile {
  name: string
  emoji: string
  color: string
}

interface HeaderProps {
  viewMode?: 'carousel' | 'months'
  onToggleView?: () => void
}

export default function Header({ viewMode, onToggleView }: HeaderProps) {
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
        <div className="h-large">
          {viewMode === 'months' ? '月份账单' : '账单记录'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="h-sub">Split Bills</div>
          {onToggleView && (
            <button
              onClick={onToggleView}
              style={{
                background: viewMode === 'months' ? 'var(--blue)' : 'var(--bg3)',
                color: viewMode === 'months' ? '#fff' : 'var(--label2)',
                border: 'none', borderRadius: 8,
                padding: '4px 10px', fontSize: 16,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              📌
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
