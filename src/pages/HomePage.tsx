import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'
import Header from '../components/Layout/Header'
import SummaryCards from '../components/BillCardCarousel/SummaryCards'
import BillCardCarousel from '../components/BillCardCarousel/BillCardCarousel'
import SplitDetail from '../components/SplitDetail/SplitDetail'
import MyBillsView from '../components/MyBillsView/MyBillsView'
import BottomNav from '../components/Layout/BottomNav'
import { useDebugConfig } from '../contexts/DebugContext'
import type { Bill } from '../lib/types'

interface HomePageProps {
  onAddClick?: () => void
}

export default function HomePage({ onAddClick }: HomePageProps) {
  const { user } = useAuth()
  const { bills, loading, reload } = useBills()
  const { config } = useDebugConfig()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [viewMode, setViewMode] = useState<'carousel' | 'mine'>('carousel')

  if (!user) return null

  const appClasses = [
    'app',
    !config.showShadows && 'no-shadow',
    !config.showTexture && 'no-texture',
    !config.showSheen && 'no-sheen'
  ].filter(Boolean).join(' ')

  return (
    <div className={appClasses} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
      <Header viewMode={viewMode} onToggleView={() => setViewMode(v => v === 'carousel' ? 'mine' : 'carousel')} />

      <SummaryCards bills={bills} currentUserId={user.id} />

      {loading ? (
        <div className="carousel-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--label3)', fontSize: 15 }}>加载中...</div>
        </div>
      ) : viewMode === 'mine' ? (
        <MyBillsView bills={bills} currentUserId={user.id} onSelectBill={setSelectedBill} />
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

      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}
