## Context

BillSheet 使用 `EditItem[]` 状态管理所有商品行，每行含 `name / price / qty / memberIds`。保存时直接将 price 和 qty 传给 `createBill` / `updateBill`。负数价格目前已被允许（之前的改动），但没有任何分摊逻辑。

## Goals / Non-Goals

**Goals:**
- 每个负数价格行可独立开关"分摊到商品"
- 开关开启后，UI 实时预览正数商品的调整后价格
- 保存时自动应用分摊，已分摊的负数行不写入账单

**Non-Goals:**
- 不支持负数行分摊给指定成员（只作用于所有正数商品）
- 不改变 API / 数据库 schema
- 不支持多个负数行互相分摊

## Decisions

### 1. EditItem 增加 spreadDiscount 字段

```ts
interface EditItem {
  name: string
  price: string
  qty: string
  memberIds: string[]
  spreadDiscount?: boolean  // 仅负数项有意义
}
```

**替代方案**: 用单独的 `Set<number>` 跟踪哪些 index 开启了分摊 → 更难与 items 数组同步，不如直接放在 EditItem 里。

### 2. 保存时计算（不是实时修改 state）

保存时在 `handleSave` 里对 `items` 做一次 `applyDiscountSpread()` 计算，得到最终 payload，而不是每次 toggle 都更新 state 里的 price。

**好处**: price 输入框永远显示用户填的原始价格，不会因开关 toggle 导致数字跳变让用户困惑。

**替代方案**: 实时修改 state → 用户看到价格被修改，开关关掉后原价消失，体验差。

### 3. UI 预览：显示调整后价格（只读）

开关开启后，正数商品行在价格输入框旁边显示一个小标签"→ ¥调整后价格"。这样用户能预见分摊效果，同时原始输入框不被改动。

### 4. 分摊算法

```
正数总金额 = Σ (price_i × qty_i) for all items where price_i > 0
各优惠分量 = |discount_price × discount_qty| × (item_total_i / 正数总金额)
调整后单价_i = price_i - 各优惠分量_i / qty_i
```

多个负数行各自独立计算（各自的 spreadDiscount 标志独立）。

## Risks / Trade-offs

- **浮点精度**: 分摊计算会产生小数 → 保留两位小数（`Math.round(x * 100) / 100`）
- **无正数商品时开关无意义**: 若所有其他项都是负数，开关打开时 tooltip/提示告知无法分摊 → 直接禁用开关即可
