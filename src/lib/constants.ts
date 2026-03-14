/** Emoji → Category mapping for statistics classification */
export const EMOJI_TO_CATEGORY_MAP: Record<string, string> = {
  // 餐饮 (Food/Dining)
  '🍔': '餐饮', '🍕': '餐饮', '🍜': '餐饮', '🍝': '餐饮', '🍣': '餐饮',
  '🍱': '餐饮', '🍲': '餐饮', '🍛': '餐饮', '🍙': '餐饮', '🍚': '餐饮',
  '🥘': '餐饮', '🥗': '餐饮', '🌮': '餐饮', '🌯': '餐饮', '🥟': '餐饮',
  '☕': '餐饮', '🍵': '餐饮', '🧋': '餐饮', '🍺': '餐饮', '🍻': '餐饮',
  '🍷': '餐饮', '🥤': '餐饮', '🧃': '餐饮',

  // 购物 (Shopping)
  '🛒': '购物', '🛍️': '购物', '🛍': '购物', '👗': '购物', '👟': '购物',
  '👠': '购物', '👜': '购物', '💄': '购物', '🎁': '购物',

  // 交通 (Transport)
  '🚗': '交通', '🚕': '交通', '🚌': '交通', '🚇': '交通', '🚄': '交通',
  '✈️': '交通', '⛽': '交通', '🚲': '交通', '🛴': '交通',

  // 娱乐 (Entertainment)
  '🎮': '娱乐', '🎬': '娱乐', '🎤': '娱乐', '🎵': '娱乐', '🎲': '娱乐',
  '🎯': '娱乐', '🎳': '娱乐', '🎪': '娱乐',

  // 运动 (Sports)
  '🏸': '运动', '⚽': '运动', '🏀': '运动', '🎾': '运动', '🏊': '运动',
  '🏋️': '运动', '🏋': '运动', '⛷️': '运动', '🚴': '运动', '🏃': '运动',

  // 医疗 (Medical)
  '🏥': '医疗', '💊': '医疗', '🩺': '医疗', '🏨': '医疗',

  // 生活 (Daily Life / Utilities)
  '⚡': '生活', '💡': '生活', '🔧': '生活', '🧹': '生活', '🏠': '生活',
  '🧾': '生活', '📱': '生活', '💻': '生活',
}

/** Get category for a bill icon, falling back to "其他" */
export function getCategoryForIcon(icon: string): string {
  return EMOJI_TO_CATEGORY_MAP[icon] || '其他'
}

/** All category colors for charts */
export const CATEGORY_COLORS: Record<string, string> = {
  '餐饮': '#FF9500',
  '购物': '#5AC8FA',
  '交通': '#FF6B00',
  '娱乐': '#AF52DE',
  '运动': '#30D158',
  '医疗': '#FF453A',
  '生活': '#8E8E93',
  '其他': '#636366',
}
