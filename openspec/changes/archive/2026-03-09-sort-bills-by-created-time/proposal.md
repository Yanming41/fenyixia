## Why

当前首页账单列表按 `date`（用户填写的账单日期）降序排列，但用户经常不填或随意填写日期，导致账单顺序混乱。改为按 `created_at`（数据库创建时间戳）排序，保证最新创建的账单始终显示在最顶部，行为可预测。

## What Changes

- 修改 `fetchMyBills` 查询的 `.order()` 子句，从 `date` 改为 `created_at`
- 排序方向保持 `descending`（最新在前）

## Capabilities

### New Capabilities
- `bill-sort-order`: 账单列表按创建时间降序排列

### Modified Capabilities
（无已有 specs 需要修改）

## Impact

- **代码影响**：仅 `src/lib/api/bills.ts` 中的 `fetchMyBills` 函数
- **数据库**：无 schema 变更，`created_at` 字段已存在
- **用户体验**：账单顺序将更稳定可预测
