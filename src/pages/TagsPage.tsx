import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { createTag, updateTag, deleteTag } from '../lib/api/tags'
import type { Tag } from '../lib/api/tags'
import { useTags, mutateTags } from '../hooks/useTags'
import BottomNav from '../components/Layout/BottomNav'

const TAG_COLORS = [
  '#0A84FF', '#30D158', '#FF9F0A', '#FF453A',
  '#BF5AF2', '#64D2FF', '#FF6482', '#FFD60A',
]

export default function TagsPage({ onAddClick }: { onAddClick?: () => void }) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { tags, loading: tagsLoading } = useTags()
  const loading = tagsLoading && tags.length === 0
  const [showCreate, setShowCreate] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const handleDelete = async (tagId: string) => {
    try {
      await deleteTag(tagId)
      showToast('标签已删除')
      mutateTags()
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
          <div className="h-title" style={{ flex: 1, textAlign: 'center' }}>标签</div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--blue)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            新建
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
            加载中...
          </div>
        ) : tags.length === 0 ? (
          <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 40, fontSize: 14 }}>
            暂无标签，点击右上角新建
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {tags.map(tag => (
              <div
                key={tag.id}
                onClick={() => setEditingTag(tag)}
                style={{
                  padding: '10px 18px', borderRadius: 16,
                  background: `${tag.color}20`, border: `1.5px solid ${tag.color}`,
                  color: tag.color, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tag Overlay */}
      {showCreate && (
        <TagFormOverlay
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); mutateTags() }}
        />
      )}

      {/* Edit Tag Overlay */}
      {editingTag && (
        <TagFormOverlay
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSaved={() => { setEditingTag(null); mutateTags() }}
          onDelete={() => { handleDelete(editingTag.id); setEditingTag(null) }}
        />
      )}

      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}

// ── Tag Form Overlay ──

function TagFormOverlay({
  tag,
  onClose,
  onSaved,
  onDelete,
}: {
  tag?: Tag
  onClose: () => void
  onSaved: () => void
  onDelete?: () => void
}) {
  const { showToast } = useToast()
  const [name, setName] = useState(tag?.name || '')
  const [color, setColor] = useState(tag?.color || TAG_COLORS[0]!)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (tag) {
        await updateTag(tag.id, name.trim(), color)
        showToast('标签已更新')
      } else {
        await createTag(name.trim(), color)
        showToast('标签已创建')
      }
      onSaved()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '操作失败')
    } finally {
      setSaving(false)
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
          padding: '24px 20px calc(env(safe-area-inset-bottom, 16px) + 20px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--label1)', marginBottom: 16 }}>
          {tag ? '编辑标签' : '新建标签'}
        </div>

        {/* Tag name */}
        <input
          type="text"
          placeholder="标签名称"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            border: '1px solid var(--sep)', background: 'var(--bg3)',
            color: 'var(--label1)', fontSize: 14, fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box', marginBottom: 16,
          }}
        />

        {/* Color picker */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label2)', marginBottom: 8 }}>
          颜色
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {TAG_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: c, cursor: 'pointer',
                border: color === c ? '3px solid var(--label1)' : '3px solid transparent',
              }}
            />
          ))}
        </div>

        {/* Preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'inline-block', padding: '8px 16px', borderRadius: 16,
            background: `${color}20`, border: `1.5px solid ${color}`,
            color: color, fontSize: 14, fontWeight: 600,
          }}>
            {name || '预览'}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                padding: '12px 16px', borderRadius: 10, border: 'none',
                background: 'rgba(255, 69, 58, 0.15)', color: 'var(--red)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              删除
            </button>
          )}
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
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: 'none',
              background: 'var(--blue)', color: '#fff', fontSize: 15,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              opacity: saving || !name.trim() ? 0.5 : 1,
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
