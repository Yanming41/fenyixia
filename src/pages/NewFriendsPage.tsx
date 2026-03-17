import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import {
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../lib/api/friends'
import { useReceivedRequests, useSentRequests, mutateAllFriendData } from '../hooks/useFriends'
import BottomNav from '../components/Layout/BottomNav'

export default function NewFriendsPage({ onAddClick }: { onAddClick?: () => void }) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { received, loading: receivedLoading } = useReceivedRequests()
  const { sent, loading: sentLoading } = useSentRequests()
  const loading = (receivedLoading && received.length === 0) || (sentLoading && sent.length === 0)

  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!email.trim()) return
    setAdding(true)
    try {
      const result = await addFriend(email.trim())
      switch (result.type) {
        case 'request_sent': showToast('好友申请已发送'); break
        case 'auto_accepted': showToast('已互相添加为好友'); break
        case 'already_friends': showToast('对方已是你的好友'); break
        case 'already_requested': showToast('已发送过申请，等待对方确认'); break
        case 'invited': showToast(`已发送邀请邮件到 ${result.email}`); break
        case 'already_invited': showToast('已邀请过该用户，等待对方注册'); break
      }
      setEmail('')
      mutateAllFriendData()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败')
    } finally {
      setAdding(false)
    }
  }

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id)
      showToast('已添加好友')
      mutateAllFriendData()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id)
      showToast('已拒绝')
      mutateAllFriendData()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败')
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  return (
    <div className="app" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
      <div className="header">
        <div className="nav-row">
          <button
            onClick={() => navigate('/contacts')}
            style={{
              background: 'none', border: 'none', color: 'var(--blue)',
              fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0',
            }}
          >
            ‹ 通讯录
          </button>
          <div className="h-title" style={{ flex: 1, textAlign: 'center' }}>新的朋友</div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Search / Add */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="email"
            placeholder="输入邮箱搜索 / 添加好友"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1px solid var(--sep)', background: 'var(--bg2)',
              color: 'var(--label1)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              opacity: adding || !email.trim() ? 0.5 : 1,
            }}
          >
            {adding ? '...' : '添加'}
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
            加载中...
          </div>
        ) : (
          <>
            {/* Received requests */}
            {received.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label2)', marginBottom: 8 }}>
                  好友申请 ({received.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {received.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(255, 159, 10, 0.06)',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--bg4)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>
                        {r.user?.emoji || '😀'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--label1)' }}>
                          {r.user?.name || '未知用户'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--label3)', marginTop: 1 }}>
                          {timeAgo(r.created_at)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAccept(r.id)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none',
                          background: 'var(--green)', color: '#fff', fontSize: 13,
                          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none',
                          background: 'var(--bg3)', color: 'var(--label2)', fontSize: 13,
                          fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        拒绝
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent requests */}
            {sent.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label2)', marginBottom: 8 }}>
                  已发送 ({sent.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sent.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 12,
                      background: 'var(--bg2)', opacity: 0.7,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--bg4)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>
                        {r.user?.emoji || '😀'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--label1)' }}>
                          {r.user?.name || '未知用户'}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: 'rgba(255,159,10,0.1)', color: 'var(--orange)',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        等待确认
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {received.length === 0 && sent.length === 0 && (
              <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                暂无好友申请
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}
