# 设计: 视图模式增强

## 状态模型

HomePage 管理两个独立状态维度：

```
dataFilter: 'all' | 'mine'         // 数据筛选
displayMode: 'carousel' | 'list'   // 展示方式
```

默认值：`dataFilter='all'`, `displayMode='carousel'`

### 组合矩阵

| dataFilter | displayMode | 渲染组件 | 数据 |
|---|---|---|---|
| `all` | `carousel` | BillCardCarousel | 全部 bills |
| `all` | `list` | BillListView | 全部 bills |
| `mine` | `carousel` | BillCardCarousel | 筛选后 myBills |
| `mine` | `list` | BillListView | 筛选后 myBills |

## 组件变更

### `Header.tsx`
- 两组按钮：
  1. 数据筛选按钮（💰 我的 / 全部）— 切换 `dataFilter`
  2. 展示模式按钮（🃏 / 📋）— 切换 `displayMode`
- Props: `dataFilter`, `displayMode`, `onToggleFilter`, `onToggleDisplay`

### `MyBillsView.tsx` → 重构为 `BillListView.tsx`
- 接受任意 `bills` 数组和可选 `currentUserId`
- 当显示"我的待付"时额外展示 payer 和 my_share 信息
- 确保外层 `overflow-y: auto` 可滚动

### `HomePage.tsx`
- 管理 `dataFilter` + `displayMode` 两个状态
- 根据 `dataFilter` 筛选数据（全部 or 我的待付）
- 根据 `displayMode` 选择渲染组件（BillCardCarousel or BillListView）

### `BillCardCarousel` — 无需修改
- 已接受 `bills` prop，传入筛选后数据即可

## 数据筛选逻辑

```typescript
const myBills = bills.filter(b =>
  !b.settled &&
  b.payer_id !== currentUserId &&
  b.items.some(item => item.members.some(m => m.id === currentUserId))
)
const displayBills = dataFilter === 'mine' ? myBills : bills
```

## 滚动修复

BillListView 的容器需确保 `overflow-y: auto` 且有 max-height 限制，使超出内容可滚动。
