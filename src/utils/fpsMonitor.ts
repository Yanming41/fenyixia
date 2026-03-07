/**
 * FPS Monitor — toggle via browser console:
 *   showFPS()  — show overlay
 *   hideFPS()  — hide overlay
 */
let rafId: number | null = null;

function createOverlay(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'fps-overlay';
    Object.assign(el.style, {
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: '99999',
        background: 'rgba(0,0,0,0.65)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '13px',
        fontWeight: 'bold',
        padding: '3px 8px',
        borderRadius: '6px',
        pointerEvents: 'none',
        backdropFilter: 'blur(4px)',
        lineHeight: '1.4',
    });
    document.body.appendChild(el);
    return el;
}

function startLoop(el: HTMLElement) {
    let last = performance.now();
    let frames = 0;
    let fps = 0;

    const tick = (now: number) => {
        frames++;
        const delta = now - last;
        if (delta >= 500) {
            fps = Math.round((frames * 1000) / delta);
            frames = 0;
            last = now;
            const color = fps >= 55 ? '#0f0' : fps >= 30 ? '#ff0' : '#f44';
            el.style.color = color;
            el.textContent = `${fps} fps`;
        }
        rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
}

function stopLoop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

declare global {
    interface Window {
        showFPS: () => void;
        hideFPS: () => void;
    }
}

window.showFPS = () => {
    let el = document.getElementById('fps-overlay');
    if (!el) el = createOverlay();
    el.style.display = 'block';
    stopLoop();
    startLoop(el);
    console.log('[FPS] overlay on');
};

window.hideFPS = () => {
    stopLoop();
    const el = document.getElementById('fps-overlay');
    if (el) el.style.display = 'none';
    console.log('[FPS] overlay off');
};
