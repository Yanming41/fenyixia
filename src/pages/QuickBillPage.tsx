import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useFriends } from '../hooks/useFriends'
import { scanReceipt, buildQuickBillPrompt } from '../lib/api/scan'
import { createBill } from '../lib/api/bills'
import { ICON_COLORS } from '../lib/utils'
import type { Member } from '../lib/types'
import type { ScanResult, ScanResultItem } from '../lib/api/scan'
import ScanResultView from '../components/Scanner/ScanResult'
import MemberAssignment from '../components/Scanner/MemberAssignment'

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-receipt`

type Step = 'input' | 'generating' | 'result' | 'saving'

export default function QuickBillPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [step, setStep] = useState<Step>('input')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  // Members
  const { friends } = useFriends()
  const allMembers = useMemo(() => {
    if (!user) return []
    const me: Member = { id: user.id, name: user.user_metadata?.name || '我', emoji: user.user_metadata?.emoji || '😀', color: user.user_metadata?.color }
    const hasSelf = friends.some(f => f.id === user.id)
    return hasSelf ? friends : [me, ...friends]
  }, [user, friends])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])

  // Sync selectedMembers when allMembers first loads
  useEffect(() => {
    if (allMembers.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers(allMembers)
    }
  }, [allMembers, selectedMembers.length])

  // Result
  const [resultData, setResultData] = useState<ScanResult | null>(null)
  const [items, setItems] = useState<ScanResultItem[]>([])
  const [assignments, setAssignments] = useState<Record<number, Set<string>>>({})


  const generate = useCallback(async () => {
    if (!text.trim()) return
    setStep('generating')
    setError('')

    try {
      const memberNames = selectedMembers.map(m => m.name || m.emoji || '?')
      const currentDate = new Date().toISOString().slice(0, 10)
      const prompt = buildQuickBillPrompt(text, currentDate, memberNames)

      // Call Edge Function (text-only, no image)
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: `API 错误 ${res.status}` }))
        throw new Error(e.error || `API 错误 ${res.status}`)
      }

      const data = await res.json()
      let txt = (data.content || []).map((c: { text?: string }) => c.text || '').join('').trim()
      txt = txt.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const result: ScanResult = JSON.parse(txt)

      setResultData(result)
      const resultItems = result.items || []
      setItems(resultItems)

      // Init assignments
      const ids = selectedMembers.map(m => m.id)
      const initAssign: Record<number, Set<string>> = {}
      resultItems.forEach((_, idx) => { initAssign[idx] = new Set(ids) })
      setAssignments(initAssign)

      setStep('result')
    } catch (err) {
      setError((err as Error).message)
      setStep('input')
    }
  }, [text, selectedMembers])

  const saveBill = useCallback(async () => {
    if (!resultData || !user) return
    setStep('saving')

    try {
      const isoDate = resultData.date || new Date().toISOString().slice(0, 10)

      const billItems = items.map((item, idx) => {
        const assignedSet = assignments[idx]
        const memberIds = assignedSet && assignedSet.size > 0
          ? [...assignedSet]
          : [user.id]
        return {
          name: item.name,
          price: Number(item.price),
          qty: item.qty || 1,
          member_ids: memberIds,
        }
      })

      await createBill({
        icon: resultData.icon || '🧾',
        title: resultData.title || '账单',
        description: resultData.desc || '',
        date: isoDate,
        color: resultData.color || ICON_COLORS[resultData.icon || '🧾'] || 'linear-gradient(135deg,#8E8E93,#636366)',
        items: billItems,
      })

      toast.showToast('账单已保存')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setError((err as Error).message)
      setStep('result')
    }
  }, [resultData, items, assignments, user, navigate, toast])

  const totalAmount = items.reduce((s, i) => s + i.price * (i.qty || 1), 0)
  const memberCount = selectedMembers.length || 1
  const perAmount = totalAmount / memberCount

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button className="scanner-back" onClick={() => navigate(-1)}>← 返回</button>
        <span className="scanner-title">一句话生成账单</span>
      </div>

      {error && (
        <div className="scanner-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {step === 'input' && (
        <div className="quickbill-input-section">
          <div className="quickbill-hint">
            描述一次消费，AI 帮你生成账单
          </div>
          <textarea
            className="quickbill-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="昨天和小明吃火锅花了 320"
            rows={4}
          />

          {/* Member selection */}
          <div className="scanner-section-title" style={{ marginTop: 16 }}>参与成员</div>
          <div className="scanner-member-list">
            {allMembers.map(m => {
              const isSel = selectedMembers.some(s => s.id === m.id)
              return (
                <button
                  key={m.id}
                  className={`scanner-member-bubble${isSel ? ' selected' : ''}`}
                  onClick={() => {
                    if (isSel && selectedMembers.length <= 1) return
                    setSelectedMembers(prev =>
                      prev.find(p => p.id === m.id)
                        ? prev.filter(p => p.id !== m.id)
                        : [...prev, m]
                    )
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

          <button
            className="scanner-btn-primary"
            onClick={generate}
            disabled={!text.trim()}
            style={{ margin: '20px 0' }}
          >
            ✨ 生成账单
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div className="scanner-loading">
          <div className="scanner-spinner" />
          <div>AI 正在生成中...</div>
        </div>
      )}

      {step === 'result' && resultData && (
        <>
          <ScanResultView
            icon={resultData.icon || '🧾'}
            title={resultData.title || '账单'}
            desc={resultData.desc || ''}
            date={resultData.date || ''}
            merchant={resultData.merchant || ''}
            items={items}
            totalAmount={totalAmount}
            perAmount={perAmount}
            onItemsChange={setItems}
          />
          <MemberAssignment
            items={items}
            members={selectedMembers}
            assignments={assignments}
            onAssignmentsChange={setAssignments}
          />
          <div style={{ display: 'flex', gap: 10, padding: '16px 20px' }}>
            <button className="scanner-btn-secondary" onClick={() => setStep('input')} style={{ flex: 1 }}>
              重新生成
            </button>
            <button className="scanner-btn-primary" onClick={saveBill} style={{ flex: 1 }}>
              💾 保存账单
            </button>
          </div>
        </>
      )}

      {step === 'saving' && (
        <div className="scanner-loading">
          <div className="scanner-spinner" />
          <div>保存中...</div>
        </div>
      )}
    </div>
  )
}
