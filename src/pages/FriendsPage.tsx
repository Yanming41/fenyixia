import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'
import { addFriend } from '../lib/api/friends'
import BottomNav from '../components/Layout/BottomNav'

interface UserProfile {
    id: string
    name: string
    email: string
    emoji: string
    color: string
}

export default function FriendsPage({ onAddClick }: { onAddClick?: () => void }) {
    const { user } = useAuth()
    const { showToast } = useToast()
    const [members, setMembers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [adding, setAdding] = useState(false)

    const loadMembers = async () => {
        setLoading(true)
        setError('')
        try {
            const { data, error: err } = await supabase
                .from('users')
                .select('id, name, email, emoji, color')
                .order('created_at', { ascending: true })
            if (err) throw err
            setMembers(data || [])
        } catch {
            setError('加载失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMembers()
    }, [])

    const handleAdd = async () => {
        if (!email.trim()) return
        setAdding(true)
        try {
            const result = await addFriend(email.trim())
            if (result.type === 'added') {
                showToast('好友添加成功')
                loadMembers()
            } else if (result.type === 'invited') {
                showToast(`已发送邀请邮件到 ${result.email}`)
            } else if (result.type === 'already_invited') {
                showToast('已邀请过该用户，等待对方注册')
            }
            setEmail('')
        } catch (e) {
            showToast(e instanceof Error ? e.message : '添加失败')
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="app" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
            <div className="header">
                <div className="nav-row">
                    <div className="h-title">好友</div>
                </div>
            </div>

            <div style={{ padding: '12px 16px' }}>
                {/* Add friend form */}
                <div style={{
                    display: 'flex', gap: 8, marginBottom: 16,
                }}>
                    <input
                        type="email"
                        placeholder="输入邮箱添加好友"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--sep)',
                            background: 'var(--bg2)',
                            color: 'var(--label1)',
                            fontSize: 14,
                            fontFamily: 'inherit',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !email.trim()}
                        style={{
                            padding: '10px 16px',
                            borderRadius: 10,
                            border: 'none',
                            background: 'var(--blue)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            opacity: adding || !email.trim() ? 0.5 : 1,
                        }}
                    >
                        {adding ? '...' : '添加'}
                    </button>
                </div>

                {/* Member list */}
                {loading ? (
                    <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                        加载中...
                    </div>
                ) : error ? (
                    <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                        {error}
                    </div>
                ) : members.length === 0 ? (
                    <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                        暂无成员
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {members.map(m => (
                            <div key={m.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 14px',
                                borderRadius: 12,
                                background: 'var(--bg2)',
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: m.color || 'var(--bg4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, flexShrink: 0,
                                }}>
                                    {m.emoji || '😀'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--label1)' }}>
                                        {m.name || '未命名'}
                                    </div>
                                    {m.email && (
                                        <div style={{
                                            fontSize: 12, color: 'var(--label3)', marginTop: 2,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {m.email}
                                        </div>
                                    )}
                                </div>
                                {user && m.id === user.id && (
                                    <div style={{
                                        padding: '2px 8px',
                                        borderRadius: 8,
                                        background: 'rgba(48,209,88,0.15)',
                                        color: 'var(--accent)',
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}>
                                        我
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>



            <BottomNav onAddClick={onAddClick} />
        </div>
    )
}
