# 迁移旧版功能（第二批）

## Why

旧版 split-app.js 中仍有 4 个功能未迁移到 React SPA：怒气风暴系统（含异议按钮 + 登录时怒气检测）、FPS 计数器、付款金额自动复制、统计 tab 占位。需要以 React 组件/hooks 的形式移植到新架构。

## What Changes

- **怒气风暴系统**: 异议按钮（😡）点击时飘 emoji + 写入 DB，第三次触发汇总消息；登录时调用 `DB.getUnseenAnger()` 检测未读怒气，触发大规模 emoji 风暴 + 汇总通知
- **FPS 计数器**: `useFps` hook 基于 rAF 30 帧滑动窗口采样，输出 FPS 值和颜色（≥55 绿 / ≥40 橙 / <40 红），集成到 DebugConsole
- **付款金额复制**: SplitDetail 的"付款"按钮 onClick 时调用 `navigator.clipboard.writeText()`，成功/失败均通过 Toast 提示
- **统计页面占位**: 底部 tab 栏添加"统计"入口，点击显示 Toast "📊 统计功能暂未实现"

## Capabilities

### New Capabilities
- `anger-storm`: 怒气异议系统 + 登录时怒气风暴动画
- `fps-counter`: 实时 FPS 性能计数器
- `payment-copy`: 付款金额剪贴板自动复制
- `stats-placeholder`: 统计 tab 占位页

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- 新增: `useAngerStorm` hook、`AngerEmoji` 动画组件
- 修改: `SplitDetail.tsx`（集成异议按钮 + 付款复制）、`DebugConsole.tsx`（集成 FPS 显示）、底部导航（添加统计 tab）
- 依赖: `ToastContext`（已存在）、`supabase` DB 方法 (`addAnger`, `getUnseenAnger`, `markAngerSeen`)
