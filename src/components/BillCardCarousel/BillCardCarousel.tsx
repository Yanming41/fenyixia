import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useAnimation, type PanInfo } from 'framer-motion'
import type { Bill } from '../../lib/types'
import BillCard from './BillCard'

import { useDebugConfig } from '../../contexts/DebugContext'

interface BillCardCarouselProps {
  bills: Bill[]
  currentUserId: string
  onSelectBill: (bill: Bill) => void
}

export default function BillCardCarousel({ bills, currentUserId, onSelectBill }: BillCardCarouselProps) {
  const [curIdx, setCurIdx] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const animControls = useAnimation()
  const dragX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { config: CFG } = useDebugConfig()
  const N = bills.length

  if (N === 0) {
    return (
      <div className="carousel-section">
        <div className="section-label-row">
          <div className="section-label">最近账单</div>
        </div>
        <div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--label3)', fontSize: 15 }}>暂无账单</div>
        </div>
      </div>
    )
  }

  const frac = curIdx + dragOffset

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - frac
    const absO = Math.abs(offset)
    const sign = Math.sign(offset)

    // Prevent cards from disconnecting or sinking too far during rapid multi-card swipes
    const cappedX = Math.min(absO, 2.5)
    const cappedY = Math.min(absO, 3.0)
    const cappedS = Math.min(absO, 4.0)
    const cappedO = Math.min(absO, 4.0)

    const cX = Math.pow(cappedX, CFG.curveX)
    const cS = Math.pow(cappedS, CFG.curveScale)
    const cY = Math.pow(cappedY, CFG.curveY)
    const cO = Math.pow(cappedO, CFG.curveOpacity)

    const x = sign * cX * CFG.STEP
    const scale = Math.max(CFG.MIN_SCALE, 1 - cS * CFG.SCALE_STEP)
    const y = cY * CFG.Y_STEP
    const opacity = Math.max(0, 1 - cO * CFG.OPACITY_STEP)
    const zIndex = 100 - Math.round(absO * 10)

    return {
      transform: `translateX(${x}px) translateY(${y}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: isDragging ? 'none' : `transform ${CFG.SNAP_DUR}s cubic-bezier(.17,.89,.32,1.2), opacity ${CFG.SNAP_DUR}s ease`,
      pointerEvents: absO < 2 ? 'auto' : 'none',
    }
  }

  const snapTo = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(N - 1, target))
    setCurIdx(clamped)
    setDragOffset(0)
  }, [N])

  const handlePanStart = () => {
    setIsDragging(true)
  }

  const handlePan = (_: unknown, info: PanInfo) => {
    const offset = -info.offset.x / CFG.STEP
    setDragOffset(offset)
  }

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false)
    const velocity = -info.velocity.x
    const offset = -info.offset.x / CFG.STEP

    // Project where the card will land based on current offset + velocity inertia
    const projectedOffset = offset + (velocity * CFG.INERTIA_RATIO) / CFG.STEP
    const target = Math.round(curIdx + projectedOffset)

    snapTo(target)
  }

  const handleCardClick = (index: number) => {
    if (isDragging) return
    if (index === curIdx) {
      onSelectBill(bills[index]!)
    } else {
      snapTo(index)
    }
  }

  return (
    <div className="carousel-section">
      <div className="section-label-row">
        <div className="section-label">最近账单</div>
      </div>
      <motion.div
        ref={containerRef}
        className={`stage ${isDragging ? 'dragging' : ''}`}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        {bills.map((bill, i) => (
          <BillCard
            key={bill.id}
            bill={bill}
            currentUserId={currentUserId}
            style={getCardStyle(i)}
            onClick={() => handleCardClick(i)}
          />
        ))}
      </motion.div>
      {/* Pagination dots */}
      <div className="dots">
        {bills.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === curIdx ? 'on' : ''}`}
            onClick={() => snapTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
