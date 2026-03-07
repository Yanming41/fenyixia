import type { Bill } from '../../types/bill';
import styles from './MonthPileCard.module.css';

interface MonthPileCardProps {
    monthKey: string;
    bills: Bill[];
    style?: React.CSSProperties;
    onClick?: () => void;
}

export function MonthPileCard({ monthKey, bills, style, onClick }: MonthPileCardProps) {
    const total = bills.reduce((s, b) => s + (b.total_amount || 0), 0);
    const icons = [...new Set(bills.map(b => b.icon))].slice(0, 5);

    return (
        <div className={styles.pile} style={style} onClick={onClick}>
            <div className={styles.pin}>📌</div>
            <div className={styles.card}>
                <div className={styles.monthLabel}>{monthKey}</div>
                <div className={styles.year}>所有账单</div>
                <div className={styles.divider} />
                <div className={styles.count}>{bills.length} 笔账单</div>
                <div className={styles.total}>
                    ¥ {total.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                </div>
                <div className={styles.icons}>
                    {icons.map((icon, i) => <span key={i}>{icon}</span>)}
                </div>
            </div>
        </div>
    );
}
