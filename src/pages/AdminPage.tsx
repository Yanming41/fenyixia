import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { adminListUsers, adminGenerateMagicLink, adminGetEmailStats, adminGetTokenStats } from '../lib/api/admin'
import type { AdminUser, EmailStats, TokenStat } from '../lib/api/admin'

const ADMIN_EMAIL = 'yiming4144@gmail.com'
const HOUR_LIMIT = 3

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function RateIndicator({ count }: { count: number }) {
  const color = count >= HOUR_LIMIT ? '#FF3B30' : count >= HOUR_LIMIT - 1 ? '#FF9500' : '#30D158'
  const label = count >= HOUR_LIMIT ? '已达上限' : count >= HOUR_LIMIT - 1 ? '接近上限' : '正常'
  return (
    <span className="admin-rate-dot" style={{ background: color }} title={label} />
  )
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [tokenStats, setTokenStats] = useState<TokenStat[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [impersonating, setImpersonating] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/', { replace: true })
      return
    }
    loadData()
  }, [user, loading])

  async function loadData() {
    setLoadingData(true)
    setError('')
    try {
      const [u, s, t] = await Promise.all([adminListUsers(), adminGetEmailStats(), adminGetTokenStats()])
      setUsers(u)
      setEmailStats(s)
      setTokenStats(t)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingData(false)
    }
  }

  async function handleImpersonate(targetEmail: string) {
    setImpersonating(targetEmail)
    try {
      const link = await adminGenerateMagicLink(targetEmail)
      window.location.href = link
    } catch (e) {
      setError((e as Error).message)
      setImpersonating(null)
    }
  }

  if (loading || (!user && !loading)) return null

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="admin-back" onClick={() => navigate('/')}>← 返回</button>
        <h1 className="admin-title">管理员面板</h1>
      </div>

      {error && (
        <div className="admin-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {loadingData ? (
        <div className="admin-loading">加载中...</div>
      ) : (
        <>
          {/* Email Stats */}
          <section className="admin-section">
            <div className="admin-section-title">
              邮件发送追踪
              <span className="admin-section-note">
                （仅追踪通过「分一下」发送的邀请邮件，Supabase 系统邮件不在此范围）
              </span>
            </div>

            <div className="admin-stat-cards">
              <div className="admin-stat-card">
                <div className="admin-stat-row">
                  {emailStats && <RateIndicator count={emailStats.last_hour} />}
                  <span className="admin-stat-value">{emailStats?.last_hour ?? '—'}</span>
                  <span className="admin-stat-label">/ 最近1小时</span>
                </div>
                <div className="admin-stat-limit">免费限额 {HOUR_LIMIT} 封/小时</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-row">
                  <span className="admin-stat-value">{emailStats?.last_day ?? '—'}</span>
                  <span className="admin-stat-label">/ 最近24小时</span>
                </div>
                <div className="admin-stat-limit">免费限额 ~50 封/天</div>
              </div>
            </div>

            {emailStats && emailStats.recent.length > 0 && (
              <div className="admin-email-log">
                <div className="admin-log-header">最近发送记录</div>
                {emailStats.recent.map((entry, i) => (
                  <div key={i} className="admin-log-row">
                    <span className="admin-log-time">{fmtDate(entry.sent_at)}</span>
                    <span className="admin-log-type">{entry.email_type}</span>
                    <span className="admin-log-email">{entry.recipient_email}</span>
                  </div>
                ))}
              </div>
            )}
            {emailStats && emailStats.recent.length === 0 && (
              <div className="admin-empty">暂无发送记录</div>
            )}
          </section>

          {/* Token Usage */}
          <section className="admin-section">
            <div className="admin-section-title">AI Token 消耗统计</div>
            {tokenStats.length === 0 ? (
              <div className="admin-empty">暂无记录</div>
            ) : (
              <div className="admin-token-table">
                <div className="admin-token-header">
                  <span>用户</span>
                  <span>调用次数</span>
                  <span>输入 tokens</span>
                  <span>输出 tokens</span>
                  <span>预估费用</span>
                </div>
                {tokenStats.map(s => {
                  const costUsd = (s.input_tokens / 1_000_000) * 3 + (s.output_tokens / 1_000_000) * 15
                  return (
                    <div key={s.user_id} className="admin-token-row">
                      <span className="admin-token-user">
                        <span>{s.emoji}</span>
                        <span className="admin-token-name">{s.name}</span>
                      </span>
                      <span className="admin-token-num">{s.calls}</span>
                      <span className="admin-token-num">{s.input_tokens.toLocaleString()}</span>
                      <span className="admin-token-num">{s.output_tokens.toLocaleString()}</span>
                      <span className="admin-token-cost">${costUsd.toFixed(3)}</span>
                    </div>
                  )
                })}
                <div className="admin-token-total">
                  <span>合计</span>
                  <span>{tokenStats.reduce((s, r) => s + r.calls, 0)} 次</span>
                  <span>{tokenStats.reduce((s, r) => s + r.input_tokens, 0).toLocaleString()}</span>
                  <span>{tokenStats.reduce((s, r) => s + r.output_tokens, 0).toLocaleString()}</span>
                  <span>${tokenStats.reduce((sum, r) => sum + r.input_tokens / 1e6 * 3 + r.output_tokens / 1e6 * 15, 0).toFixed(3)}</span>
                </div>
              </div>
            )}
          </section>

          {/* User List */}
          <section className="admin-section">
            <div className="admin-section-title">
              注册用户 <span className="admin-count">({users.length})</span>
            </div>
            {users.length === 0 && <div className="admin-empty">暂无用户</div>}
            {users.map(u => (
              <div key={u.id} className="admin-user-row">
                <div className="admin-user-avatar">{u.emoji ?? '👤'}</div>
                <div className="admin-user-info">
                  <div className="admin-user-name">{u.name ?? '（未设置昵称）'}</div>
                  <div className="admin-user-email">{u.email}</div>
                  <div className="admin-user-meta">
                    注册于 {fmtDate(u.created_at)}
                    {u.last_sign_in_at && ` · 最近登录 ${fmtDate(u.last_sign_in_at)}`}
                  </div>
                </div>
                {u.email !== ADMIN_EMAIL && (
                  <button
                    className="admin-impersonate-btn"
                    disabled={impersonating === u.email}
                    onClick={() => handleImpersonate(u.email!)}
                  >
                    {impersonating === u.email ? '跳转中...' : '切换登录'}
                  </button>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
