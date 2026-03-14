import type { TrendPoint } from '../../hooks/useBillStats'

interface BarChartProps {
  data: TrendPoint[]
  color?: string
}

export default function BarChart({ data, color = 'var(--accent)' }: BarChartProps) {
  const max = Math.max(...data.map(d => d.amount), 1)
  const barCount = data.length

  if (data.every(d => d.amount === 0)) {
    return (
      <div style={{
        padding: '30px 0',
        textAlign: 'center',
        color: 'var(--label3)',
        fontSize: 13,
      }}>
        暂无数据
      </div>
    )
  }

  // Show label every N days to avoid clutter
  const labelEvery = barCount > 15 ? 5 : barCount > 7 ? 3 : 1

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        height: 120,
      }}>
        {data.map((point, i) => {
          const h = max > 0 ? (point.amount / max) * 100 : 0
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 12,
                  height: `${Math.max(h, point.amount > 0 ? 3 : 0)}%`,
                  background: point.amount > 0 ? color : 'transparent',
                  borderRadius: '3px 3px 0 0',
                  minHeight: point.amount > 0 ? 2 : 0,
                  transition: 'height .3s ease',
                }}
              />
            </div>
          )
        })}
      </div>
      {/* X axis labels */}
      <div style={{
        display: 'flex',
        gap: 1,
        marginTop: 4,
      }}>
        {data.map((point, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 9,
              color: 'var(--label3)',
            }}
          >
            {(i + 1) % labelEvery === 0 || i === 0 ? point.label : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
