import { useRef, useState, useCallback, useEffect } from 'react';

export interface CarouselConfig {
    /** 卡片间距 (px) */
    step?: number;
    /** 拖动灵敏度 (px) */
    dragPx?: number;
    /** 两侧缩放系数 */
    scaleStep?: number;
    /** 最小缩放 */
    minScale?: number;
    /** 下沉步幅 */
    yStep?: number;
    /** 透明度衰减 */
    opacityStep?: number;
    /** Snap 过渡时长 (ms) */
    snapDur?: number;
    /** 惯性持续时间 (ms) */
    inertiaDur?: number;
    /** 惯性速度比例 */
    inertiaRatio?: number;
    /** 曲线指数 */
    curveX?: number;
    curveScale?: number;
    curveY?: number;
    curveOpacity?: number;
    /** 总卡片数 */
    count: number;
}

const DEFAULTS = {
    step: 148,
    dragPx: 72,
    scaleStep: 0.13,
    minScale: 0.60,
    yStep: 14,
    opacityStep: 0.26,
    snapDur: 420,
    inertiaDur: 300,
    inertiaRatio: 0.6,
    curveX: 0.8,
    curveScale: 2.4,
    curveY: 1.7,
    curveOpacity: 1.7,
};

const VELOCITY_WINDOW = 80;

export interface CardTransform {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    zIndex: number;
}

export function useCarousel(config: CarouselConfig) {
    const cfg = { ...DEFAULTS, ...config };
    const N = cfg.count;

    const [current, setCurrent] = useState(0);
    const fracRef = useRef(0);
    const currentRef = useRef(0);
    const draggingRef = useRef(false);
    const draggedRef = useRef(false); // true when drag > threshold
    const startXRef = useRef(0);
    const startFracRef = useRef(0);
    const moveHistoryRef = useRef<{ x: number; t: number }[]>([]);
    const inertiaRafRef = useRef<number | null>(null);
    const renderCallbackRef = useRef<((frac: number) => void) | null>(null);

    /** 计算单张卡片的 transform */
    const getCardTransform = useCallback((index: number, frac: number): CardTransform => {
        const offset = index - frac;
        const absO = Math.abs(offset);
        const sign = Math.sign(offset);

        const cX = Math.pow(absO, cfg.curveX);
        const cS = Math.pow(absO, cfg.curveScale);
        const cY = Math.pow(absO, cfg.curveY);
        const cO = Math.pow(absO, cfg.curveOpacity);

        return {
            x: sign * cX * cfg.step,
            y: cY * cfg.yStep,
            scale: Math.max(cfg.minScale, 1 - cS * cfg.scaleStep),
            opacity: Math.max(0.28, 1 - cO * cfg.opacityStep),
            zIndex: Math.round(50 - absO * 10),
        };
    }, [cfg]);

    /** 触发渲染回调 */
    const render = useCallback((frac: number) => {
        fracRef.current = frac;
        renderCallbackRef.current?.(frac);
    }, []);

    /** ease-out-back: slight overshoot then settle */
    const easeOutBack = (t: number, overshoot = 1.4) => {
        const s = overshoot;
        return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
    };

    const snapRafRef = useRef<number | null>(null);

    /** Snap 到指定卡片（带弹跳动画） */
    const snapTo = useCallback((idx: number) => {
        const target = Math.max(0, Math.min(N - 1, idx));
        currentRef.current = target;
        setCurrent(target);

        // cancel any running snap / inertia
        if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current);
        if (inertiaRafRef.current) {
            cancelAnimationFrame(inertiaRafRef.current);
            inertiaRafRef.current = null;
        }

        const startF = fracRef.current;
        const startTime = performance.now();
        const dur = cfg.snapDur;

        const step = (now: number) => {
            const t = Math.min(1, (now - startTime) / dur);
            const eased = easeOutBack(t);
            const frac = startF + (target - startF) * eased;
            render(frac);
            if (t < 1) {
                snapRafRef.current = requestAnimationFrame(step);
            } else {
                snapRafRef.current = null;
                render(target); // ensure exact landing
            }
        };
        snapRafRef.current = requestAnimationFrame(step);
    }, [N, cfg.snapDur, render]);

    /** 拖动开始 */
    const onDragStart = useCallback((x: number) => {
        if (inertiaRafRef.current) {
            cancelAnimationFrame(inertiaRafRef.current);
            inertiaRafRef.current = null;
        }
        if (snapRafRef.current) {
            cancelAnimationFrame(snapRafRef.current);
            snapRafRef.current = null;
        }
        draggingRef.current = true;
        draggedRef.current = false;
        startXRef.current = x;
        startFracRef.current = fracRef.current;
        moveHistoryRef.current = [{ x, t: Date.now() }];
    }, []);

    /** 拖动移动 */
    const onDragMove = useCallback((x: number) => {
        if (!draggingRef.current) return;
        const now = Date.now();
        moveHistoryRef.current.push({ x, t: now });
        while (
            moveHistoryRef.current.length > 2 &&
            now - moveHistoryRef.current[0].t > VELOCITY_WINDOW
        ) {
            moveHistoryRef.current.shift();
        }
        const dx = x - startXRef.current;
        if (Math.abs(dx) > 6) draggedRef.current = true;
        const raw = startFracRef.current - dx / cfg.dragPx;
        const frac = Math.max(0, Math.min(N - 1, raw));
        render(frac);
    }, [cfg.dragPx, N, render]);

    /** 拖动结束 */
    const onDragEnd = useCallback((x: number) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;

        moveHistoryRef.current.push({ x, t: Date.now() });
        const oldest = moveHistoryRef.current[0];
        const newest = moveHistoryRef.current[moveHistoryRef.current.length - 1];
        const dt = Math.max(1, newest.t - oldest.t);
        const dxRecent = newest.x - oldest.x;
        const velocity = -(dxRecent / cfg.dragPx) / (dt / 1000);

        const startVelocity = velocity * cfg.inertiaRatio;

        if (Math.abs(startVelocity) < 0.3) {
            let target = Math.round(fracRef.current);
            target = Math.max(0, Math.min(N - 1, target));
            snapTo(target);
            return;
        }

        // 惯性滑行
        const inertiaStart = performance.now();
        const inertiaDur = cfg.inertiaDur;
        const inertiaStartF = fracRef.current;

        const inertiaStep = (now: number) => {
            const elapsed = now - inertiaStart;
            const t = Math.min(1, elapsed / inertiaDur);
            const easeT = t * (2 - t);
            const displacement = startVelocity * (inertiaDur / 1000) * easeT * 0.5;
            let frac = inertiaStartF + displacement;
            frac = Math.max(0, Math.min(N - 1, frac));
            render(frac);

            if (t < 1) {
                inertiaRafRef.current = requestAnimationFrame(inertiaStep);
            } else {
                inertiaRafRef.current = null;
                let target = Math.round(frac);
                target = Math.max(0, Math.min(N - 1, target));
                snapTo(target);
            }
        };

        inertiaRafRef.current = requestAnimationFrame(inertiaStep);
    }, [cfg, N, render, snapTo]);

    /** 设置渲染回调（组件用来更新 DOM） */
    const onRender = useCallback((cb: (frac: number) => void) => {
        renderCallbackRef.current = cb;
    }, []);

    // 清理
    useEffect(() => {
        return () => {
            if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
            if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current);
        };
    }, []);

    return {
        current,
        frac: fracRef,
        wasDragged: draggedRef,
        snapTo,
        onDragStart,
        onDragMove,
        onDragEnd,
        getCardTransform,
        onRender,
    };
}
