// src/theme/index.js
// ══════════════════════════════════════════
// 全局设计 Token
// 修改颜色、字号等都在这里改，组件自动跟着变
// ══════════════════════════════════════════

export const Colors = {
  // 背景
  bg:        '#0d0d14',
  bgCard:    '#13131e',

  // 文字
  text:      '#f0f0f5',
  textDim:   'rgba(240,240,245,0.45)',
  textMuted: 'rgba(240,240,245,0.28)',

  // 品牌色
  accent:    '#7ee8c2',
  accent2:   '#f7c59f',
  accent3:   '#c5a8ff',
  red:       '#ff7b7b',

  // 边框 / 分割线
  border:    'rgba(255,255,255,0.10)',
  borderPaper: 'rgba(180,160,120,0.20)',

  // 纸张色（账单卡片）
  paper:     '#fdfaf4',
  paperMid:  '#f7f3ea',
  paperDark: '#ede8db',
  paperText: '#1e1a14',
  paperDim:  '#8a7e6e',
  paperAccent: '#4a8c72',
};

export const Radius = {
  card:   18,
  pill:   20,
  button: 16,
  small:  10,
};

// 账单分类颜色（对应顶部色块）
export const CategoryColors = [
  ['#7ee8c2', '#4fd4ae'],  // 绿：超市
  ['#f7c59f', '#ff8f6b'],  // 橙：餐饮
  ['#c5a8ff', '#9f7eff'],  // 紫：娱乐
  ['#ff7b7b', '#ff5252'],  // 红：账单
  ['#7eb8e8', '#4fadd4'],  // 蓝：咖啡
];
