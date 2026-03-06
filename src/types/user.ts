/** 用户基本信息 */
export interface User {
    id: string;
    name: string;
    email: string;
    emoji: string;
    color: string;
    created_at?: string;
}

/** 轻量用户引用（在账单条目中使用） */
export interface UserRef {
    id: string;
    name: string;
    emoji: string;
}

/** 好友关系 */
export interface Friendship {
    id: string;
    user_a: string;
    user_b: string;
    created_at: string;
}

/** 认证状态 */
export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}
