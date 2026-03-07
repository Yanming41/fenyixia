import type { Bill } from '../../types/bill';
import { fmtMoney, fmtISODate } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import styles from './BillCard.module.css';

interface BillCardProps {
    bill: Bill;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export function BillCard({ bill, style, onClick }: BillCardProps) {
    const { user } = useAuth();
    const currentUserId = user?.id;
    const isPayer = currentUserId === bill.payer_id;

    // Calculate collect total (how much payer can collect from others)
    const collectTotal = (bill.items || []).reduce((sum, item) => {
        const n = (item.members || []).length || 1;
        const otherShare = (item.members || []).filter(m => m.id !== bill.payer_id).length;
        return sum + (item.price * (item.qty || 1) / n) * otherShare;
    }, 0);
    const otherCount = (bill.members || []).filter(m => m.id !== bill.payer_id).length;
    const myShare = bill.my_share || bill.per_amount;

    let roleTagClass: string;
    let roleTagText: string;
    let heroLabel: string;
    let heroAmount: number;

    if (bill.settled) {
        roleTagClass = styles.tagSettled;
        roleTagText = '\u2713 \u5df2\u7ed3\u6e05';
        heroLabel = isPayer ? '\u5df2\u6536\u56de' : '\u5df2\u652f\u4ed8';
        heroAmount = isPayer ? collectTotal : myShare;
    } else if (isPayer) {
        roleTagClass = styles.tagCollect;
        roleTagText = '\ud83d\udcb0 \u5f85\u6536\u6b3e';
        heroLabel = `\u5411 ${otherCount} \u4eba\u6536`;
        heroAmount = collectTotal;
    } else {
        roleTagClass = styles.tagPay;
        roleTagText = '\ud83d\udce4 \u5f85\u4ed8\u6b3e';
        heroLabel = '\u4f60\u8981\u4ed8';
        heroAmount = myShare;
    }

    const memberAvatars = bill.members.map((m) => (
        <div key={m.id} className={styles.avatar}>{m.emoji || m.name?.[0]}</div>
    ));

    return (
        <div className={styles.card} style={style} onClick={onClick}>
            <div className={styles.bg} style={{ background: bill.color }} />
            <div className={styles.highlight} />
            <div className={styles.noise} />
            <div className={styles.inner}>
                <div className={styles.top}>
                    <div className={styles.iconBox}>{bill.icon}</div>
                    <div className={styles.topRight}>
                        <div className={styles.dateLabel}>{fmtISODate(bill.date)}</div>
                        <div className={roleTagClass}>{roleTagText}</div>
                    </div>
                </div>
                <div className={styles.amountSection}>
                    <div className={styles.labelTitle}>{bill.title}</div>
                    <div className={styles.heroLabel}>{heroLabel}</div>
                    <div className={styles.amountNum}>{fmtMoney(heroAmount)}</div>
                    <div className={styles.perLine}>{'\u603b\u8ba1'} <em>{fmtMoney(bill.total_amount)}</em></div>
                </div>
                <div className={styles.bottomRow}>
                    <div className={styles.avatars}>{memberAvatars}</div>
                    <div className={`${styles.pill} ${bill.settled ? styles.ok : styles.ng}`}>
                        {bill.settled ? '\u2713 \u5df2\u7ed3\u6e05' : '\u5f85\u7ed3\u7b97'}
                    </div>
                </div>
            </div>
        </div>
    );
}
