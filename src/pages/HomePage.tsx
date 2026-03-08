import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'
import Header from '../components/Layout/Header'
import SummaryCards from '../components/BillCardCarousel/SummaryCards'
import BillCardCarousel from '../components/BillCardCarousel/BillCardCarousel'
import SplitDetail from '../components/SplitDetail/SplitDetail'
import BottomNav from '../components/Layout/BottomNav'
import { useDebugConfig } from '../contexts/DebugContext'
import type { Bill } from '../lib/types'

export default function HomePage() {
  const { user } = useAuth()
  const { bills, loading, reload } = useBills()
  const { config } = useDebugConfig()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  if (!user) return null

  const appClasses = [
    'app',
    !config.showShadows && 'no-shadow',
    !config.showTexture && 'no-texture',
    !config.showSheen && 'no-sheen'
  ].filter(Boolean).join(' ')

  return (
    <div className={appClasses} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
      <Header />

      <SummaryCards bills={bills} currentUserId={user.id} />

      {loading ? (
        <div className="carousel-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--label3)', fontSize: 15 }}>加载中...</div>
        </div>
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

      <BottomNav />
    </div>
  )
}
