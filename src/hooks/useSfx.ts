import { useRef, useCallback, useEffect, useState } from 'react';

interface SfxConfig {
    /** 内置音效文件路径列表 */
    builtinSounds?: { name: string; src: string }[];
    /** 初始音量 0-1 */
    volume?: number;
}

export function useSfx(config: SfxConfig = {}) {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const soundsRef = useRef<AudioBuffer[]>([]);
    const namesRef = useRef<string[]>([]);
    const currentRef = useRef(0);
    const volumeRef = useRef(config.volume ?? 0.6);
    const [enabled, setEnabled] = useState(true);
    const lastIntRef = useRef(0);

    const getCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    /** 播放当前选中的音效 */
    const play = useCallback(() => {
        if (!enabled || soundsRef.current.length === 0) return;
        const ctx = getCtx();
        if (ctx.state === 'suspended') ctx.resume();
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = soundsRef.current[currentRef.current % soundsRef.current.length];
        gain.gain.value = volumeRef.current;
        src.connect(gain).connect(ctx.destination);
        src.start();
    }, [enabled, getCtx]);

    /** 检测 frac 是否跨过整数边界，触发音效 */
    const checkTrigger = useCallback((frac: number) => {
        const nearest = Math.round(frac);
        if (nearest !== lastIntRef.current) {
            lastIntRef.current = nearest;
            play();
        }
    }, [play]);

    /** 加载音频文件 */
    const loadFile = useCallback(async (file: File) => {
        const ctx = getCtx();
        const buf = await file.arrayBuffer();
        const audio = await ctx.decodeAudioData(buf);
        soundsRef.current.push(audio);
        namesRef.current.push(file.name.replace(/\.[^.]+$/, ''));
        currentRef.current = soundsRef.current.length - 1;
    }, [getCtx]);

    /** 加载内置音效 */
    const loadBuiltin = useCallback(async (url: string, name: string) => {
        const ctx = getCtx();
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        const audio = await ctx.decodeAudioData(buf);
        soundsRef.current.push(audio);
        namesRef.current.push(name);
    }, [getCtx]);

    /** 切换到下一个音效 */
    const nextSound = useCallback(() => {
        if (soundsRef.current.length < 2) return;
        currentRef.current = (currentRef.current + 1) % soundsRef.current.length;
    }, []);

    /** 设置音量 */
    const setVolume = useCallback((v: number) => {
        volumeRef.current = v;
    }, []);

    // 加载内置音效
    useEffect(() => {
        if (config.builtinSounds) {
            (async () => {
                for (const s of config.builtinSounds!) {
                    await loadBuiltin(s.src, s.name);
                }
                currentRef.current = 0;
            })();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        play,
        checkTrigger,
        loadFile,
        nextSound,
        enabled,
        setEnabled,
        setVolume,
        soundNames: namesRef,
        currentIndex: currentRef,
    };
}
