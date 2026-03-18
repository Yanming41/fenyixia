import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFriends } from '../../hooks/useFriends'
import { useGroups } from '../../hooks/useGroups'
import { useTags } from '../../hooks/useTags'
import BillSheet from '../SplitDetail/BillSheet'

interface AddBillOverlayProps {
    show: boolean
    onClose: () => void
    onCreated: () => void
}

export default function AddBillOverlay({ show, onClose, onCreated }: AddBillOverlayProps) {
    const navigate = useNavigate()
    const [showSheet, setShowSheet] = useState(false)
    const { friends } = useFriends()
    const { groups } = useGroups()
    const { tags } = useTags()

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
                    groups={groups}
                    tags={tags}
                    onClose={() => setShowSheet(false)}
                    onSaved={() => { setShowSheet(false); onCreated() }}
                />
            )}
        </>
    )
}
