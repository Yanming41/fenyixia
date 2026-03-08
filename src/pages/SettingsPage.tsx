import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/Layout/BottomNav'

interface Profile {
    name: string
    emoji: string
    color: string
    email: string
}

export default function SettingsPage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<Profile | null>(null)

    useEffect(() => {
        if (!user) return
        supabase
            .from('users')
            .select('name, emoji, color, email')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data) setProfile(data as Profile)
            })
    }, [user])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="app" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
            <div className="header">
                <div className="nav-row">
                    <div className="h-title">设置</div>
                </div>
            </div>

            <div style={{ padding: '20px 16px' }}>
                {/* User profile card */}
                <div style={{
                    background: 'var(--bg2)',
                    borderRadius: 16,
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 20,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: profile?.color || 'var(--bg4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28,
                    }}>
                        {profile?.emoji || '😀'}
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--label1)' }}>
                            {profile?.name || '加载中'}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--label3)', marginTop: 4 }}>
                            {profile?.email || ''}
                        </div>
                    </div>
                </div>

                {/* Sign out button */}
                <button
                    onClick={handleSignOut}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 12,
                        border: 'none',
                        background: 'rgba(255,59,48,0.12)',
                        color: 'var(--red)',
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    退出登录
                </button>

                {/* Version */}
                <div style={{
                    textAlign: 'center',
                    color: 'var(--label3)',
                    fontSize: 12,
                    marginTop: 40,
                }}>
                    分一下 v0.1.0
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
