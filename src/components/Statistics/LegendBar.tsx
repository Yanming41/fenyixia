import { fmtMoney } from '../../lib/utils'

export interface LegendItem {
  label: string
  icon?: string
  amount: number
  percentage: number
  color?: string
}

interface LegendBarProps {
  items: LegendItem[]
}

export default function LegendBar({ items }: LegendBarProps) {
  if (items.length === 0) return null

  return (
    <div style={{ marginTop: 12 }}>
      {/* Stacked percentage bar */}
      <div style={{
        display: 'flex',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        background: 'var(--bg3)',
        marginBottom: 10,
      }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              width: `${item.percentage}%`,
              background: item.color,
              minWidth: item.percentage > 0 ? 2 : 0,
            }}
          />
        ))}
      </div>

      {/* Legend rows */}
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 0',
          }}
        >
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: item.color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 14, color: 'var(--label)', fontWeight: 500 }}>
            {item.icon ? `${item.icon} ` : ''}{item.label}
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 13,
            color: 'var(--label2)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmtMoney(item.amount)}
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--label3)',
            minWidth: 40,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {item.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}
