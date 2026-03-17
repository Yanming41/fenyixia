import { useState, useCallback } from 'react'
import type { Member } from '../../lib/types'
import type { ScanResultItem } from '../../lib/api/scan'

interface MemberAssignmentProps {
  items: ScanResultItem[]
  members: Member[]
  assignments: Record<number, Set<string>>
  onAssignmentsChange: (assignments: Record<number, Set<string>>) => void
}

export default function MemberAssignment({ items, members, assignments, onAssignmentsChange }: MemberAssignmentProps) {
  const [dragMid, setDragMid] = useState<string | null>(null)

  const toggleAssignment = useCallback((itemIdx: number, memberId: string) => {
    const next = { ...assignments }
    const set = new Set(next[itemIdx] || [])
    if (set.has(memberId)) {
      set.delete(memberId)
    } else {
      set.add(memberId)
    }
    next[itemIdx] = set
    onAssignmentsChange(next)
  }, [assignments, onAssignmentsChange])

  // Calculate per-person amounts
  const perPersonAmounts: Record<string, number> = {}
  members.forEach(m => { perPersonAmounts[m.id] = 0 })
  items.forEach((item, idx) => {
    const assigned = assignments[idx]
    if (!assigned || assigned.size === 0) return
    const share = (item.price * (item.qty || 1)) / assigned.size
    assigned.forEach(mid => {
      perPersonAmounts[mid] = (perPersonAmounts[mid] || 0) + share
    })
  })

  return (
    <div className="scanner-assignment">
      <div className="scanner-section-title">成员分配</div>
      <div className="scanner-section-hint">点击头像切换分配状态</div>

      {/* Dock: draggable member avatars */}
      <div className="scanner-assign-dock">
        {members.map(m => (
          <div
            key={m.id}
            className={`scanner-assign-avatar${dragMid === m.id ? ' dragging' : ''}`}
            style={{ background: m.color || 'var(--bg3)' }}
            onPointerDown={() => setDragMid(m.id)}
            onPointerUp={() => setDragMid(null)}
          >
            {m.emoji || '😀'}
            <div className="scanner-assign-amount">
              CA${(perPersonAmounts[m.id] || 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Per-item assignment toggles */}
      <div className="scanner-assign-items">
        {items.map((item, idx) => (
          <div key={idx} className="scanner-assign-row">
            <span className="scanner-assign-item-name">{item.name}</span>
            <div className="scanner-assign-members">
              {members.map(m => {
                const isAssigned = assignments[idx]?.has(m.id) ?? false
                return (
                  <button
                    key={m.id}
                    className={`scanner-assign-tag${isAssigned ? ' assigned' : ''}`}
                    style={{ background: isAssigned ? (m.color || 'var(--accent)') : 'var(--bg3)' }}
                    onClick={() => toggleAssignment(idx, m.id)}
                  >
                    {m.emoji}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
