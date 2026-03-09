## Context

当前 `fetchMyBills` 使用 `.order('date', { ascending: false })` 排序，`date` 是用户手动填写的账单日期字段，可能为空或不准确，导致列表顺序混乱。数据库已有 `created_at` 时间戳字段，由 Supabase 自动生成。

## Goals / Non-Goals

**Goals:**
- 账单按 `created_at` 降序排列，最新创建的显示在最前

**Non-Goals:**
- 不更改月份分组逻辑（分组仍按 `date` 字段）
- 不添加用户自定义排序功能

## Decisions

**排序字段选择 `created_at` 而非 `date`：**
- `created_at` 由数据库自动生成，不可为空且稳定
- `date` 依赖用户输入，不可靠
- 替代方案：按 `updated_at` 排序 → 拒绝，因编辑旧账单不应使其跳到顶部

## Risks / Trade-offs

- **风险**：如果用户习惯了按账单日期排序 → 影响极小，当前排序已经混乱
- **风险**：月份分组可能与排序不一致（12月创建的账单标为11月日期） → 可接受，后续可优化
