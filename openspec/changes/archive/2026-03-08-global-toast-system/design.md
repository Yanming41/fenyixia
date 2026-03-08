# 设计: 全局 Toast 系统

## 架构

```
ToastProvider (Context)
  └─ Toast 组件（fixed 定位，使用 .toast CSS）
  └─ useToast() hook → showToast(msg, duration?)
```

## ToastContext

```typescript
interface ToastContextValue {
  showToast: (msg: string, duration?: number) => void
}
```

- `showToast(msg, duration = 2500)` 设置消息并启动定时器
- 支持队列或替换（简单方案：替换，新消息覆盖旧消息）

## Toast 组件

- 使用已有的 `.toast` / `.toast.show` CSS 类
- `position: fixed` 居中显示
- 动画由 CSS transition 控制

## 集成方式

- `App.tsx` 最外层包裹 `<ToastProvider>`
- 任何组件通过 `useToast()` 获取 `showToast`
- FriendsPage 的本地 toast 状态替换为 `useToast()`
