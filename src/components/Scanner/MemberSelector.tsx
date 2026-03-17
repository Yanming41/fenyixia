import type { Member } from '../../lib/types'

interface MemberSelectorProps {
  allMembers: Member[]
  selected: Member[]
  onToggle: (member: Member) => void
}

export default function MemberSelector({ allMembers, selected, onToggle }: MemberSelectorProps) {
  return (
    <div className="scanner-member-selector">
      <div className="scanner-section-title">选择参与成员</div>
      <div className="scanner-member-list">
        {allMembers.map(m => {
          const isSel = selected.some(s => s.id === m.id)
          return (
            <button
              key={m.id}
              className={`scanner-member-bubble${isSel ? ' selected' : ''}`}
              onClick={() => {
                if (isSel && selected.length <= 1) return
                onToggle(m)
              }}
            >
              <div className="scanner-member-avatar" style={{ background: m.color || 'var(--bg3)' }}>
                {m.emoji || '😀'}
              </div>
              <div className="scanner-member-name">{m.name || '我'}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
