import { useState } from 'react';
import { BottomSheet } from '../BottomSheet';
import { CAROUSEL_DEFAULTS } from '../../hooks/useCarousel';
import styles from './DebugPanel.module.css';

type Param = {
    key: keyof typeof CAROUSEL_DEFAULTS;
    label: string;
    min: number;
    max: number;
    step: number;
};

const PARAMS: Param[] = [
    { key: 'step', label: '卡片间距 step', min: 50, max: 300, step: 1 },
    { key: 'dragPx', label: '拖动灵敏度 dragPx', min: 20, max: 200, step: 1 },
    { key: 'scaleStep', label: '缩放步幅 scaleStep', min: 0, max: 0.5, step: 0.01 },
    { key: 'minScale', label: '最小缩放 minScale', min: 0.3, max: 1.0, step: 0.01 },
    { key: 'yStep', label: '下沉步幅 yStep', min: 0, max: 60, step: 1 },
    { key: 'opacityStep', label: '透明衰减 opacityStep', min: 0, max: 1, step: 0.01 },
    { key: 'snapDur', label: 'Snap时长 snapDur(ms)', min: 100, max: 1000, step: 10 },
    { key: 'inertiaDur', label: '惯性时长 inertiaDur', min: 50, max: 800, step: 10 },
    { key: 'inertiaRatio', label: '惯性比 inertiaRatio', min: 0, max: 2, step: 0.05 },
    { key: 'curveX', label: '曲线X curveX', min: 0.1, max: 3, step: 0.05 },
    { key: 'curveScale', label: '曲线Scale curveScale', min: 0.1, max: 5, step: 0.05 },
    { key: 'curveY', label: '曲线Y curveY', min: 0.1, max: 3, step: 0.05 },
    { key: 'masterScale', label: '基础缩放 masterScale', min: 0.5, max: 2.0, step: 0.05 },
    { key: 'fontScale', label: '字体缩放 fontScale', min: 0.5, max: 2.0, step: 0.05 },
    { key: 'topOffset', label: '下沉高度 topOffset (px)', min: -50, max: 200, step: 2 },
    { key: 'baseOpacity', label: '全局透明 baseOpacity', min: 0.1, max: 1.0, step: 0.05 },
];

const ORIGINAL_DEFAULTS = { ...CAROUSEL_DEFAULTS };

interface DebugPanelProps {
    open: boolean;
    onClose: () => void;
}

export function DebugPanel({ open, onClose }: DebugPanelProps) {
    // Force re-render when sliders move to update the UI
    const [, setRenderTrigger] = useState(0);

    const handleInput = (key: keyof typeof CAROUSEL_DEFAULTS, val: string) => {
        const num = parseFloat(val);
        (CAROUSEL_DEFAULTS as Record<string, number>)[key] = num;
        setRenderTrigger(v => v + 1);
        window.dispatchEvent(new Event('debug-update'));
    };

    const handleReset = () => {
        Object.assign(CAROUSEL_DEFAULTS, ORIGINAL_DEFAULTS);
        setRenderTrigger(v => v + 1);
        window.dispatchEvent(new Event('debug-update'));
    };

    return (
        <BottomSheet open={open} onClose={onClose}>
            <div className={styles.title}>🛠 Carousel Debug</div>

            <button className={styles.resetBtn} onClick={handleReset}>
                ↺ Reset defaults
            </button>

            {PARAMS.map(({ key, label, min, max, step }) => (
                <div key={key} className={styles.row}>
                    <div className={styles.topRow}>
                        <span>{label}</span>
                        <span className={styles.val}>{CAROUSEL_DEFAULTS[key]}</span>
                    </div>
                    <input
                        type="range"
                        className={styles.slider}
                        min={min}
                        max={max}
                        step={step}
                        value={CAROUSEL_DEFAULTS[key]}
                        onChange={(e) => handleInput(key, e.target.value)}
                    />
                </div>
            ))}
        </BottomSheet>
    );
}
