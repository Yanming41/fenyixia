import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBills } from '../hooks/useBills'
import { useBillStats, type DateRange } from '../hooks/useBillStats'
import { CATEGORY_COLORS } from '../lib/constants'
import { fmtMoney } from '../lib/utils'
import BottomNav from '../components/Layout/BottomNav'
import DateRangePicker from '../components/Statistics/DateRangePicker'
import IncomeExpenseToggle from '../components/Statistics/IncomeExpenseToggle'
import PieChart from '../components/Statistics/PieChart'
import BarChart from '../components/Statistics/BarChart'
import LegendBar from '../components/Statistics/LegendBar'

const PARTICIPANT_COLORS = [
  '#0A84FF', '#FF9500', '#30D158', '#AF52DE', '#FF453A',
  '#5AC8FA', '#FF6B00', '#5E5CE6', '#FF2D55', '#8E8E93',
]

export default function StatsPage({ onAddClick }: { onAddClick?: () => void }) {
  const { user } = useAuth()
  const { bills, loading } = useBills()

  const now = new Date()
  const [dateRange, setDateRange] = useState<DateRange>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })
  const [type, setType] = useState<'expense' | 'income'>('expense')

  const stats = useBillStats(bills, dateRange, type, user?.id)

  return (
    <div className="app" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)' }}>
      {/* Header */}
      <div className="header">
        <div className="nav-row">
          <div className="h-title">统计</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--label3)' }}>
            加载中...
          </div>
        ) : (
          <div style={{ padding: '14px 16px 24px' }}>
            {/* Date picker */}
            <DateRangePicker value={dateRange} onChange={setDateRange} />

            {/* Toggle */}
            <div style={{ marginTop: 12 }}>
              <IncomeExpenseToggle value={type} onChange={setType} />
            </div>

            {/* Total */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0 8px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--label3)' }}>
                {type === 'expense' ? '总支出' : '总入账'}
              </div>
              <div style={{
                fontSize: 32,
                fontWeight: 700,
                color: type === 'expense' ? 'var(--red)' : 'var(--green)',
                fontVariantNumeric: 'tabular-nums',
                marginTop: 4,
              }}>
                {fmtMoney(stats.total)}
              </div>
            </div>

            {/* Participants Pie */}
            <Section title={type === 'expense' ? '支出对象' : '来源'}>
              <PieChart
                data={stats.participants.map((p, i) => ({
                  label: p.name,
                  value: p.amount,
                  color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
                }))}
              />
              <LegendBar
                items={stats.participants.map((p, i) => ({
                  label: p.name,
                  icon: p.emoji,
                  amount: p.amount,
                  percentage: p.percentage,
                  color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
                }))}
              />
            </Section>

            {/* Categories Pie */}
            <Section title="分类">
              <PieChart
                data={stats.categories.map(c => ({
                  label: c.category,
                  value: c.amount,
                  color: CATEGORY_COLORS[c.category] || '#636366',
                }))}
              />
              <LegendBar
                items={stats.categories.map(c => ({
                  label: c.category,
                  amount: c.amount,
                  percentage: c.percentage,
                  color: CATEGORY_COLORS[c.category] || '#636366',
                }))}
              />
            </Section>

            {/* Trend Bar Chart */}
            <Section title="每日趋势">
              <BarChart
                data={stats.trend}
                color={type === 'expense' ? 'var(--red)' : 'var(--green)'}
              />
            </Section>
          </div>
        )}
      </div>

      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 20,
      background: 'var(--bg2)',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--label)',
        marginBottom: 12,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}
