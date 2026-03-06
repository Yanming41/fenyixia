import { useParams, useNavigate } from 'react-router-dom';
import { useBills } from '../../contexts/BillsContext';
import { fmtMoney, fmtISODate } from '../../utils/format';
import styles from './BillDetailPage.module.css';

export function BillDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { bills, toggleSettled } = useBills();
    const navigate = useNavigate();

    const bill = bills.find((b) => b.id === id);

    if (!bill) {
        return (
            <div className={styles.page}>
                <div className={styles.empty}>账单不存在</div>
                <button className={styles.backBtn} onClick={() => navigate('/')}>← 返回</button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>← 返回</button>

            <div className={styles.card} style={{ background: bill.color }}>
                <div className={styles.icon}>{bill.icon}</div>
                <div className={styles.title}>{bill.title}</div>
                <div className={styles.amount}>{fmtMoney(bill.total_amount)}</div>
                <div className={styles.meta}>
                    {fmtISODate(bill.date)} · {bill.payer_name} 垫付
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>明细</div>
                {bill.items.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                        <span>{item.name}</span>
                        <span className={styles.itemQty}>×{item.qty}</span>
                        <span className={styles.itemPrice}>{fmtMoney(item.price)}</span>
                    </div>
                ))}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>参与人</div>
                <div className={styles.members}>
                    {bill.members.map((m) => (
                        <div key={m.id} className={styles.member}>
                            <span className={styles.memberEmoji}>{m.emoji}</span>
                            <span>{m.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.actionBtn} ${bill.settled ? styles.unsettleBtn : styles.settleBtn}`}
                    onClick={() => toggleSettled(bill.id, !bill.settled)}
                >
                    {bill.settled ? '取消结清' : '✓ 标记已结清'}
                </button>
            </div>
        </div>
    );
}
