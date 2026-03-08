## 1. Toast 基础设施

- [x] 1.1 创建 `src/contexts/ToastContext.tsx`（ToastProvider + ToastContext）
- [x] 1.2 创建 `src/hooks/useToast.ts`（导出 useToast hook）
- [x] 1.3 创建 `src/components/Toast/Toast.tsx`（使用 `.toast` CSS 类的展示组件）

## 2. 集成

- [x] 2.1 在 `App.tsx` 中包裹 `<ToastProvider>`，内置 `<Toast />` 组件
- [x] 2.2 替换 `FriendsPage.tsx` 中的本地 toast 状态为 `useToast()`

## 3. 验证

- [x] 3.1 验证 FriendsPage 添加好友后显示全局 Toast
- [x] 3.2 `npx vite build` 构建通过
