## Why

当前 SPA 有两个数据筛选维度（"账单记录" — 全部账单，"我的待付" — 仅自己未付的），但展示方式是固定的："账单记录"只能卡片轮播（左右滑动），"我的待付"只能列表（上下滑动）。用户希望每个筛选维度都能自由切换展示方式。此外，"我的待付"列表内容超出屏幕后无法滚动查看。

## What Changes

- **修复**：确保"我的待付"列表视图可上下滚动
- **新增**：在两个筛选维度（"账单记录" / "我的待付"）中都提供两种展示模式切换：
  - 🃏 卡片轮播模式（横向滑动，复用现有 BillCardCarousel）
  - 📋 列表模式（纵向滑动，复用现有 MyBillsView 样式）
- **交互**：Header 区域提供视图切换按钮，允许在两种展示模式间切换
- 默认展示模式为 🃏 卡片轮播

## Capabilities

### New Capabilities
- `view-mode-switcher`: 视图模式切换功能 — 所有筛选维度（全部/我的待付）都支持卡片轮播和列表两种展示方式；包括 Header UI 切换按钮和状态管理

### Modified Capabilities
_(无现有 spec 需要修改)_

## Impact

- `src/components/Layout/Header.tsx` — 切换按钮 UI 变更
- `src/pages/HomePage.tsx` — 视图模式状态管理，条件渲染逻辑
- `src/components/MyBillsView/MyBillsView.tsx` — 修复滚动 + 支持全部账单数据
- `src/components/BillCardCarousel/BillCardCarousel.tsx` — 可能需要支持筛选后的账单数据
