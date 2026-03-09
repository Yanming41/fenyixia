import { useState, useEffect, useRef } from 'react';

interface FpsData {
    fps: number;
    color: string;
}

export function useFps(enabled: boolean): FpsData {
    const [fps, setFps] = useState<number>(0);
    const [color, setColor] = useState<string>('var(--label3)');
    const samplesRef = useRef<number[]>([]);
    const lastTsRef = useRef<number>(0);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            setFps(0);
            setColor('var(--label3)');
            samplesRef.current = [];
            lastTsRef.current = 0;
            return;
        }

        const loop = (ts: number) => {
            if (lastTsRef.current) {
                samplesRef.current.push(ts - lastTsRef.current);
                if (samplesRef.current.length > 30) {
                    samplesRef.current.shift();
                }
            }
            lastTsRef.current = ts;

            if (samplesRef.current.length >= 10) {
                const avg = samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length;
                const currentFps = Math.round(1000 / avg);
                setFps(currentFps);
                setColor(currentFps >= 55 ? '#30D158' : currentFps >= 40 ? '#FF9F0A' : '#FF453A');
            }

            rafIdRef.current = requestAnimationFrame(loop);
        };

        rafIdRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [enabled]);

    return { fps, color };
}
