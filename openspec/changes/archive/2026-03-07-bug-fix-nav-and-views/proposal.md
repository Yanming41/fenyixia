# Bug Fix: 导航栏 + 个人账单视图

## 背景
SPA feature completion 后发现 2 个 UI bug，同时改进视图切换功能。

## 需要修复/改进的能力

### `personal-bills-view`（替代原月份分组视图）
**变更**: 删除月份分组视图，替换为"个人账单"视图。
- 📌 切换按钮改为切换到"我需要付的"视图
- 只展示当前用户参与且未结清的账单
- UI 参考主页的账单卡片风格
- 不显示已结清的、或与自己无关的账单

### `bottomnav-position`
**问题**: BottomNav 没有固定在视口底部，随页面内容长度浮动。
**根因**: `.bottom-nav` CSS 缺少 `position: fixed`。

### `add-bill-all-pages`
**问题**: 在 FriendsPage/SettingsPage 点击 "+" 按钮无反应。
**根因**: `onAddClick` 仅在 HomePage 传入，其他页面没有传 prop。
