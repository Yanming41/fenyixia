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
    // Start with loading=false, user=null — no auto-login on startup
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Only listen for auth changes triggered by explicit signIn/signOut actions
    useEffect(() => {
        const { data: { subscription } } = authService.onAuthChange((u, event) => {
            // Ignore INITIAL_SESSION — we don't auto-login on startup
            if (event === 'INITIAL_SESSION') return;
            setUser(u);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await authService.signIn(email, password);
            // onAuthChange SIGNED_IN event will call setUser + setLoading(false)
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
