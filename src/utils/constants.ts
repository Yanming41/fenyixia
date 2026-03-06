/** 图标 → 颜色映射 */
export const ICON_COLORS: Record<string, string> = {
    '🧾': 'linear-gradient(135deg,#8E8E93,#636366)',
    '🛒': 'linear-gradient(135deg,#34C759,#28A745)',
    '🍜': 'linear-gradient(135deg,#FF9500,#FF6B00)',
    '⚡': 'linear-gradient(135deg,#FF3B30,#FF2D55)',
    '☕': 'linear-gradient(135deg,#007AFF,#5AC8FA)',
    '🏸': 'linear-gradient(135deg,#AF52DE,#5E5CE6)',
    '🎮': 'linear-gradient(135deg,#FF2D55,#AF52DE)',
    '🚗': 'linear-gradient(135deg,#FF9500,#FF6B00)',
    '🏥': 'linear-gradient(135deg,#FF453A,#FF3B30)',
    '🛍️': 'linear-gradient(135deg,#5AC8FA,#007AFF)',
};

/** 新建账单时随机颜色池 */
export const BILL_COLORS: string[] = [
    'linear-gradient(135deg,#34C759,#28A745)',
    'linear-gradient(135deg,#FF9500,#FF6B00)',
    'linear-gradient(135deg,#AF52DE,#5E5CE6)',
    'linear-gradient(135deg,#FF3B30,#FF2D55)',
    'linear-gradient(135deg,#007AFF,#5AC8FA)',
    'linear-gradient(135deg,#FFD60A,#FF9F0A)',
];

/** 可选图标列表 */
export const BILL_ICONS = ['🧾', '🛒', '🍜', '⚡', '☕', '🏸', '🎮', '🚗'];
