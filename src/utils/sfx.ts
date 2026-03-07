import { BUILTIN_SOUNDS } from './audio';

export class SFXManager {
    private static instance: SFXManager;
    private ctx: AudioContext | null = null;
    public enabled: boolean = true;
    public volume: number = 0.6;
    public sounds: AudioBuffer[] = [];
    public current: number = 0;
    public names: string[] = [];
    public lastInt: number = 0;
    private _initialized: boolean = false;

    private constructor() { }

    public static getInstance(): SFXManager {
        if (!SFXManager.instance) {
            SFXManager.instance = new SFXManager();
        }
        return SFXManager.instance;
    }

    public async init() {
        if (this._initialized) return;
        this._initialized = true;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        this.ctx = new AudioContextClass();

        // Load built-in sounds
        for (const sound of BUILTIN_SOUNDS) {
            await this.loadSoundFromDataUri(sound.src, sound.name);
        }

        // Default to the first sound
        this.current = 0;
    }

    private async loadSoundFromDataUri(dataUri: string, name: string) {
        if (!this.ctx) return;
        try {
            const resp = await fetch(dataUri);
            const buf = await resp.arrayBuffer();
            const audio = await this.ctx.decodeAudioData(buf);
            this.sounds.push(audio);
            this.names.push(name);
        } catch (e) {
            console.error('Failed to load sound', name, e);
        }
    }

    public async loadSoundFromFile(file: File) {
        if (!this.ctx) return;
        try {
            const buf = await file.arrayBuffer();
            const audio = await this.ctx.decodeAudioData(buf);
            this.sounds.push(audio);
            this.names.push(file.name.replace(/\.[^.]+$/, ''));
            this.current = this.sounds.length - 1; // Select the newly added sound
        } catch (e) {
            console.error('Failed to load sound file', file.name, e);
        }
    }

    public playSfx() {
        if (!this.enabled || this.sounds.length === 0 || !this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }

        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        src.buffer = this.sounds[this.current % this.sounds.length];
        gain.gain.value = this.volume;

        src.connect(gain).connect(this.ctx.destination);
        src.start();
    }

    public checkSfxTrigger(frac: number) {
        const nearest = Math.round(frac);
        if (nearest !== this.lastInt) {
            this.lastInt = nearest;
            this.playSfx();
        }
    }

    public resetLastInt(frac: number) {
        this.lastInt = Math.round(frac);
    }
}

export const sfx = SFXManager.getInstance();
