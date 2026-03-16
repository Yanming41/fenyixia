import React from 'react'

export interface PieSlice {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieSlice[]
  size?: number
}

const FALLBACK_COLORS = [
  '#FF9500', '#5AC8FA', '#AF52DE', '#30D158', '#FF453A',
  '#FF6B00', '#5E5CE6', '#8E8E93', '#FF2D55', '#007AFF',
]

export default function PieChart({ data, size = 180 }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}>
        <span style={{ color: 'var(--label3)', fontSize: 13 }}>暂无数据</span>
      </div>
    )
  }

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 2

  let cumAngle = -90 // Start from top
  const paths: React.ReactElement[] = []

  data.forEach((slice, i) => {
    const angle = (slice.value / total) * 360
    if (angle === 0) return

    const color = slice.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]

    if (angle >= 359.99) {
      // Full circle
      paths.push(
        <circle key={i} cx={cx} cy={cy} r={r} fill={color} />
      )
      return
    }

    const startRad = (cumAngle * Math.PI) / 180
    const endRad = ((cumAngle + angle) * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    paths.push(
      <path
        key={i}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`}
        fill={color}
      />
    )

    cumAngle += angle
  })

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths}
        {/* Center hole for donut effect */}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--bg)" />
      </svg>
    </div>
  )
}
