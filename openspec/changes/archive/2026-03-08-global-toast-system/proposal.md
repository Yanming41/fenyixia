## Why

当前 SPA 中 Toast 通知是在 FriendsPage 中用本地状态实现的，不是全局的。旧版 `split-app.js` 有一个全局 `showToast(msg, duration)` 函数。需要迁移为 React Context + Hook 方案，让任何组件都能触发 Toast 通知。

## What Changes

- 创建 `ToastContext` + `ToastProvider` 提供全局 Toast 状态
- 创建 `useToast` hook，暴露 `showToast(msg, duration?)` 函数
- 创建 `<Toast />` 组件，使用已有的 `.toast` CSS 类
- 在 `App.tsx` 中包裹 `<ToastProvider>`
- 替换 FriendsPage 中的本地 toast 实现为 `useToast()`

## Capabilities

### New Capabilities
- `toast-system`: 全局 Toast 通知系统 — Context + Hook + 组件

### Modified Capabilities
_(无)_

## Impact

- `src/contexts/ToastContext.tsx` — 新建
- `src/hooks/useToast.ts` — 新建
- `src/components/Toast/Toast.tsx` — 新建
- `src/App.tsx` — 包裹 ToastProvider
- `src/pages/FriendsPage.tsx` — 替换本地 toast 为 useToast
