## 1. 路由和导航基础 (app-routing)

- [x] 1.1 在 `App.tsx` 中添加 `/friends` 和 `/settings` 路由，使用 ProtectedRoute 包裹
- [x] 1.2 更新 `BottomNav.tsx` 添加好友和设置 tab 的导航链接
- [x] 1.3 实现 BottomNav 当前页面高亮逻辑（基于 `useLocation`）

## 2. 设置页面 (settings-page)

- [x] 2.1 创建 `src/pages/SettingsPage.tsx`，展示用户 emoji、名称、邮箱
- [x] 2.2 实现登出按钮，调用 auth signOut 后导航到 `/login`
- [x] 2.3 添加版本号显示（v0.1.0）

## 3. 好友/成员页面 (friends-page) — 参考旧版设计

- [x] 3.1 创建 `src/pages/FriendsPage.tsx`，查询 `users` 表展示所有可见成员
- [x] 3.2 实现成员条目 UI：带颜色背景的 emoji 头像 + 名称 + 邮箱，当前用户显示"我"标记
- [x] 3.3 实现空状态（"暂无成员"）和加载中/加载失败状态
- [x] 3.4 实现添加好友表单（邮箱输入 + 添加按钮），成功后刷新列表
- [x] 3.5 错误提示使用 Toast（邮箱不存在、已是好友等）

## 4. 创建账单 UI (create-bill-ui) — 复用 BillSheet + 选项面板

- [x] 4.1 创建添加选项 overlay 组件（"📝 手动输入" + "📷 拍照/扫描" + 取消）
- [x] 4.2 在 BottomNav/HomePage 的 "+" 按钮触发选项 overlay
- [x] 4.3 "手动输入"选项 → 打开 BillSheet 创建模式
- [x] 4.4 "拍照/扫描"选项 → 导航到 `receipt-scanner_final.html`
- [x] 4.5 给 `BillSheet.tsx` 添加 `mode: 'create' | 'edit'` prop，创建模式下调用 `createBill`
- [x] 4.6 创建成功后关闭 Modal 并刷新账单列表

## 5. 月份分组视图 (month-group-view)

- [x] 5.1 创建 `src/components/MonthGroupView/MonthGroupView.tsx` 月份分组组件
- [x] 5.2 实现按月分组逻辑（从 bills 数组聚合）
- [x] 5.3 实现月份卡片展示（月份名 · 账单数 · 总额）
- [x] 5.4 在 Header 中添加视图切换按钮
- [x] 5.5 在 HomePage 中集成视图切换状态
- [x] 5.6 实现空状态展示

## 6. 集成和验证

- [x] 6.1 确保所有路由导航正常工作
- [x] 6.2 确保 BottomNav 在所有页面一致显示
- [x] 6.3 验证 `npm run build` 构建成功
- [x] 6.4 验证创建账单端到端流程（创建 → 首页展示 → 详情查看）
