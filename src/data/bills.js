// src/data/bills.js
// ══════════════════════════════════════════
// 模拟账单数据
// 以后对接后端 API 时，把这个文件里的数据
// 替换成 fetch() 返回的内容即可
// ══════════════════════════════════════════

export const BILLS = [
  {
    id: '1',
    icon: '🛒',
    title: '超市采购',
    desc: '月嫂超市 · 生活用品',
    amount: 268,
    date: '2月19日',
    payer: 'Abby',
    settled: true,
    members: ['A', 'L', 'W', 'M'],
    colorIdx: 0,
  },
  {
    id: '2',
    icon: '🍜',
    title: '晚饭外卖',
    desc: '美团 · 沙县小吃',
    amount: 112,
    date: '2月17日',
    payer: 'Lin',
    settled: false,
    members: ['L', 'W', 'A', 'M'],
    colorIdx: 1,
  },
  {
    id: '3',
    icon: '🏸',
    title: '羽毛球馆',
    desc: 'UofT 体育馆 · 2h',
    amount: 192,
    date: '2月15日',
    payer: 'Abby',
    settled: false,
    members: ['A', 'M', 'L', 'W'],
    colorIdx: 2,
  },
  {
    id: '4',
    icon: '⚡',
    title: '月度水电',
    desc: '物业 · 1月账单',
    amount: 712,
    date: '2月1日',
    payer: 'Wendy',
    settled: true,
    members: ['W', 'A', 'L', 'M'],
    colorIdx: 3,
  },
  {
    id: '5',
    icon: '☕',
    title: '星巴克',
    desc: 'Starbucks · 下午茶',
    amount: 136,
    date: '1月29日',
    payer: 'May',
    settled: true,
    members: ['M', 'A', 'L', 'W'],
    colorIdx: 4,
  },
];

// 汇总统计（以后从后端算）
export const SUMMARY = {
  total:    1284,
  toReceive: 312,
  toPay:     48,
};
