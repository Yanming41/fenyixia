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
  dataFilter?: 'all' | 'mine'
  displayMode?: 'carousel' | 'list'
  onToggleFilter?: () => void
  onToggleDisplay?: () => void
}

export default function Header({ dataFilter, displayMode, onToggleFilter, onToggleDisplay }: HeaderProps) {
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
          {dataFilter === 'mine' ? '我的待付' : '账单记录'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onToggleFilter && (
            <button
              onClick={onToggleFilter}
              style={{
                background: dataFilter === 'mine' ? 'var(--orange)' : 'var(--bg3)',
                color: dataFilter === 'mine' ? '#fff' : 'var(--label2)',
                border: 'none', borderRadius: 8,
                padding: '5px 10px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {dataFilter === 'mine' ? '📋 全部' : '💰 我的'}
            </button>
          )}
          {onToggleDisplay && (
            <button
              onClick={onToggleDisplay}
              style={{
                background: 'var(--bg3)',
                color: 'var(--label2)',
                border: 'none', borderRadius: 8,
                padding: '5px 10px', fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {displayMode === 'list' ? '🃏' : '📋'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
