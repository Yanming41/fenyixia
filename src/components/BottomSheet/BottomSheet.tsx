import { forwardRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BottomSheet.module.css';

export interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    /** Whether it should take up full height (e.g. for BillDetailPage) */
    fullHeight?: boolean;
}

export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(({
    open,
    onClose,
    title,
    children,
    fullHeight = false,
}, ref) => {
    // We render the component only when open is true, using AnimatePresence
    // to handle the exit animation automatically.

    // Prevent background scrolling when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [open]);

    // Handle drag-to-dismiss logic
    const handleDragEnd = (_event: any, info: any) => {
        // If swiped down fast enough, or dragged down more than 100px
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        if (velocity > 300 || offset > 100) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className={styles.overlay}>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Sheet Drawer */}
                    <motion.div
                        ref={ref}
                        className={`${styles.sheet} ${fullHeight ? styles.fullHeight : ''}`}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 250,
                            mass: 0.8,
                            bounce: 0,
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                    >
                        <div className={styles.handleBar}>
                            <div className={styles.handle} />
                        </div>

                        {title && (
                            <div className={styles.titlebar}>
                                <button className={styles.cancelBtn} onClick={onClose}>
                                    取消
                                </button>
                                <div className={styles.title}>{title}</div>
                                <div style={{ width: 40 }} />
                            </div>
                        )}

                        <div className={styles.body}>
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});

BottomSheet.displayName = 'BottomSheet';
