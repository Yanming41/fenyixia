## Context

React SPA 已完成账单轮播、成员管理、设置页面等核心功能。旧版 `split-app.js` 中仍有 4 个功能未迁移。`ToastContext` 已经存在。底部导航目前有 首页/朋友/设置 三个 tab。

## Goals / Non-Goals

**Goals:**
- 移植怒气风暴系统（异议按钮 + 登录时怒气检测 + emoji 飘动画）
- 移植 FPS 计数器到 DebugConsole
- 移植付款按钮的金额自动复制逻辑
- 添加统计 tab 占位

**Non-Goals:**
- 不实现真正的统计功能（仅占位 Toast 提示）
- 不修改现有 Toast 样式
- 不重构 Supabase DB 层

## Decisions

### 怒气风暴 → `useAngerStorm` hook + 内联 CSS 动画

**选择**: 将异议按钮逻辑 (`protestBill`) 和怒气风暴检测 (`checkAngerStorm`) 合并为一个 `useAngerStorm` hook。emoji 飘动画使用 React Portal + CSS `@keyframes`。

**理由**: 怒气系统涉及 DOM 动画（emoji 飘浮）+ Supabase 交互 + 状态管理（连击计数），hook 模式统一管理。Portal 确保 emoji 渲染在最顶层不被遮挡。

**替代方案**: 拆成两个 hook（异议 + 风暴检测）。但两者共享 `spawnAngerEmoji` 逻辑和 DB 方法，拆开反而增加复杂度。

### FPS 计数器 → 复用已有 `useFps` hook

**选择**: 项目中已存在 `src/hooks/useFps.ts`，直接在 DebugConsole 中调用即可。

**理由**: hook 已按旧版逻辑实现（rAF 30 帧窗口），无需重写。

### 付款金额复制 → 在 SplitDetail 内联

**选择**: 在 SplitDetail 的"付款"按钮 onClick handler 中直接调用 `navigator.clipboard.writeText()`，通过 `useToast` 反馈。

**理由**: 逻辑简单（3 行），无需独立 hook 或组件。

### 统计 tab → 路由占位 + Toast

**选择**: 在底部导航添加"统计"按钮，点击跳转到 `/stats` 路由，页面内容仅显示占位信息。

**理由**: 保持与旧版一致的 tab 结构，为未来统计功能预留路由。

## Risks / Trade-offs

- **Clipboard API 兼容性**: `navigator.clipboard.writeText()` 需要 HTTPS 或 localhost，降级为 Toast 显示金额（已处理）
- **怒气 emoji 性能**: 最多同时飘 20 个 emoji DOM 元素，超时自动清理，不会泄漏
- **DB 方法依赖**: `addAnger`, `getUnseenAnger`, `markAngerSeen` 需确认 Supabase 中已有对应 RPC/表
