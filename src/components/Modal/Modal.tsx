import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                ref={sheetRef}
                className={styles.sheet}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.handle} />
                {title && (
                    <div className={styles.titlebar}>
                        <button className={styles.cancel} onClick={onClose}>取消</button>
                        <div className={styles.title}>{title}</div>
                        <div style={{ width: 40 }} />
                    </div>
                )}
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
}

/** Action Sheet — 底部选项弹窗 */
interface ActionSheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export function ActionSheet({ open, onClose, title, children }: ActionSheetProps) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            {children}
        </Modal>
    );
}
