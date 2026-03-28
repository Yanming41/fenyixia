## 1. API 层

- [x] 1.1 在 `src/lib/api/disputes.ts` 中新增 `updateDispute(disputeId, suggestedItems)` 函数
- [x] 1.2 生成 SQL migration：为 `bill_disputes` 添加 UPDATE RLS 策略（challenger_id = auth.uid() AND status = 'pending'）

## 2. SplitDetail 争议详情展示

- [x] 2.1 将 SplitDetail 中的争议详情区域（diff 展示）从仅 isPayer 可见改为所有成员可见（dispute 存在即展示）
- [x] 2.2 保留付款方的"接受/拒绝"按钮，对非付款方隐藏
- [x] 2.3 默认展开争议详情区域（不需要点击 banner 才展示）

## 3. 质疑者编辑功能

- [x] 3.1 当 currentUserId === dispute.challenger_id 时，suggested items 的成员 chip 可点击 toggle
- [x] 3.2 编辑后调用 updateDispute 保存，并更新本地 dispute 状态
- [x] 3.3 确保每个 item 至少保留一个成员（防止清空）

## 4. 构建验证

- [x] 4.1 运行 `npm run build` 确保无 TypeScript 错误
