import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { SummaryCards } from '../../components/SummaryCards';
import { BillCardCarousel } from '../../components/BillCardCarousel';
import { useBills } from '../../contexts/BillsContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Bill } from '../../types/bill';

export function HomePage() {
    const { bills, loading } = useBills();
    const { user } = useAuth();
    const navigate = useNavigate();

    const summary = useMemo(() => {
        let collected = 0, collectPending = 0, paid = 0, owePending = 0;
        if (!user) return { collected, collectPending, paid, owePending };

        bills.forEach((b: Bill) => {
            if (b.payer_id === user.id) {
                // 我垫付的，别人应还给我
                const othersShare = b.total_amount - b.my_share;
                if (b.settled) collected += othersShare;
                else collectPending += othersShare;
            } else {
                // 别人垫付的，我应还
                if (b.settled) paid += b.my_share;
                else owePending += b.my_share;
            }
        });
        return { collected, collectPending, paid, owePending };
    }, [bills, user]);

    const handleCardClick = (bill: Bill) => {
        navigate(`/bills/${bill.id}`);
    };

    return (
        <div style={{ paddingBottom: 'calc(var(--bottom-nav-height) + var(--safe-bottom) + 16px)' }}>
            <Header subtitle={`${bills.length} 笔账单`} />
            <SummaryCards data={summary} />

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text3)', marginTop: 60 }}>
                    加载中...
                </div>
            ) : bills.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text3)', marginTop: 60 }}>
                    还没有账单，点击 ＋ 创建第一笔
                </div>
            ) : (
                <BillCardCarousel bills={bills} onCardClick={handleCardClick} />
            )}
        </div>
    );
}
