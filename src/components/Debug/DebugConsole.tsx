import { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useDebugConfig, DebugConfig } from '../../contexts/DebugContext';

// Basic helper for slider rows
function SliderRow({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    unit = ''
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    unit?: string;
}) {
    return (
        <div className="dbg-row">
            <span className="dbg-label">{label}</span>
            <input
                className="dbg-slider"
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className="dbg-val">{value}{unit}</span>
        </div>
    );
}

// Basic helper for toggle rows
function ToggleRow({
    label,
    checked,
    onChange
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="dbg-row">
            <span className="dbg-label">{label}</span>
            <label className="dbg-toggle">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="dbg-toggle-track"></div>
            </label>
        </div>
    );
}

export default function DebugConsole() {
    const { config, updateConfig, isDebugOpen, setIsDebugOpen } = useDebugConfig();
    const controls = useDragControls();

    // If not open, render nothing (or a minimized button, but we'll use a globally accessible way to open it later)
    if (!isDebugOpen) return null;

    return (
        <motion.div
            id="debug-panel"
            drag
            dragControls={controls}
            dragListener={false} // Only drag by handle
            dragMomentum={false}
            initial={{ x: 20, y: 20 }}
            // Note: framer-motion drag on an element with CSS `position: fixed` or `absolute`
            // just applies transforms. The global CSS puts #debug-panel at fixed top/left,
            // so transforms are perfect.
            style={{
                touchAction: 'none' // prevent scrolling while dragging panel
            }}
        >
            <div
                className="dbg-handle"
                onPointerDown={(e) => controls.start(e)}
                style={{ cursor: 'grab' }}
            ></div>
            <div className="dbg-header">
                <div className="dbg-title">🛠 调试控制台</div>
                <button className="dbg-close" onClick={() => setIsDebugOpen(false)}>✕</button>
            </div>

            <div className="dbg-content">
                <div className="dbg-section">动画参数</div>
                <SliderRow label="卡片间距 STEP" value={config.STEP} min={80} max={220} unit="px" onChange={(v) => updateConfig({ STEP: v })} />
                <SliderRow label="拖动灵敏度 DRAG_PX" value={config.DRAG_PX} min={30} max={150} unit="px" onChange={(v) => updateConfig({ DRAG_PX: v })} />
                <SliderRow label="两侧缩放系数" value={Math.round(config.SCALE_STEP * 100)} min={1} max={25} unit="/级" onChange={(v) => updateConfig({ SCALE_STEP: v / 100 })} />
                <SliderRow label="最小缩放 min scale" value={Math.round(config.MIN_SCALE * 100)} min={40} max={90} unit="%" onChange={(v) => updateConfig({ MIN_SCALE: v / 100 })} />
                <SliderRow label="侧移下沉 Y/级" value={config.Y_STEP} min={0} max={40} unit="px" onChange={(v) => updateConfig({ Y_STEP: v })} />
                <SliderRow label="侧卡透明度衰减" value={Math.round(config.OPACITY_STEP * 100)} min={5} max={50} unit="/级" onChange={(v) => updateConfig({ OPACITY_STEP: v / 100 })} />
                <SliderRow label="Snap 过渡时长" value={Math.round(config.SNAP_DUR * 1000)} min={100} max={800} unit="ms" onChange={(v) => updateConfig({ SNAP_DUR: v / 1000 })} />
                <SliderRow label="选中弹跳倍数" value={Math.round(config.POP_SCALE * 100)} min={100} max={130} unit="%" onChange={(v) => updateConfig({ POP_SCALE: v / 100 })} />
                <SliderRow label="弹跳时长" value={Math.round(config.POP_DUR * 1000)} min={100} max={600} unit="ms" onChange={(v) => updateConfig({ POP_DUR: v / 1000 })} />
                <SliderRow label="惯性持续时长" value={Math.round(config.INERTIA_DUR_MAX * 1000)} min={100} max={5000} unit="ms" onChange={(v) => updateConfig({ INERTIA_DUR_MAX: v / 1000 })} />
                <SliderRow label="惯性速度比例" value={Math.round(config.INERTIA_RATIO * 100)} min={10} max={200} unit="%" onChange={(v) => updateConfig({ INERTIA_RATIO: v / 100 })} />

                <div className="dbg-section">曲线函数 (指数)</div>
                <SliderRow label="位移曲线 X" value={config.curveX} min={0.3} max={3.0} step={0.1} onChange={(v) => updateConfig({ curveX: v })} />
                <SliderRow label="缩放曲线 Scale" value={config.curveScale} min={0.3} max={5.0} step={0.1} onChange={(v) => updateConfig({ curveScale: v })} />
                <SliderRow label="下沉曲线 Y" value={config.curveY} min={0.3} max={5.0} step={0.1} onChange={(v) => updateConfig({ curveY: v })} />
                <SliderRow label="透明度曲线 Op" value={config.curveOpacity} min={0.3} max={5.0} step={0.1} onChange={(v) => updateConfig({ curveOpacity: v })} />

                <div className="dbg-section">视觉开关</div>
                <ToggleRow label="显示阴影" checked={config.showShadows} onChange={(v) => updateConfig({ showShadows: v })} />
                <ToggleRow label="显示 FPS 计数" checked={config.showFps} onChange={(v) => updateConfig({ showFps: v })} />
                <ToggleRow label="显示纸张纹理" checked={config.showTexture} onChange={(v) => updateConfig({ showTexture: v })} />
                <ToggleRow label="显示顶部光晕" checked={config.showSheen} onChange={(v) => updateConfig({ showSheen: v })} />

            </div>
        </motion.div>
    );
}
