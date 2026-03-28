import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { adminListUsers, adminGenerateMagicLink, adminGetEmailStats } from '../lib/api/admin'
import type { AdminUser, EmailStats } from '../lib/api/admin'

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
      const [u, s] = await Promise.all([adminListUsers(), adminGetEmailStats()])
      setUsers(u)
      setEmailStats(s)
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
