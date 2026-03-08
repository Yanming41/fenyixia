import React, { createContext, useContext, useState, ReactNode } from 'react';

// Animation configuration — matches original split-app.js CFG
export interface DebugConfig {
    STEP: number;
    DRAG_PX: number;
    SCALE_STEP: number;
    MIN_SCALE: number;
    Y_STEP: number;
    OPACITY_STEP: number;
    SNAP_DUR: number;
    POP_SCALE: number;
    POP_DUR: number;
    INERTIA_DUR_MIN: number;
    INERTIA_DUR_MAX: number;
    INERTIA_RATIO: number;
    curveX: number;
    curveScale: number;
    curveY: number;
    curveOpacity: number;

    // Visual Toggles
    showShadows: boolean;
    showFps: boolean;
    showTexture: boolean;
    showSheen: boolean;
}

export const defaultDebugConfig: DebugConfig = {
    STEP: 148,
    DRAG_PX: 72,
    SCALE_STEP: 0.13,
    MIN_SCALE: 0.60,
    Y_STEP: 14,
    OPACITY_STEP: 0.26,
    SNAP_DUR: 0.42,
    POP_SCALE: 1.08,
    POP_DUR: 0.28,
    INERTIA_DUR_MIN: 0.2,
    INERTIA_DUR_MAX: 0.6,
    INERTIA_RATIO: 0.35,
    curveX: 0.8,
    curveScale: 2.4,
    curveY: 1.7,
    curveOpacity: 1.7,

    showShadows: true,
    showFps: false,
    showTexture: true,
    showSheen: true,
};

interface DebugContextType {
    config: DebugConfig;
    updateConfig: (updates: Partial<DebugConfig>) => void;
    isDebugOpen: boolean;
    setIsDebugOpen: (open: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<DebugConfig>(defaultDebugConfig);
    // Default to false in production, but we can toggle it easily
    const [isDebugOpen, setIsDebugOpen] = useState(false);

    const updateConfig = (updates: Partial<DebugConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    return (
        <DebugContext.Provider value={{ config, updateConfig, isDebugOpen, setIsDebugOpen }}>
            {children}
        </DebugContext.Provider>
    );
}

export function useDebugConfig() {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error('useDebugConfig must be used within a DebugProvider');
    }
    return context;
}
