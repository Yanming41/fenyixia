import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useGoogleIdentity } from '../hooks/useGoogleIdentity'
import { getApiToken, createApiToken, revokeApiToken, type ApiToken } from '../lib/api/apiTokens'
import { useToast } from '../contexts/ToastContext'
import BottomNav from '../components/Layout/BottomNav'

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bill-api`

function btnStyle(bg: string, color: string): React.CSSProperties {
    return {
        background: bg, color, border: 'none', borderRadius: 8,
        padding: '6px 12px', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
    }
}

export default function SettingsPage({ onAddClick }: { onAddClick?: () => void }) {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const { profile } = useProfile()
    const { googleIdentity, loading: googleLoading, error: googleError, link, unlink } = useGoogleIdentity()
    const { showToast } = useToast()
    const [apiToken, setApiToken] = useState<ApiToken | null>(null)
    const [tokenLoading, setTokenLoading] = useState(true)
    const [tokenWorking, setTokenWorking] = useState(false)
    const [showToken, setShowToken] = useState(false)

    useEffect(() => {
        getApiToken().then(setApiToken).finally(() => setTokenLoading(false))
    }, [])

    const handleGenerate = async () => {
        setTokenWorking(true)
        try {
            const t = await createApiToken()
            setApiToken(t)
            setShowToken(true)
            showToast('API Token 已生成')
        } catch { showToast('生成失败') }
        finally { setTokenWorking(false) }
    }

    const handleRevoke = async () => {
        if (!confirm('确定撤销 API Token？使用该 Token 的 AI 将无法再访问。')) return
        setTokenWorking(true)
        try {
            await revokeApiToken()
            setApiToken(null)
            setShowToken(false)
            showToast('Token 已撤销')
        } catch { showToast('撤销失败') }
        finally { setTokenWorking(false) }
    }

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        showToast('已复制')
    }

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

                {/* API Token */}
                <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: 'var(--label2)', fontWeight: 500, marginBottom: 10 }}>
                        AI API Token
                    </div>
                    {tokenLoading ? (
                        <div style={{ fontSize: 13, color: 'var(--label3)' }}>加载中...</div>
                    ) : apiToken ? (
                        <>
                            <div style={{
                                background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px',
                                fontFamily: 'monospace', fontSize: 12, color: 'var(--label1)',
                                wordBreak: 'break-all', marginBottom: 10, letterSpacing: 0.3,
                            }}>
                                {showToken ? apiToken.token : apiToken.token.slice(0, 8) + '•'.repeat(20)}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                <button onClick={() => setShowToken(s => !s)} style={btnStyle('var(--bg4)', 'var(--label2)')}>
                                    {showToken ? '隐藏' : '显示'}
                                </button>
                                <button onClick={() => handleCopy(apiToken.token)} style={btnStyle('var(--bg4)', 'var(--label2)')}>
                                    复制
                                </button>
                                <button onClick={handleGenerate} disabled={tokenWorking} style={btnStyle('rgba(10,132,255,0.12)', 'var(--blue)')}>
                                    重新生成
                                </button>
                                <button onClick={handleRevoke} disabled={tokenWorking} style={btnStyle('rgba(255,59,48,0.12)', 'var(--red)')}>
                                    撤销
                                </button>
                            </div>
                            {apiToken.last_used_at && (
                                <div style={{ fontSize: 11, color: 'var(--label3)' }}>
                                    最后使用：{new Date(apiToken.last_used_at).toLocaleString('zh-CN')}
                                </div>
                            )}
                            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--label3)', lineHeight: 1.6 }}>
                                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--label2)' }}>给 AI 的使用说明</div>
                                <div>Base URL: <span style={{ fontFamily: 'monospace' }}>{API_BASE}</span></div>
                                <div style={{ marginTop: 4 }}>Header: <span style={{ fontFamily: 'monospace' }}>Authorization: Bearer {'<token>'}</span></div>
                                <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--label2)' }}>接口</div>
                                <div>GET /contacts — 联系人列表</div>
                                <div>GET /bills?filter=all|pending|collect — 账单</div>
                                <div>GET /summary — 汇总金额</div>
                                <div>POST /bills — 创建账单</div>
                                <div>POST /bills/:id/mark-paid — 标记已付</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 13, color: 'var(--label3)', marginBottom: 10 }}>
                                生成一个 Token，让 AI 助手帮你管理账单
                            </div>
                            <button onClick={handleGenerate} disabled={tokenWorking} style={{
                                ...btnStyle('rgba(10,132,255,0.12)', 'var(--blue)'),
                                width: '100%', padding: '10px', fontSize: 14,
                            }}>
                                {tokenWorking ? '生成中...' : '生成 API Token'}
                            </button>
                        </>
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
