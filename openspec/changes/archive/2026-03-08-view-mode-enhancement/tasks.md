## 1. 重构 MyBillsView → BillListView（通用列表组件）

- [x] 1.1 将 `MyBillsView.tsx` 重命名为 `BillListView.tsx`（移动文件 + 更新导入）
- [x] 1.2 接受 `bills: Bill[]` + 可选 `showMyShare?: boolean` prop
- [x] 1.3 当 `showMyShare=true` 时显示 payer 信息和个人份额，否则显示总额
- [x] 1.4 确保外层容器 `overflow-y: auto` 可滚动

## 2. HomePage 双状态管理

- [x] 2.1 将 `viewMode` 拆分为 `dataFilter: 'all' | 'mine'` + `displayMode: 'carousel' | 'list'`
- [x] 2.2 筛选逻辑：`dataFilter === 'mine'` 时过滤出自己待付的账单
- [x] 2.3 渲染逻辑：根据 `displayMode` 选择 BillCardCarousel 或 BillListView
- [x] 2.4 传入筛选后的 `displayBills` 给对应组件

## 3. Header 双按钮 UI

- [x] 3.1 Props 改为 `dataFilter`, `displayMode`, `onToggleFilter`, `onToggleDisplay`
- [x] 3.2 数据筛选按钮：💰 我的 ↔ 全部
- [x] 3.3 展示模式按钮：🃏 ↔ 📋
- [x] 3.4 标题根据 `dataFilter` 动态切换（"账单记录" / "我的待付"）

## 4. 验证

- [x] 4.1 验证 4 种组合（all+carousel, all+list, mine+carousel, mine+list）
- [x] 4.2 验证列表视图超出屏幕可滚动
- [x] 4.3 `npx vite build` 构建通过
