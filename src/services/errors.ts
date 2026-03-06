/** 统一错误处理：Supabase 错误 → 用户友好中文提示 */

export interface AppError {
    message: string;
    code?: string;
    original?: unknown;
}

/** Supabase 错误码 → 中文消息映射 */
const ERROR_MESSAGES: Record<string, string> = {
    // 认证相关
    'invalid_credentials': '邮箱或密码错误',
    'email_not_confirmed': '邮箱未验证，请检查收件箱',
    'user_already_exists': '该邮箱已注册',
    'signup_disabled': '注册已关闭',
    'weak_password': '密码强度不够，请使用更复杂的密码',

    // 权限相关
    'insufficient_privilege': '权限不足',
    'PGRST301': '登录已过期，请重新登录',

    // 网络相关
    'FETCH_ERROR': '网络连接失败，请检查网络',
    'TIMEOUT': '请求超时，请稍后重试',

    // 通用
    '23505': '记录已存在',
    '23503': '关联数据不存在',
};

/** 将任意错误转换为 AppError */
export function toAppError(error: unknown): AppError {
    if (!error) {
        return { message: '未知错误' };
    }

    // Supabase AuthError
    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;

        // AuthApiError
        if (err.message && typeof err.message === 'string') {
            const code = (err.code as string) ?? (err.status as string) ?? '';
            const mapped = ERROR_MESSAGES[code] ?? ERROR_MESSAGES[err.message as string];
            return {
                message: mapped ?? (err.message as string),
                code,
                original: error,
            };
        }

        // PostgrestError
        if (err.code && typeof err.code === 'string') {
            const mapped = ERROR_MESSAGES[err.code];
            return {
                message: mapped ?? `数据库错误 (${err.code})`,
                code: err.code,
                original: error,
            };
        }
    }

    // 网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
            message: ERROR_MESSAGES['FETCH_ERROR']!,
            code: 'FETCH_ERROR',
            original: error,
        };
    }

    // 字符串
    if (typeof error === 'string') {
        return { message: error };
    }

    return { message: '操作失败，请稍后重试', original: error };
}

/** 判断是否为认证过期错误 */
export function isAuthExpired(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        const status = err.status as number | undefined;
        const code = err.code as string | undefined;
        return status === 401 || status === 403 || code === 'PGRST301';
    }
    return false;
}
