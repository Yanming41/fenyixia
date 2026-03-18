import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useFriends } from '../hooks/useFriends'
import { createGroup, deleteGroup } from '../lib/api/groups'
import { useGroups, mutateGroups } from '../hooks/useGroups'
import BottomNav from '../components/Layout/BottomNav'

export default function GroupsPage({ onAddClick }: { onAddClick?: () => void }) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { groups, loading: groupsLoading } = useGroups()
  const loading = groupsLoading && groups.length === 0
  const [showCreate, setShowCreate] = useState(false)

  const handleDelete = async (groupId: string) => {
    try {
      await deleteGroup(groupId)
      showToast('已删除群聊')
      mutateGroups()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '删除失败')
    }
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
          <div className="h-title" style={{ flex: 1, textAlign: 'center' }}>群聊</div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--blue)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            创建
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
            加载中...
          </div>
        ) : groups.length === 0 ? (
          <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
            暂无群聊，点击右上角创建
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {groups.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px', borderRadius: 12, background: 'var(--bg2)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--bg3)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  flexShrink: 0,
                }}>
                  {g.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--label1)' }}>
                    {g.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--label3)', marginTop: 2 }}>
                    {g.members.length} 人
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {g.members.slice(0, 3).map(m => (
                    <div key={m.id} style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: m.color || 'var(--bg4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12,
                    }}>
                      {m.emoji || '😀'}
                    </div>
                  ))}
                  {g.members.length > 3 && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--bg4)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: 'var(--label3)',
                    }}>
                      +{g.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Overlay */}
      {showCreate && (
        <CreateGroupOverlay
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); mutateGroups() }}
        />
      )}

      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}

// ── Create Group Overlay ──

function CreateGroupOverlay({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👥')
  const { friends } = useFriends()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const toggleFriend = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createGroup(name.trim(), emoji, selectedIds)
      showToast('群聊已创建')
      onCreated()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '创建失败')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--bg2)', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 430,
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 16px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--label1)', marginBottom: 16 }}>
            创建群聊
          </div>

          {/* Group name */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              type="text"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              style={{
                width: 48, padding: '10px', borderRadius: 10, textAlign: 'center',
                border: '1px solid var(--sep)', background: 'var(--bg3)',
                color: 'var(--label1)', fontSize: 20, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="群聊名称"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--sep)', background: 'var(--bg3)',
                color: 'var(--label1)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Select friends */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label2)', marginBottom: 8 }}>
            选择成员 ({selectedIds.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {friends.map(f => {
              const selected = selectedIds.includes(f.id)
              return (
                <div
                  key={f.id}
                  onClick={() => toggleFriend(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: selected ? 'rgba(10, 132, 255, 0.1)' : 'var(--bg3)',
                    border: selected ? '1px solid var(--blue)' : '1px solid transparent',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: f.color || 'var(--bg4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {f.emoji || '😀'}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, color: 'var(--label1)' }}>
                    {f.alias || f.name}
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: selected ? 'none' : '2px solid var(--sep)',
                    background: selected ? 'var(--blue)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                  }}>
                    {selected ? '✓' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Fixed buttons at bottom */}
        <div style={{ padding: '12px 20px calc(env(safe-area-inset-bottom, 16px) + 12px)', display: 'flex', gap: 10, borderTop: '1px solid var(--sep)' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: 'none',
              background: 'var(--bg3)', color: 'var(--label2)', fontSize: 15,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: 'none',
              background: 'var(--blue)', color: '#fff', fontSize: 15,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              opacity: creating || !name.trim() ? 0.5 : 1,
            }}
          >
            {creating ? '创建中...' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}
