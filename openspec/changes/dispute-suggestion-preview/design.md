## Context

当前裁决系统中，质疑者提交 dispute 后，suggested_items 的 diff 展示仅在付款方点击争议 banner 后可见。质疑者和其他成员看不到方案内容，质疑者也无法修改已提交的方案。

现有代码结构：
- `SplitDetail.tsx` 中 `showDisputeReview` 区域仅在 `isPayer` 条件下渲染
- `disputes.ts` 只有 `fetchDispute`、`createDispute`、`resolveDispute`，无更新接口
- RLS 策略只允许 challenger 插入，未配置 update 权限

## Goals / Non-Goals

**Goals:**
- 所有账单成员均可查看 suggested_items diff 对比
- 质疑者可编辑 suggested_items 并提交更新
- 保持付款方的接受/拒绝裁决权不变

**Non-Goals:**
- 不改变 AI 裁决流程
- 不增加多轮协商（仍为一次性裁决）
- 不允许非质疑者/非付款方参与编辑或裁决

## Decisions

### 1. Diff 展示区域对所有成员可见

将 `SplitDetail.tsx` 中的争议详情区域从 `isPayer && showDisputeReview` 改为 `dispute` 存在即可展示。付款方额外显示"接受/拒绝"按钮，其他成员只读查看。

**替代方案**: 新建独立组件 → 增加不必要的文件，现有 diff 渲染逻辑已在 SplitDetail 中，直接复用。

### 2. 质疑者编辑 suggested_items

在 diff 展示区域，当 `currentUserId === dispute.challenger_id` 时，复用 DisputeSheet 中已有的成员 toggle 交互逻辑，允许编辑。编辑后调用新增的 `updateDispute` API 保存。

**替代方案**: 重新打开 DisputeSheet 编辑 → 体验不连贯，且需要重走 AI 流程。直接在 diff 区域内联编辑更直观。

### 3. 新增 updateDispute API

在 `disputes.ts` 中新增 `updateDispute(disputeId, suggestedItems)` 函数，仅更新 `suggested_items` 字段。

### 4. RLS 策略更新

为 `bill_disputes` 表添加 UPDATE 策略：`challenger_id = auth.uid() AND status = 'pending'`，确保只有质疑者本人在裁决待定时可以修改。

## Risks / Trade-offs

- **并发编辑冲突**: 质疑者编辑的同时付款方可能正在裁决 → Supabase 的行级锁机制足够处理，且实际场景中并发概率极低
- **频繁更新**: 质疑者可能频繁修改 → 无需节流，每次保存直接覆盖即可
