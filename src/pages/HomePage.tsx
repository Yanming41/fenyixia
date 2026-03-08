import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'
import Header from '../components/Layout/Header'
import SummaryCards from '../components/BillCardCarousel/SummaryCards'
import BillCardCarousel from '../components/BillCardCarousel/BillCardCarousel'
import SplitDetail from '../components/SplitDetail/SplitDetail'
import BillSheet from '../components/SplitDetail/BillSheet'
import MonthGroupView from '../components/MonthGroupView/MonthGroupView'
import BottomNav from '../components/Layout/BottomNav'
import { useDebugConfig } from '../contexts/DebugContext'
import { supabase } from '../lib/supabase'
import type { Bill, Member } from '../lib/types'

export default function HomePage() {
  const { user } = useAuth()
  const { bills, loading, reload } = useBills()
  const { config } = useDebugConfig()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [friends, setFriends] = useState<Member[]>([])
  const [viewMode, setViewMode] = useState<'carousel' | 'months'>('carousel')

  // Load friends for BillSheet member picker
  useEffect(() => {
    if (!user) return
    supabase
      .from('users')
      .select('id, name, emoji, color')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setFriends(data as Member[])
      })
  }, [user])

  if (!user) return null

  const appClasses = [
    'app',
    !config.showShadows && 'no-shadow',
    !config.showTexture && 'no-texture',
    !config.showSheen && 'no-sheen'
  ].filter(Boolean).join(' ')

  return (
    <div className={appClasses} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
      <Header viewMode={viewMode} onToggleView={() => setViewMode(v => v === 'carousel' ? 'months' : 'carousel')} />

      <SummaryCards bills={bills} currentUserId={user.id} />

      {loading ? (
        <div className="carousel-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--label3)', fontSize: 15 }}>加载中...</div>
        </div>
      ) : viewMode === 'months' ? (
        <MonthGroupView bills={bills} onSelectBill={setSelectedBill} />
      ) : (
        <BillCardCarousel
          bills={bills}
          currentUserId={user.id}
          onSelectBill={setSelectedBill}
        />
      )}

      {selectedBill && (
        <SplitDetail
          bill={selectedBill}
          currentUserId={user.id}
          onClose={() => setSelectedBill(null)}
          onRefresh={reload}
        />
      )}

      {/* Add Options Overlay */}
      {showAddOptions && (
        <div
          className="overlay on"
          onClick={() => setShowAddOptions(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
              padding: '20px 16px calc(env(safe-area-inset-bottom, 16px) + 16px)',
              width: '100%', maxWidth: 500,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--label1)', textAlign: 'center', marginBottom: 16 }}>
              添加账单
            </div>
            <button
              onClick={() => { setShowAddOptions(false); setTimeout(() => setShowCreateSheet(true), 250) }}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--blue)', color: '#fff', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
              }}
            >
              📝 手动输入
            </button>
            <button
              onClick={() => { setShowAddOptions(false); setTimeout(() => { window.location.href = 'receipt-scanner_final.html' }, 250) }}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'rgba(48,209,88,0.15)', color: 'var(--accent)', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
              }}
            >
              📷 拍照 / 扫描
            </button>
            <button
              onClick={() => setShowAddOptions(false)}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--bg3)', color: 'var(--label2)', fontSize: 16,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Create Bill Sheet */}
      {showCreateSheet && (
        <BillSheet
          friends={friends}
          onClose={() => setShowCreateSheet(false)}
          onSaved={() => { setShowCreateSheet(false); reload() }}
        />
      )}

      <BottomNav onAddClick={() => setShowAddOptions(true)} />
    </div>
  )
}
