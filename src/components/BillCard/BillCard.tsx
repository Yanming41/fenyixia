import type { Bill } from '../../types/bill';
import { fmtMoney, fmtISODate } from '../../utils/format';
import styles from './BillCard.module.css';

interface BillCardProps {
    bill: Bill;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export function BillCard({ bill, style, onClick }: BillCardProps) {
    const memberAvatars = bill.members.map((m) => (
        <div key={m.id} className={styles.avatar}>{m.emoji || m.name?.[0]}</div>
    ));

    return (
        <div className={styles.card} style={style} onClick={onClick}>
            <div className={styles.bg} style={{ background: bill.color }} />
            <div className={styles.highlight} />
            <div className={styles.noise} />
            <div className={styles.inner}>
                <div className={styles.header}>
                    <div className={styles.title}>{bill.title}</div>
                    <div className={styles.date}>{fmtISODate(bill.date)}</div>
                </div>
                <div className={styles.divider} />
                <div className={styles.emoji}>{bill.icon}</div>
                <div className={styles.amountSection}>
                    <div className={styles.amountNum}>{fmtMoney(bill.total_amount)}</div>
                    <div className={styles.perLine}>
                        每人均摊 <em>{fmtMoney(bill.per_amount)}</em>
                    </div>
                </div>
                <div className={styles.bottomRow}>
                    <div className={styles.avatars}>{memberAvatars}</div>
                    <div className={`${styles.pill} ${bill.settled ? styles.ok : styles.ng}`}>
                        {bill.settled ? '✓ 已结清' : '待结算'}
                    </div>
                </div>
            </div>
        </div>
    );
}
