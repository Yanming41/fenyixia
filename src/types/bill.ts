import type { UserRef } from './user';

/** 账单条目中的分摊成员 */
export interface BillItemMember {
    user: UserRef;
}

/** 账单条目（小票上的每一项） */
export interface BillItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    members: UserRef[];
}

/** 前端展示用的标准化账单格式 */
export interface Bill {
    id: string;
    icon: string;
    title: string;
    description: string;
    total_amount: number;
    date: string;               // ISO 'YYYY-MM-DD'
    payer_id: string;
    payer_name: string;
    payer_emoji: string;
    settled: boolean;
    color: string;
    items: BillItem[];
    members: UserRef[];         // 所有唯一参与人
    per_amount: number;         // 均摊金额
    my_share: number;           // 我应摊多少
}

/** 创建账单时的输入数据 */
export interface CreateBillData {
    icon: string;
    title: string;
    description?: string;
    date?: string;
    color?: string;
    items: {
        name: string;
        price: number;
        qty?: number;
        member_ids: string[];
    }[];
}

/** 更新账单时的输入数据 */
export interface UpdateBillData {
    title: string;
    icon: string;
    description?: string;
    items: {
        name: string;
        price: number;
        qty?: number;
        member_ids: string[];
    }[];
}

/** Supabase 原始账单数据格式 */
export interface RawBill {
    id: string;
    icon: string;
    title: string;
    description: string | null;
    total_amount: number;
    date: string;
    payer_id: string;
    settled: boolean;
    color: string | null;
    created_at: string;
    payer?: { id: string; name: string; emoji: string } | null;
    items?: RawBillItem[];
}

/** Supabase 原始账单条目格式 */
export interface RawBillItem {
    id: string;
    name: string;
    price: number | string;
    qty: number;
    sort_order: number;
    members?: { user: UserRef }[];
}

/** 付款凭证 */
export interface PaymentProof {
    id: string;
    bill_id: string;
    user_id: string;
    image_url: string;
    created_at: string;
    user?: UserRef | null;
}

/** 怒气反应 */
export interface AngerReaction {
    id: string;
    bill_id: string;
    user_id: string;
    anger_count: number;
    seen: boolean;
    updated_at: string;
    user?: UserRef | null;
}
