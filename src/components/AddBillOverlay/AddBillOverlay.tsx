import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import BillSheet from '../SplitDetail/BillSheet'
import type { Member } from '../../lib/types'

interface AddBillOverlayProps {
    show: boolean
    onClose: () => void
    onCreated: () => void
}

export default function AddBillOverlay({ show, onClose, onCreated }: AddBillOverlayProps) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [showSheet, setShowSheet] = useState(false)
    const [friends, setFriends] = useState<Member[]>([])

    useEffect(() => {
        if (!user) return
        supabase
            .from('users')
            .select('id, name, emoji, color')
            .order('created_at', { ascending: true })
            .then(({ data }) => {
                if (data) setFriends(data as Member[])
            })
    }, [user])

    if (!show && !showSheet) return null

    return (
        <>
            {/* Options overlay */}
            {show && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
                            padding: '20px 16px calc(env(safe-area-inset-bottom, 16px) + 16px)',
                            width: '100%', maxWidth: 500,
                        }}
                    >
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--label1)', textAlign: 'center', marginBottom: 16 }}>
                            添加账单
                        </div>
                        <button
                            onClick={() => { onClose(); setTimeout(() => setShowSheet(true), 250) }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                background: 'var(--blue)', color: '#fff', fontSize: 16, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
                            }}
                        >
                            📝 手动输入
                        </button>
                        <button
                            onClick={() => { onClose(); setTimeout(() => navigate('/scan'), 250) }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                background: 'rgba(48,209,88,0.15)', color: 'var(--accent)', fontSize: 16, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
                            }}
                        >
                            📷 拍照 / 扫描
                        </button>
                        <button
                            onClick={() => { onClose(); setTimeout(() => navigate('/quick-bill'), 250) }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                background: 'rgba(94,92,230,0.15)', color: '#5e5ce6', fontSize: 16, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
                            }}
                        >
                            💬 一句话生成
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                background: 'var(--bg3)', color: 'var(--label2)', fontSize: 16,
                                cursor: 'pointer', fontFamily: 'inherit',
                            }}
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}

            {/* Create Bill Sheet */}
            {showSheet && (
                <BillSheet
                    friends={friends}
                    onClose={() => setShowSheet(false)}
                    onSaved={() => { setShowSheet(false); onCreated() }}
                />
            )}
        </>
    )
}
