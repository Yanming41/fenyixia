/** 格式化金额：¥ 268 或 ¥ 268.50 */
export function fmtMoney(n: number): string {
    return `¥ ${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

/** Date 对象 → 中文日期：'2月19日' */
export function fmtDate(d: Date): string {
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** ISO 日期 → 中文显示：'2025-02-19' → '2月19日' */
export function fmtISODate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** ISO 日期 → 月份 key：'2025-02-19' → '2月' */
export function isoToMonthKey(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getMonth() + 1}月`;
}
