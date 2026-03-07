import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import type { User } from '../types/user';
import * as authService from '../services/auth';
import { supabase } from '../services/supabase';
import { toAppError, isAuthExpired } from '../services/errors';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, emoji?: string, color?: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 初始化：从本地 session 恢复用户（不发网络请求，不会卡住）
    useEffect(() => {
        let settled = false;

        const settle = (u: User | null) => {
            if (settled) return;
            settled = true;
            console.log('[Auth] settle called, user=', u ? u.name : 'null');
            setUser(u);
            setLoading(false);
        };

        // Fast path: read session directly (no lock, no network)
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[Auth] getSession result, session=', session ? 'exists' : 'null');
            if (!session) {
                settle(null); // not logged in, stop loading immediately
            }
            // if session exists, wait for onAuthStateChange to fetch full user from users table
        });

        // onAuthStateChange handles both initial session (with user data) and future changes
        const { data: { subscription } } = authService.onAuthChange((u, event) => {
            console.log('[Auth] onAuthChange fired, event=', event, 'user=', u ? u.name : 'null');
            settle(u);
            // After initial settle, allow future changes
            settled = false;
        });

        // Safety net: if nothing resolved in 3s, stop loading anyway
        const timeout = setTimeout(() => {
            console.warn('[Auth] timeout! forcing loading=false');
            settle(null);
        }, 3000);

        return () => {
            settled = true; // prevent any callbacks after unmount
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await authService.signIn(email, password);
            // onAuthChange 会自动更新 user，不需要再调 getCurrentUser
        } catch (e) {
            setLoading(false);
            const appErr = toAppError(e);
            setError(appErr.message);
            throw e;
        }
    }, []);

    const signUp = useCallback(async (
        email: string,
        password: string,
        name: string,
        emoji?: string,
        color?: string
    ) => {
        setError(null);
        setLoading(true);
        try {
            await authService.signUp(email, password, name, emoji, color);
            // onAuthChange 会自动更新 user
        } catch (e) {
            setLoading(false);
            const appErr = toAppError(e);
            setError(appErr.message);
            throw e;
        }
    }, []);

    const signOutFn = useCallback(async () => {
        await authService.signOut();
        setUser(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut: signOutFn, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export { isAuthExpired };
