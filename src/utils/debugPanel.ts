/**
 * Debug Panel — triggered by triple-tap/click on any element with data-debug-trigger attribute
 * Exposes carousel config sliders for live tuning.
 *
 * Usage in console: openDebugPanel() / closeDebugPanel()
 */
import { CAROUSEL_DEFAULTS } from '../hooks/useCarousel';

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
];

function buildPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        width: '280px',
        height: '100dvh',
        overflowY: 'auto',
        background: 'rgba(10,10,18,0.92)',
        backdropFilter: 'blur(16px)',
        zIndex: '99998',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ccc',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box',
    });

    const title = document.createElement('div');
    title.textContent = '🛠 Carousel Debug';
    Object.assign(title.style, { color: '#fff', fontWeight: 'bold', fontSize: '13px', marginBottom: '12px' });
    panel.appendChild(title);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '↺ Reset defaults';
    Object.assign(resetBtn.style, {
        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
        padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
        marginBottom: '14px', fontSize: '11px', width: '100%',
    });
    panel.appendChild(resetBtn);

    PARAMS.forEach(({ key, label, min, max, step }) => {
        const row = document.createElement('div');
        row.style.marginBottom = '10px';

        const topRow = document.createElement('div');
        Object.assign(topRow.style, { display: 'flex', justifyContent: 'space-between', marginBottom: '3px' });

        const lbl = document.createElement('span');
        lbl.textContent = label;

        const val = document.createElement('span');
        val.style.color = '#0f0';
        val.textContent = String(CAROUSEL_DEFAULTS[key]);

        topRow.appendChild(lbl);
        topRow.appendChild(val);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = String(min);
        slider.max = String(max);
        slider.step = String(step);
        slider.value = String(CAROUSEL_DEFAULTS[key]);
        Object.assign(slider.style, { width: '100%', accentColor: '#0f0' });

        slider.addEventListener('input', () => {
            const n = parseFloat(slider.value);
            (CAROUSEL_DEFAULTS as Record<string, number>)[key] = n;
            val.textContent = String(n);
        });

        row.appendChild(topRow);
        row.appendChild(slider);
        panel.appendChild(row);

        resetBtn.addEventListener('click', () => {
            // re-read value from a fresh copy of originalDefaults
            const fresh = ORIGINAL_DEFAULTS[key];
            (CAROUSEL_DEFAULTS as Record<string, number>)[key] = fresh;
            slider.value = String(fresh);
            val.textContent = String(fresh);
        });
    });

    return panel;
}

// Snapshot of original defaults before any live edits
const ORIGINAL_DEFAULTS = { ...CAROUSEL_DEFAULTS };

function openDebugPanel() {
    let panel = document.getElementById('debug-panel');
    if (!panel) {
        panel = buildPanel();
        document.body.appendChild(panel);
    }
    panel.style.display = 'block';
    console.log('[Debug] panel open');
}

function closeDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) panel.style.display = 'none';
    console.log('[Debug] panel closed');
}

// Triple-click/tap trigger on elements with data-debug-trigger
let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;

document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-debug-trigger]')) return;
    clickCount++;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 600);
    if (clickCount >= 3) {
        clickCount = 0;
        openDebugPanel();
    }
});

// Expose globally
declare global {
    interface Window {
        openDebugPanel: () => void;
        closeDebugPanel: () => void;
    }
}
window.openDebugPanel = openDebugPanel;
window.closeDebugPanel = closeDebugPanel;
