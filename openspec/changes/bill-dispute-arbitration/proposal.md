## Why

当前账单系统中，被分摊的成员如果对某项费用有异议（如"这道菜我没吃不应该分给我"），只能通过"😡 异议"按钮表达不满，但无法提出具体的修改方案。需要一个完整的争议裁决流程：成员提出辩词 → AI 生成新分配方案 → 账单发起者审批，从而让账单分摊更公平透明。

## What Changes

- 新增"质疑"入口：被分摊成员在账单详情页可发起争议，输入辩词理由
- 新增 AI 裁决能力：将辩词 + 原账单数据发送给 AI，AI 生成新的分配方案（主要是重新分配 item 的 members）
- 质疑人可在 AI 生成结果上编辑微调后提交
- 账单进入"裁决中"状态，账单列表和详情页有显著标记
- 账单发起者（payer）进入账单详情时可查看争议内容、辩词、AI 建议的新方案，并选择接受或拒绝
- 接受后账单按新方案更新，争议关闭

## Capabilities

### New Capabilities
- `bill-dispute`: 账单争议裁决的完整流程，包括发起争议、AI 裁决、质疑人编辑、发起者审批

### Modified Capabilities
- `split-detail`: 账单详情页需要新增争议状态展示、质疑入口按钮、争议审批 UI

## Impact

- **数据库**: 新增 `bill_disputes` 表存储争议记录（辩词、AI 建议方案、状态等）
- **Edge Function**: 新增或复用 `scan-receipt` edge function 处理 AI 裁决 prompt
- **前端组件**: SplitDetail 组件需新增争议相关 UI（发起、审批）；可能需新建 DisputeSheet 组件
- **API 层**: 新增争议相关的 CRUD 操作（`src/lib/api/disputes.ts`）
- **类型**: 扩展 Bill 类型以包含争议状态信息
