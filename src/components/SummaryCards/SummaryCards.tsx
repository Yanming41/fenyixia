import { fmtMoney } from '../../utils/format';
import styles from './SummaryCards.module.css';

interface SummaryData {
    collected: number;
    collectPending: number;
    paid: number;
    owePending: number;
}

interface SummaryCardsProps {
    data: SummaryData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
    return (
        <div className={styles.summary}>
            <div className={styles.card}>
                <div className={styles.label}>已收回</div>
                <div className={`${styles.value} ${styles.green}`}>+{fmtMoney(data.collected)}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>待收回</div>
                <div className={`${styles.value} ${styles.green} ${styles.dim}`}>+{fmtMoney(data.collectPending)}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>已还款</div>
                <div className={`${styles.value} ${styles.red}`}>-{fmtMoney(data.paid)}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>待还款</div>
                <div className={`${styles.value} ${styles.red} ${styles.dim}`}>-{fmtMoney(data.owePending)}</div>
            </div>
        </div>
    );
}
