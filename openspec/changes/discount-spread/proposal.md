## Why

账单中的优惠/折扣项（负数价格）目前作为独立行存在，分摊逻辑和正常商品一样。但实际场景中优惠是作用于整桌消费的——应该按比例减少每个商品的价格，而不是单独分给某人。目前没有工具能做到这一点，用户只能手动计算。

## What Changes

- 在 BillSheet 的每个负数价格商品行旁边，增加"分摊到商品"开关
- 开关打开后：该负数金额按各正数商品金额占比，等比例摊入正数商品的单价中
- 保存时：已分摊的优惠项从账单中移除，正数商品带着摊入后的价格保存
- 开关关闭时：行为与现在完全相同（负数项作为普通行保存）

## Capabilities

### New Capabilities
- `discount-spread`: 负数商品一键按比例分摊到所有正数商品

### Modified Capabilities

## Impact

- `src/components/SplitDetail/BillSheet.tsx` — 核心改动：EditItem 增加 spreadDiscount 标志，渲染层增加开关，保存逻辑增加分摊计算
- 不涉及 API、数据库、或其他组件
