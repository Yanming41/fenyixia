import { useRef, useEffect, useCallback } from 'react';
import type { Bill } from '../../types/bill';
import { BillCard } from '../BillCard';
import { useCarousel } from '../../hooks/useCarousel';
import styles from './BillCardCarousel.module.css';

interface BillCardCarouselProps {
    bills: Bill[];
    onCardClick?: (bill: Bill, index: number) => void;
}

export function BillCardCarousel({ bills, onCardClick }: BillCardCarouselProps) {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const stageRef = useRef<HTMLDivElement>(null);

    const carousel = useCarousel({ count: bills.length, id: 'main-bills' });

    // 更新 DOM (绕过 React re-render 保证 60fps)
    const updateCards = useCallback((frac: number) => {
        cardRefs.current.forEach((el, i) => {
            if (!el) return;
            const t = carousel.getCardTransform(i, frac);
            el.style.transform = `translateX(${t.x}px) translateY(${t.y}px) scale(${t.scale})`;
            el.style.opacity = String(t.opacity);
            el.style.zIndex = String(t.zIndex);
        });
    }, [carousel]);

    useEffect(() => {
        carousel.onRender(updateCards);
        // Restore initial or current fraction instead of forcing 0
        updateCards(carousel.frac.current);
    }, [carousel.onRender, carousel.frac, updateCards]);

    // 触摸/鼠标事件
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

    const handleCardClick = useCallback((bill: Bill, i: number) => {
        if (carousel.wasDragged.current) return; // swipe, not tap
        onCardClick?.(bill, i);
    }, [carousel, onCardClick]);

    return (
        <div className={styles.stage}>
            <div
                ref={stageRef}
                className={styles.cardArea}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ touchAction: 'none' }}
            >
                {bills.map((bill, i) => (
                    <div
                        key={bill.id}
                        ref={(el) => { cardRefs.current[i] = el; }}
                    >
                        <BillCard
                            bill={bill}
                            onClick={() => handleCardClick(bill, i)}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.dots}>
                {bills.map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot} ${i === carousel.current ? styles.dotOn : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
