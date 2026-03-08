## 1. 个人账单视图（替代月份分组）

- [x] 1.1 删除 `MonthGroupView.tsx`
- [x] 1.2 创建 `MyBillsView.tsx`：筛选未结清 + 自己参与的账单，列表展示（icon + 标题 + 金额 + 日期）
- [x] 1.3 更新 `Header.tsx`：📌 按钮切换标题改为"全部" ↔ "我的待付"
- [x] 1.4 更新 `HomePage.tsx`：将 MonthGroupView 替换为 MyBillsView，传入 currentUserId

## 2. BottomNav 固定定位

- [x] 2.1 给 `.bottom-nav` 添加 `position: fixed; bottom: 0; left: 0; right: 0; z-index: 100`

## 3. "+" 按钮全局可用

- [x] 3.1 将 AddOptions overlay + BillSheet 创建逻辑从 `HomePage.tsx` 提取为独立组件 `AddBillOverlay.tsx`
- [x] 3.2 在 `App.tsx` 中引入全局 AddBillOverlay 状态管理
- [x] 3.3 确保 FriendsPage / SettingsPage 的 BottomNav 可触发 overlay

## 4. 验证

- [x] 4.1 验证 📌 切换到个人账单列表，只显示自己待付的
- [x] 4.2 验证 BottomNav 在所有页面固定在底部
- [x] 4.3 验证 "+" 在所有页面可用
- [x] 4.4 `npx vite build` 构建通过
