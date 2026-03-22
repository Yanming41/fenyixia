## 1. 数据库 & 类型

- [x] 1.1 创建 `bill_disputes` 表的 SQL migration（id, bill_id, challenger_id, reason, suggested_items, status, created_at）
- [x] 1.2 在 `src/lib/types.ts` 中新增 `BillDispute` 接口，扩展 `Bill` 类型添加 `dispute?: BillDispute` 字段

## 2. API 层

- [x] 2.1 创建 `src/lib/api/disputes.ts`：fetchDispute(billId)、createDispute(billId, reason, suggestedItems)、resolveDispute(disputeId, accepted: boolean)
- [x] 2.2 在 `src/lib/api/bills.ts` 的 `normalizeBill` 中 join 查询 `bill_disputes`（status='pending'），将活跃争议附加到 Bill 对象
- [x] 2.3 在 resolveDispute 中，当 accepted=true 时调用 `updateBill` 将 suggested_items 写入实际 bill_items

## 3. AI 裁决 Prompt

- [x] 3.1 在 `src/lib/api/scan.ts` 中新增 `buildDisputePrompt(items, members, reason)` 函数，构建裁决 prompt（输入原账单 items+members 和辩词，输出调整后的 items JSON）
- [x] 3.2 定义 AI 返回的 DisputeSuggestion 类型（与 ScanResultItem 类似但包含 member_ids）

## 4. DisputeSheet 组件

- [x] 4.1 创建 `src/components/SplitDetail/DisputeSheet.tsx` 底部弹窗组件，包含辩词输入框和提交按钮
- [x] 4.2 实现提交辩词后调用 AI 接口，显示 loading 状态
- [x] 4.3 AI 返回后展示建议方案：每个 item 显示名称、价格，以及可勾选的 member 分配
- [x] 4.4 实现"确认提交"将编辑后的方案调用 createDispute 写入数据库
- [x] 4.5 添加 DisputeSheet 相关 CSS 样式

## 5. SplitDetail 集成 — 质疑人侧

- [x] 5.1 在 SplitDetail 中查询当前账单的 pending dispute 状态
- [x] 5.2 在非 payer、未结清、无 pending dispute 时显示"⚖️ 质疑"按钮
- [x] 5.3 点击按钮打开 DisputeSheet
- [x] 5.4 有 pending dispute 时显示"裁决中"状态 banner

## 6. SplitDetail 集成 — 发起者侧

- [x] 6.1 Payer 视角下，有 pending dispute 时显示争议详情区域：质疑人信息、辩词内容
- [x] 6.2 展示当前分配 vs 建议分配的对比视图（高亮变化的 member）
- [x] 6.3 实现"接受修改"按钮：调用 resolveDispute(id, true) 更新账单
- [x] 6.4 实现"拒绝"按钮：调用 resolveDispute(id, false) 关闭争议

## 7. 账单列表标记

- [x] 7.1 在账单列表查询中 left join bill_disputes 获取 pending dispute 状态
- [x] 7.2 在账单卡片/轮播中有 pending dispute 时显示"裁决中"角标
