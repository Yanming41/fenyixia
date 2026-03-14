import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGoogleIdentity } from '../hooks/useGoogleIdentity'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/Layout/BottomNav'

interface Profile {
    name: string
    emoji: string
    color: string
    email: string
}

export default function SettingsPage({ onAddClick }: { onAddClick?: () => void }) {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<Profile | null>(null)
    const { googleIdentity, loading: googleLoading, error: googleError, link, unlink } = useGoogleIdentity()

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

                {/* Account linking */}
                <div style={{
                    background: 'var(--bg2)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    marginBottom: 20,
                }}>
                    <div style={{ fontSize: 13, color: 'var(--label2)', fontWeight: 500, marginBottom: 10 }}>
                        账号绑定
                    </div>
                    {googleLoading ? (
                        <div style={{ fontSize: 13, color: 'var(--label3)' }}>加载中...</div>
                    ) : googleIdentity ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--label)' }}>
                                    Google
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--label3)', marginTop: 2 }}>
                                    {googleIdentity.identity_data?.email || '已绑定'}
                                </div>
                            </div>
                            <button
                                onClick={unlink}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: 'rgba(255,59,48,0.12)',
                                    color: 'var(--red)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                解绑
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={link}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 8,
                                border: 'none',
                                background: 'rgba(10,132,255,0.12)',
                                color: 'var(--blue)',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            绑定 Google 账号
                        </button>
                    )}
                    {googleError && (
                        <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>
                            {googleError}
                        </div>
                    )}
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

            <BottomNav onAddClick={onAddClick} />
        </div>
    )
}
