import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import type { Bill, CreateBillData, UpdateBillData } from '../types/bill';
import * as billsService from '../services/bills';
import { useAuth } from './AuthContext';
import { toAppError } from '../services/errors';

interface BillsContextValue {
    bills: Bill[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    createBill: (data: CreateBillData) => Promise<string>;
    updateBill: (billId: string, data: UpdateBillData) => Promise<void>;
    deleteBill: (billId: string) => Promise<void>;
    toggleSettled: (billId: string, settled: boolean) => Promise<void>;
}

const BillsContext = createContext<BillsContextValue | null>(null);

export function BillsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!user) {
            setBills([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await billsService.fetchMyBills(user.id);
            setBills(data);
        } catch (e) {
            setError(toAppError(e).message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 登录后自动加载
    useEffect(() => {
        if (user) {
            refresh();
        } else {
            setBills([]);
        }
    }, [user, refresh]);

    const createBill = useCallback(async (data: CreateBillData): Promise<string> => {
        if (!user) throw new Error('未登录');
        const billId = await billsService.createBill(user.id, data);
        await refresh();
        return billId;
    }, [user, refresh]);

    const updateBill = useCallback(async (billId: string, data: UpdateBillData) => {
        await billsService.updateBill(billId, data);
        await refresh();
    }, [refresh]);

    const deleteBill = useCallback(async (billId: string) => {
        await billsService.deleteBill(billId);
        await refresh();
    }, [refresh]);

    const toggleSettled = useCallback(async (billId: string, settled: boolean) => {
        await billsService.toggleSettled(billId, settled);
        await refresh();
    }, [refresh]);

    return (
        <BillsContext.Provider
            value={{ bills, loading, error, refresh, createBill, updateBill, deleteBill, toggleSettled }}
        >
            {children}
        </BillsContext.Provider>
    );
}

export function useBills(): BillsContextValue {
    const ctx = useContext(BillsContext);
    if (!ctx) throw new Error('useBills must be used within BillsProvider');
    return ctx;
}
