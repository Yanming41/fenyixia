import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface BottomSheetProps {
  onClose: () => void
  title?: string
  maxHeight?: string
  className?: string
  headerRight?: ReactNode
  children: ReactNode
}

export default function BottomSheet({
  onClose,
  title,
  maxHeight = '88vh',
  className,
  headerRight,
  children,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        onClick={onClose}
      >
        <motion.div
          className={`sheet${className ? ` ${className}` : ''}`}
          style={{ maxHeight, display: 'flex', flexDirection: 'column' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={e => e.stopPropagation()}
        >
          <div className="sh" />

          {title && (
            <div className="sheet-titlebar">
              <button className="sheet-cancel" onClick={onClose}>取消</button>
              <div className="sh-title">{title}</div>
              {headerRight || <div style={{ width: 44 }} />}
            </div>
          )}

          <div className="sheet-body" style={{ overflowY: 'auto', flex: 1 }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
