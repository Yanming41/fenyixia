import { useState, useEffect, useRef } from 'react'
import type { Bill, PaymentProof, Member, BillDispute } from '../../lib/types'
import { fmtMoney, fmtISODate } from '../../lib/utils'
import { toggleSettled, deleteBill } from '../../lib/api/bills'
import { getPaymentProofs, uploadPaymentProof, toggleManualPayment, getManualPayments } from '../../lib/api/payments'
import { fetchDispute, resolveDispute } from '../../lib/api/disputes'
import { useAngerStorm } from '../../hooks/useAngerStorm'
import { useFriends } from '../../hooks/useFriends'
import { useGroups } from '../../hooks/useGroups'
import { useTags } from '../../hooks/useTags'
import { useToast } from '../../contexts/ToastContext'
import BillSheet from './BillSheet'
import DisputeSheet from './DisputeSheet'
import BottomSheet from '../shared/BottomSheet'

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
  const [showDispute, setShowDispute] = useState(false)
  const [dispute, setDispute] = useState<BillDispute | null>(bill._dispute || null)
  const [showDisputeReview, setShowDisputeReview] = useState(false)
  const { friends } = useFriends()
  const { groups } = useGroups()
  const { tags } = useTags()
  const [manualPaid, setManualPaid] = useState<Set<string>>(bill._manualPaidUserIds || new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isPayer = bill.payer_id === currentUserId
  const { protestBill } = useAngerStorm()
  const { showToast } = useToast()

  useEffect(() => {
    getPaymentProofs(bill.id).then(setProofs).catch(console.error)
    getManualPayments(bill.id).then(setManualPaid).catch(console.error)
    if (!bill._dispute) {
      fetchDispute(bill.id).then(setDispute).catch(console.error)
    }
  }, [bill.id, bill._dispute])

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

  const handleDisputeSubmitted = () => {
    setShowDispute(false)
    fetchDispute(bill.id).then(setDispute).catch(console.error)
    onRefresh()
    showToast('质疑已提交，等待垫付人审核')
  }

  const handleResolveDispute = async (accepted: boolean) => {
    if (!dispute) return
    try {
      await resolveDispute(
        dispute.id,
        bill.id,
        accepted,
        accepted ? dispute.suggested_items : undefined,
        accepted ? bill.title : undefined,
        accepted ? bill.icon : undefined
      )
      setDispute(null)
      setShowDisputeReview(false)
      onRefresh()
      showToast(accepted ? '已接受修改' : '已拒绝质疑')
    } catch (err) {
      console.error('Resolve dispute failed:', err)
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
  } else if (dispute) {
    bannerClass = 'dispute'
    if (isPayer) {
      bannerText = '⚖️ 有成员发起质疑，待你裁决'
      bannerAmount = collectTotal
    } else if (dispute.challenger_id === currentUserId) {
      bannerText = '⚖️ 你已提交质疑，等待裁决'
      bannerAmount = memberShares[currentUserId] || 0
    } else {
      bannerText = '⚖️ 裁决中'
      bannerAmount = memberShares[currentUserId] || 0
    }
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
      <BottomSheet onClose={onClose} className="detail-sheet">
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

              {/* Dispute banner */}
              {dispute && (
                <div className="dispute-banner" onClick={() => isPayer && setShowDisputeReview(!showDisputeReview)}>
                  <span className="dispute-banner-icon">⚖️</span>
                  <span>裁决中 — {dispute.challenger?.emoji || '👤'} {dispute.challenger?.name || '成员'} 发起了质疑</span>
                </div>
              )}

              {/* Payer dispute review */}
              {isPayer && dispute && showDisputeReview && (
                <div className="dispute-review">
                  <div className="dispute-review-title">争议详情</div>
                  <div className="dispute-review-reason">
                    <strong>{dispute.challenger?.emoji} {dispute.challenger?.name}：</strong>
                    {dispute.reason}
                  </div>
                  <div className="dispute-label" style={{ fontSize: 13 }}>建议修改</div>
                  <div className="dispute-review-diff">
                    {dispute.suggested_items.map((sItem, idx) => {
                      const origItem = bill.items[idx]
                      const origIds = new Set(origItem?.members.map(m => m.id) || [])
                      const newIds = new Set(sItem.member_ids)
                      return (
                        <div key={idx} className="dispute-diff-item">
                          <div className="dispute-diff-name">{sItem.name}</div>
                          <div className="dispute-diff-members">
                            {bill.members.filter(m => m.id !== bill.payer_id).map(m => {
                              const wasIn = origIds.has(m.id)
                              const nowIn = newIds.has(m.id)
                              let cls = 'dispute-diff-chip'
                              if (wasIn && !nowIn) cls += ' removed'
                              else if (!wasIn && nowIn) cls += ' added'
                              if (!wasIn && !nowIn) return null
                              return <span key={m.id} className={cls}>{m.emoji} {m.name}</span>
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="dispute-review-actions">
                    <button className="dispute-btn-reject" onClick={() => handleResolveDispute(false)}>拒绝</button>
                    <button className="dispute-btn-accept" onClick={() => handleResolveDispute(true)}>接受修改</button>
                  </div>
                </div>
              )}

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
                  <>
                    <button className="detail-btn-protest" onClick={handleAnger}>
                      😡 异议!
                    </button>
                    {!dispute && (
                      <button className="detail-btn-dispute" onClick={() => setShowDispute(true)}>
                        ⚖️ 质疑
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
      </BottomSheet>

      {showEdit && (
        <BillSheet
          bill={bill}
          friends={friends}
          groups={groups}
          tags={tags}
          onClose={() => setShowEdit(false)}
          onSaved={() => { onRefresh(); setShowEdit(false) }}
        />
      )}

      {showDispute && (
        <DisputeSheet
          bill={bill}
          currentUserId={currentUserId}
          onClose={() => setShowDispute(false)}
          onSubmitted={handleDisputeSubmitted}
        />
      )}
    </>
  )
}
