import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'
import Header from '../components/Layout/Header'
import SummaryCards from '../components/BillCardCarousel/SummaryCards'
import BillCardCarousel from '../components/BillCardCarousel/BillCardCarousel'
import SplitDetail from '../components/SplitDetail/SplitDetail'
import BillListView from '../components/BillListView/BillListView'
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
  const [dataFilter, setDataFilter] = useState<'all' | 'mine' | 'collect'>('all')
  const [displayMode, setDisplayMode] = useState<'carousel' | 'list'>('carousel')

  const myBills = useMemo(() => {
    if (!user) return []
    return bills.filter(b => {
      if (b.settled || b.payer_id === user.id) return false
      if (!b.items.some(item => item.members.some(m => m.id === user.id))) return false
      if (b._hasMeProof) return false
      if (b._manualPaidUserIds?.has(user.id)) return false
      return true
    })
  }, [bills, user])

  const collectBills = useMemo(() => {
    if (!user) return []
    return bills.filter(b => {
      if (b.settled || b.payer_id !== user.id) return false
      const proofIds = b._proofUserIds || new Set<string>()
      const manualIds = b._manualPaidUserIds || new Set<string>()
      return (b.members || []).some(
        m => m.id !== user.id && !proofIds.has(m.id) && !manualIds.has(m.id)
      )
    })
  }, [bills, user])

  if (!user) return null

  const displayBills =
    dataFilter === 'mine' ? myBills :
    dataFilter === 'collect' ? collectBills :
    bills

  const cycleFilter = () =>
    setDataFilter(f => f === 'all' ? 'mine' : f === 'mine' ? 'collect' : 'all')

  const appClasses = [
    'app',
    !config.showShadows && 'no-shadow',
    !config.showTexture && 'no-texture',
    !config.showSheen && 'no-sheen'
  ].filter(Boolean).join(' ')

  const renderContent = () => {
    if (loading) {
      return (
        <div className="carousel-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--label3)', fontSize: 15 }}>加载中...</div>
        </div>
      )
    }

    if (displayMode === 'list') {
      return (
        <BillListView
          bills={displayBills}
          showMyShare={dataFilter === 'mine'}
          onSelectBill={setSelectedBill}
        />
      )
    }

    return (
      <BillCardCarousel
        bills={displayBills}
        currentUserId={user.id}
        onSelectBill={setSelectedBill}
      />
    )
  }

  return (
    <div className={appClasses} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
      <Header
        dataFilter={dataFilter}
        collectCount={collectBills.length}
        displayMode={displayMode}
        onToggleFilter={cycleFilter}
        onToggleDisplay={() => setDisplayMode(d => d === 'carousel' ? 'list' : 'carousel')}
      />

      <SummaryCards bills={bills} currentUserId={user.id} />

      {renderContent()}

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
