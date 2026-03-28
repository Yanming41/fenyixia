## Why

当账单处于裁决中时，只有付款方能看到质疑者提出的修改方案，其他账单成员（包括质疑者自己）无法查看。质疑者提交后也无法修改方案。这导致信息不对称，降低了裁决流程的透明度和灵活性。

## What Changes

- 所有账单相关成员（付款方、质疑者、其他成员）均可在账单详情中查看质疑者提出的 suggested_items 修改方案，以 diff 对比方式展示"原始分配 → 建议分配"
- 质疑发起人可以随时编辑已提交的 suggested_items（修改成员分配），更新后实时反映
- 付款方保留原有的"接受/拒绝"裁决权限

## Capabilities

### New Capabilities
- `dispute-suggestion-view`: 所有账单成员可查看质疑修改方案的 diff 对比展示
- `dispute-suggestion-edit`: 质疑发起人可编辑已提交的 suggested_items

### Modified Capabilities
- `split-detail`: 详情页增加质疑方案展示区域，质疑者增加编辑入口

## Impact

- `src/components/SplitDetail/SplitDetail.tsx` — 争议详情区域从仅付款方可见改为所有成员可见，质疑者增加编辑功能
- `src/lib/api/disputes.ts` — 新增 `updateDispute` API 用于质疑者更新 suggested_items
- `supabase/migrations/` — 可能需要更新 RLS 策略允许质疑者更新自己的 dispute
