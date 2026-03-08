import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Bill } from '../../lib/types'

interface MonthGroup {
    key: string
    label: string
    bills: Bill[]
    total: number
    icons: string[]
}

interface MonthGroupViewProps {
    bills: Bill[]
    onSelectBill?: (bill: Bill) => void
}

function groupBillsByMonth(bills: Bill[]): MonthGroup[] {
    const groups: Record<string, Bill[]> = {}
    bills.forEach(b => {
        const d = new Date(b.date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = `${d.getMonth() + 1}月`
        if (!groups[key]) groups[key] = []
        groups[key].push(b)
    })

    return Object.entries(groups)
        .sort(([a], [b]) => b.localeCompare(a)) // newest first
        .map(([key, bills]) => ({
            key,
            label: `${parseInt(key.split('-')[1])}月`,
            bills,
            total: bills.reduce((s, b) => s + (b.total_amount || 0), 0),
            icons: [...new Set(bills.map(b => b.icon))].slice(0, 5),
        }))
}

export default function MonthGroupView({ bills, onSelectBill }: MonthGroupViewProps) {
    const groups = useMemo(() => groupBillsByMonth(bills), [bills])

    if (groups.length === 0) {
        return (
            <div style={{ color: 'var(--label3)', textAlign: 'center', padding: 60, fontSize: 14 }}>
                暂无账单
            </div>
        )
    }

    return (
        <div style={{ padding: '0 16px' }}>
            {groups.map((group, i) => (
                <motion.div
                    key={group.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.35 }}
                    style={{
                        background: 'var(--bg2)',
                        borderRadius: 16,
                        padding: '16px',
                        marginBottom: 12,
                    }}
                >
                    {/* Month header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--label1)' }}>
                                {group.label}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--label3)', marginTop: 2 }}>
                                {group.bills.length} 笔 · CA$ {group.total.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
                            </div>
                        </div>
                        <div style={{ fontSize: 24, display: 'flex', gap: 2 }}>
                            {group.icons.map((icon, j) => (
                                <span key={j}>{icon}</span>
                            ))}
                        </div>
                    </div>

                    {/* Bill list within month */}
                    {group.bills.map(bill => (
                        <div
                            key={bill.id}
                            onClick={() => onSelectBill?.(bill)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 0',
                                borderTop: '1px solid var(--sep)',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{ fontSize: 22, width: 36, textAlign: 'center' }}>{bill.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--label1)' }}>
                                    {bill.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--label3)', marginTop: 2 }}>
                                    {new Date(bill.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}日
                                    {bill.settled && ' · ✅ 已结清'}
                                </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--label1)' }}>
                                CA$ {bill.total_amount?.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
                            </div>
                        </div>
                    ))}
                </motion.div>
            ))}
        </div>
    )
}
