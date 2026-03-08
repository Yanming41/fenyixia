import type { Bill } from '../../lib/types'
import { fmtMoney } from '../../lib/utils'

interface SummaryCardsProps {
  bills: Bill[]
  currentUserId: string
}

export default function SummaryCards({ bills, currentUserId }: SummaryCardsProps) {
  let collected = 0
  let collectPending = 0
  let paid = 0
  let owePending = 0

  bills.forEach(b => {
    const isPayer = b.payer_id === currentUserId

    if (isPayer) {
      // Calculate per-member shares for bills I paid
      const proofUsers = b._proofUserIds || new Set<string>()
      const memberShares: Record<string, number> = {}

      ;(b.items || []).forEach(item => {
        const n = (item.members || []).length || 1
        const share = (item.price * (item.qty || 1)) / n
        ;(item.members || []).forEach(m => {
          if (m.id !== b.payer_id) {
            memberShares[m.id] = (memberShares[m.id] || 0) + share
          }
        })
      })

      Object.entries(memberShares).forEach(([uid, amount]) => {
        if (b.settled || proofUsers.has(uid)) {
          collected += amount
        } else {
          collectPending += amount
        }
      })
    } else {
      // I owe someone
      const myShare = b.my_share || b.per_amount
      if (b.settled || b._hasMeProof) {
        paid += myShare
      } else {
        owePending += myShare
      }
    }
  })

  return (
    <div className="summary">
      <div className="sc">
        <div className="sc-label">已收回</div>
        <div className="sc-val g">+{fmtMoney(collected)}</div>
      </div>
      <div className="sc">
        <div className="sc-label">待收回</div>
        <div className="sc-val g dim">+{fmtMoney(collectPending)}</div>
      </div>
      <div className="sc">
        <div className="sc-label">已还款</div>
        <div className="sc-val r">-{fmtMoney(paid)}</div>
      </div>
      <div className="sc">
        <div className="sc-label">待还款</div>
        <div className="sc-val r dim">-{fmtMoney(owePending)}</div>
      </div>
    </div>
  )
}
