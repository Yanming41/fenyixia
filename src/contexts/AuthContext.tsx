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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Listen for SIGNED_OUT to clear user; ignore everything else
    useEffect(() => {
        const { data: { subscription } } = authService.onAuthChange((event) => {
            console.log('[Auth] event=', event);
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        console.log('[signIn] start');
        try {
            await authService.signIn(email, password);
            console.log('[signIn] auth ok, fetching user from DB...');
            const u = await authService.getCurrentUser();
            console.log('[signIn] user=', u ? u.name : 'null');
            setUser(u);
        } catch (e) {
            console.error('[signIn] error:', e);
            const appErr = toAppError(e);
            setError(appErr.message);
        } finally {
            setLoading(false);
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
            const u = await authService.getCurrentUser();
            setUser(u);
        } catch (e) {
            const appErr = toAppError(e);
            setError(appErr.message);
        } finally {
            setLoading(false);
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
