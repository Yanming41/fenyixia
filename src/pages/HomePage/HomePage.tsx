import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { SummaryCards } from '../../components/SummaryCards';
import { BillCardCarousel } from '../../components/BillCardCarousel';
import { MonthPileCard } from '../../components/MonthPileCard';
import { useBills } from '../../contexts/BillsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { useCarousel } from '../../hooks/useCarousel';
import { getUnseenAnger, markAngerSeen } from '../../services/reactions';
import { isoToMonthKey } from '../../utils/format';
import type { Bill } from '../../types/bill';
import styles from './HomePage.module.css';

type ViewMode = 'all' | 'months' | 'month-detail';

export function HomePage() {
    const { bills, loading } = useBills();
    const { user } = useAuth();
    const { show: showToast } = useToast();
    const navigate = useNavigate();
    const angerChecked = useRef(false);

    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [currentMonthKey, setCurrentMonthKey] = useState<string | null>(null);

    // Check for unseen anger on mount
    useEffect(() => {
        if (!user || angerChecked.current) return;
        angerChecked.current = true;

        const timer = setTimeout(async () => {
            try {
                const reactions = await getUnseenAnger(user.id);
                if (!reactions || reactions.length === 0) return;

                let totalAnger = 0;
                const ids: string[] = [];
                reactions.forEach(r => {
                    totalAnger += r.anger_count;
                    ids.push(r.id);
                });

                for (let i = 0; i < Math.min(totalAnger, 20); i++) {
                    setTimeout(() => {
                        const emoji = document.createElement('div');
                        emoji.textContent = '😡';
                        emoji.style.cssText = `
                            position:fixed;font-size:28px;pointer-events:none;z-index:9999;
                            left:${Math.random() * 100}%;bottom:0;
                            animation:angerStorm 2.2s ease-out forwards;
                        `;
                        document.body.appendChild(emoji);
                        setTimeout(() => emoji.remove(), 2500);
                    }, i * 150);
                }

                setTimeout(() => {
                    showToast(`😡 收到怒气 ×${totalAnger}`, 'error');
                }, Math.min(totalAnger, 20) * 150 + 400);

                markAngerSeen(ids);
            } catch {
                // ignore
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [user, showToast]);

    const summary = useMemo(() => {
        let collected = 0, collectPending = 0, paid = 0, owePending = 0;
        if (!user) return { collected, collectPending, paid, owePending };

        bills.forEach((b: Bill) => {
            if (b.payer_id === user.id) {
                const othersShare = b.total_amount - b.my_share;
                if (b.settled) collected += othersShare;
                else collectPending += othersShare;
            } else {
                if (b.settled) paid += b.my_share;
                else owePending += b.my_share;
            }
        });
        return { collected, collectPending, paid, owePending };
    }, [bills, user]);

    // Month grouping
    const monthGroups = useMemo(() => {
        const groups: Record<string, Bill[]> = {};
        bills.forEach(b => {
            const key = isoToMonthKey(b.date);
            if (!groups[key]) groups[key] = [];
            groups[key].push(b);
        });
        const monthOrder = ['12月', '11月', '10月', '9月', '8月', '7月', '6月', '5月', '4月', '3月', '2月', '1月'];
        const keys = Object.keys(groups).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        return { groups, keys };
    }, [bills]);

    const monthDetailBills = useMemo(() => {
        if (viewMode !== 'month-detail' || !currentMonthKey) return [];
        return monthGroups.groups[currentMonthKey] || [];
    }, [viewMode, currentMonthKey, monthGroups]);

    const handleCardClick = (bill: Bill) => {
        navigate(`/bills/${bill.id}`);
    };

    const handleClipBtn = () => {
        if (viewMode === 'all') {
            setViewMode('months');
        } else {
            setViewMode('all');
            setCurrentMonthKey(null);
        }
    };

    const handleMonthClick = (key: string) => {
        setCurrentMonthKey(key);
        setViewMode('month-detail');
    };

    const handleBack = () => {
        if (viewMode === 'month-detail') {
            setViewMode('months');
        }
    };

    let sectionLabel = '最近账单';
    if (viewMode === 'months') sectionLabel = '月份账单';
    else if (viewMode === 'month-detail' && currentMonthKey) sectionLabel = `${currentMonthKey}的账单`;

    return (
        <div style={{ paddingBottom: 'calc(var(--bottom-nav-height) + var(--safe-bottom) + 16px)' }}>
            <Header subtitle={`${bills.length} 笔账单`} />
            <SummaryCards data={summary} />

            <div className={styles.sectionLabelRow}>
                {viewMode === 'month-detail' && (
                    <button className={styles.backBtn} onClick={handleBack}>← 返回</button>
                )}
                <div className={styles.sectionLabel}>{sectionLabel}</div>
                <div className={styles.navRight}>
                    <button
                        className={`${styles.clipBtn} ${viewMode !== 'all' ? styles.clipActive : ''}`}
                        onClick={handleClipBtn}
                    >
                        📌
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text3)', marginTop: 60 }}>
                    加载中...
                </div>
            ) : bills.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text3)', marginTop: 60 }}>
                    还没有账单，点击 ＋ 创建第一笔
                </div>
            ) : viewMode === 'all' ? (
                <BillCardCarousel bills={bills} onCardClick={handleCardClick} />
            ) : viewMode === 'months' ? (
                <MonthPileCarousel
                    monthKeys={monthGroups.keys}
                    monthGroups={monthGroups.groups}
                    onMonthClick={handleMonthClick}
                />
            ) : (
                <BillCardCarousel bills={monthDetailBills} onCardClick={handleCardClick} />
            )}
        </div>
    );
}

function MonthPileCarousel({
    monthKeys,
    monthGroups,
    onMonthClick,
}: {
    monthKeys: string[];
    monthGroups: Record<string, Bill[]>;
    onMonthClick: (key: string) => void;
}) {
    const pileRefs = useRef<(HTMLDivElement | null)[]>([]);
    const carousel = useCarousel({ count: monthKeys.length });

    const updatePiles = useCallback((frac: number) => {
        pileRefs.current.forEach((el, i) => {
            if (!el) return;
            const t = carousel.getCardTransform(i, frac);
            el.style.transform = `translateX(${t.x}px) translateY(${t.y}px) scale(${t.scale})`;
            el.style.opacity = String(t.opacity);
            el.style.zIndex = String(t.zIndex);
        });
    }, [carousel]);

    useEffect(() => {
        carousel.onRender(updatePiles);
        updatePiles(0);
    }, [carousel, updatePiles]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        carousel.onDragStart(e.clientX);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [carousel]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        carousel.onDragMove(e.clientX);
    }, [carousel]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        carousel.onDragEnd(e.clientX);
    }, [carousel]);

    return (
        <div className={styles.monthStage}>
            <div
                className={styles.monthCardArea}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ touchAction: 'none' }}
            >
                {monthKeys.map((key, i) => (
                    <div key={key} ref={el => { pileRefs.current[i] = el; }}>
                        <MonthPileCard
                            monthKey={key}
                            bills={monthGroups[key]}
                            onClick={() => onMonthClick(key)}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.dots}>
                {monthKeys.map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot} ${i === carousel.current ? styles.dotOn : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
