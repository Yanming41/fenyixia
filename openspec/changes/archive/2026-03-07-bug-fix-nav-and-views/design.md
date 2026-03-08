# Bug Fix: 设计

## 技术方案

### 个人账单视图（替代月份分组）
- 删除 `MonthGroupView.tsx`
- 新建 `MyBillsView.tsx`：从 `bills` 数组中筛选出 `!settled` 且当前用户在 `items[].members` 中的账单
- 展示风格参考主页的账单卡片：icon + title + 金额 + 日期，点击打开 SplitDetail
- Header 📌 按钮切换为 "全部" ↔ "我的待付"
- HomePage 中将 MonthGroupView 替换为 MyBillsView

### BottomNav 固定定位
- 给 `.bottom-nav` 添加 `position: fixed; bottom: 0; left: 0; right: 0; z-index: 100`

### "+" 按钮全局可用
- 将 AddOptions overlay 从 `HomePage` 提取为独立组件
- 在 `App.tsx` 层级管理全局状态，让所有页面的 BottomNav 都能触发添加账单
