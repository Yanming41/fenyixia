import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Bill, PaymentProof, Member } from '../../lib/types'
import { fmtMoney, fmtISODate } from '../../lib/utils'
import { toggleSettled, deleteBill } from '../../lib/api/bills'
import { getPaymentProofs, uploadPaymentProof, toggleManualPayment, getManualPayments } from '../../lib/api/payments'
import { useAngerStorm } from '../../hooks/useAngerStorm'
import { useFriends } from '../../hooks/useFriends'
import { useToast } from '../../contexts/ToastContext'
import BillSheet from './BillSheet'

interface SplitDetailProps {
  bill: Bill
  currentUserId: string
  onClose: () => void
  onRefresh: () => void
}

export default function SplitDetail({ bill, currentUserId, onClose, onRefresh }: SplitDetailProps) {
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [uploading, setUploading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const { friends } = useFriends()
  const [manualPaid, setManualPaid] = useState<Set<string>>(bill._manualPaidUserIds || new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isPayer = bill.payer_id === currentUserId
  const { protestBill } = useAngerStorm()
  const { showToast } = useToast()

  useEffect(() => {
    getPaymentProofs(bill.id).then(setProofs).catch(console.error)
    getManualPayments(bill.id).then(setManualPaid).catch(console.error)
  }, [bill.id])

  const handleToggleSettled = async () => {
    await toggleSettled(bill.id, !bill.settled)
    onRefresh()
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('确定删除这笔账单？')) return
    await deleteBill(bill.id)
    onRefresh()
    onClose()
  }

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadPaymentProof(bill.id, file)
      const updated = await getPaymentProofs(bill.id)
      setProofs(updated)
      onRefresh()
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleAnger = () => {
    protestBill(bill.id)
  }

  const handleTogglePaid = async (userId: string) => {
    if (!isPayer || userId === bill.payer_id || bill.settled) return
    try {
      const nowPaid = await toggleManualPayment(bill.id, userId)
      setManualPaid(prev => {
        const next = new Set(prev)
        if (nowPaid) next.add(userId)
        else next.delete(userId)
        return next
      })
      showToast(nowPaid ? '已标记为已付款' : '已取消付款标记')
      onRefresh()
    } catch (err) {
      console.error('Toggle paid failed:', err)
    }
  }

  const handleCopyPayment = async (amount: number) => {
    try {
      await navigator.clipboard.writeText(amount.toString())
      showToast(`已复制金额：${amount}`)
    } catch (err) {
      showToast('复制金额失败')
    }
  }

  // Calculate per-member shares
  const memberShares: Record<string, number> = {}
  bill.items.forEach(item => {
    const n = item.members.length || 1
    const share = (item.price * item.qty) / n
    item.members.forEach(m => {
      memberShares[m.id] = (memberShares[m.id] || 0) + share
    })
  })

  // Role banner
  let bannerClass: string
  let bannerText: string
  let bannerAmount: number
  const collectTotal = Object.entries(memberShares)
    .filter(([id]) => id !== bill.payer_id)
    .reduce((s, [, v]) => s + v, 0)

  if (bill.settled) {
    bannerClass = 'paid'
    bannerText = '✓ 已结清'
    bannerAmount = isPayer ? collectTotal : (memberShares[currentUserId] || 0)
  } else if (isPayer) {
    bannerClass = 'collect'
    bannerText = '💰 你是垫付人，待收款'
    bannerAmount = collectTotal
  } else if (bill._hasMeProof) {
    bannerClass = 'paid'
    bannerText = '✓ 你已上传付款凭证'
    bannerAmount = memberShares[currentUserId] || 0
  } else {
    bannerClass = 'pay'
    bannerText = '📤 你需要付款'
    bannerAmount = memberShares[currentUserId] || 0
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
        >
          <motion.div
            className="sheet detail-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sh" />
            <div className="detail-content">
              {/* Header */}
              <div className="detail-header">
                <div className="detail-icon">{bill.icon}</div>
                <div className="detail-title-col">
                  <div className="detail-title">{bill.title}</div>
                  {bill.description && <div className="detail-desc">{bill.description}</div>}
                </div>
                <div className="detail-amount-col">
                  <div className="detail-total">{fmtMoney(bill.total_amount)}</div>
                  <div className="detail-per">人均 {fmtMoney(bill.per_amount)}</div>
                </div>
              </div>

              {/* Role banner */}
              <div
                className={`detail-role-banner ${bannerClass}`}
                onClick={bannerClass === 'pay' ? () => handleCopyPayment(bannerAmount) : undefined}
                style={{ cursor: bannerClass === 'pay' ? 'pointer' : 'default' }}
              >
                <span>{bannerText}</span>
                <span className="role-amount">{fmtMoney(bannerAmount)}</span>
              </div>

              {/* Meta */}
              <div className="detail-meta">
                <div className="detail-meta-pill">📅 {fmtISODate(bill.date)}</div>
                <div className="detail-meta-pill">💳 {bill.payer_emoji} {bill.payer_name} 垫付</div>
                <div className="detail-meta-pill">👥 {bill.members.length} 人</div>
              </div>

              {/* Items */}
              <div className="detail-items-header">
                <span>商品</span>
                <span>数量</span>
                <span>金额</span>
                <span>分摊</span>
              </div>
              {bill.items.map((item, i) => {
                const isMine = item.members.some(m => m.id === currentUserId)
                return (
                  <div key={i} className={`detail-item-row ${isMine ? 'mine' : ''}`}>
                    <div className="detail-item-name">{item.name}</div>
                    <div className="detail-item-qty">x{item.qty}</div>
                    <div className="detail-item-price">{fmtMoney(item.price * item.qty)}</div>
                    <div className="detail-item-avatars">
                      {item.members.map(m => (
                        <div key={m.id} className="cav">{m.emoji}</div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Per-member summary */}
              <div className="detail-summary">
                <div className="detail-summary-title">分摊明细</div>
                {bill.members.map(m => {
                  const share = memberShares[m.id] || 0
                  const isMe = m.id === currentUserId
                  const proofUsers = bill._proofUserIds || new Set<string>()
                  const hasProof = proofUsers.has(m.id)
                  const isManualPaid = manualPaid.has(m.id)
                  const isMemberPayer = m.id === bill.payer_id
                  const isPaid = hasProof || isManualPaid || bill.settled
                  const canToggle = isPayer && !isMemberPayer && !bill.settled
                  return (
                    <div
                      key={m.id}
                      className={`detail-summary-row ${isMe ? 'me' : ''} ${!isMemberPayer && isPaid ? 'paid' : ''} ${canToggle ? 'tappable' : ''}`}
                      onClick={() => canToggle && handleTogglePaid(m.id)}
                    >
                      <div className="detail-summary-avatar" style={{ background: 'var(--bg4)' }}>
                        {m.emoji}
                      </div>
                      <div className="detail-summary-name">
                        {m.name}
                        {isMemberPayer && (
                          <span className="detail-summary-label"> (垫付人)</span>
                        )}
                        {!isMemberPayer && isPaid && (
                          <span className="detail-summary-paid-badge">✓ 已付</span>
                        )}
                      </div>
                      <div className="detail-summary-amount">
                        {isMemberPayer ? (
                          <span style={{ color: 'var(--label3)' }}>—</span>
                        ) : (
                          <span className={isPaid ? 'amount-paid' : 'amount-unpaid'}>
                            {fmtMoney(share)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Payment proof section */}
              {!isPayer && !bill.settled && (
                <div className="proof-section">
                  <div className="proof-section-title">付款凭证</div>
                  <div
                    className="proof-upload-area"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? '上传中...' : '📷 点击上传付款截图'}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleUploadProof}
                  />
                </div>
              )}

              {/* Existing proofs */}
              {proofs.length > 0 && (
                <div className="proof-section" style={{ marginTop: 8 }}>
                  <div className="proof-section-title">已上传凭证 ({proofs.length})</div>
                  {proofs.map(p => (
                    <div key={p.id} className="proof-item">
                      <img
                        className="proof-thumb"
                        src={p.image_url}
                        alt="凭证"
                        onClick={() => window.open(p.image_url, '_blank')}
                      />
                      <div>
                        <div>{p.user?.emoji} {p.user?.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--label3)' }}>
                          {new Date(p.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="detail-actions">
                {isPayer && (
                  <>
                    <button
                      className={bill.settled ? 'detail-btn-settled' : 'detail-btn-settle'}
                      onClick={handleToggleSettled}
                    >
                      {bill.settled ? '取消结清' : '标记结清'}
                    </button>
                    <button className="detail-btn-edit" onClick={() => setShowEdit(true)}>
                      编辑
                    </button>
                    <button className="detail-btn-delete" onClick={handleDelete}>
                      删除
                    </button>
                  </>
                )}
                {!isPayer && !bill.settled && !bill._hasMeProof && (
                  <button className="detail-btn-protest" onClick={handleAnger}>
                    😡 异议!
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {showEdit && (
        <BillSheet
          bill={bill}
          friends={[...bill.members, ...friends.filter(f => !bill.members.some(m => m.id === f.id))]}
          onClose={() => setShowEdit(false)}
          onSaved={() => { onRefresh(); setShowEdit(false) }}
        />
      )}
    </>
  )
}
