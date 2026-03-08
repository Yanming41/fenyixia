## Why

新 SPA 重构后只完成了核心展示层（首页卡片轮播 + 登录），但多个关键用户交互功能仍缺失。用户无法在新 SPA 中创建账单、管理好友，底部导航的多个 tab 没有对应页面。这些功能在旧版（`app.js` / `split-app.js`）中已存在，需要迁移到新架构。

## What Changes

- **新增创建账单 UI** — 完整的账单创建流程（选图标、填写条目、选择分摊人）
- **新增好友管理页面** — 查看好友列表、通过邮箱添加好友（API 层 `friends.ts` 已就绪）
- **新增月份分组视图** — 旧版的"回形针"视图，按月聚合账单卡片
- **完善路由和导航** — BottomNav 接入所有页面（首页、好友、设置）
- **新增设置页面** — 用户信息展示、登出等基本设置
- **OCR 扫描（标记为后续迭代）** — 旧版 `receipt-scanner_final.html` 功能暂不迁移

## Capabilities

### New Capabilities
- `create-bill-ui`: 创建账单的完整 UI 流程，包括图标选择、条目录入、分摊人选择、提交
- `friends-page`: 好友管理页面，展示好友列表并支持通过邮箱添加好友
- `month-group-view`: 账单按月分组的聚合视图，从旧版回形针模式迁移
- `settings-page`: 设置页面，包含用户信息展示和登出功能
- `app-routing`: 完善 BottomNav 路由，将所有页面串联起来

### Modified Capabilities
_无现有 specs 需要修改_

## Impact

- **路由层** (`App.tsx`): 新增 3-4 条路由
- **组件层** (`src/components/`): 新增创建账单 Modal、好友列表组件
- **页面层** (`src/pages/`): 新增 FriendsPage、SettingsPage、可能独立 CreateBillPage
- **API 层**: 已就绪（`bills.ts`、`friends.ts` 已有完整 CRUD），无需修改
- **样式**: 需要扩展 `global.css` 或新增组件级样式
