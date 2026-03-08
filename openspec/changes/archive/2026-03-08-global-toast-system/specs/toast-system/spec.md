## ADDED Requirements

### Requirement: 全局 Toast 通知
系统 SHALL 提供全局 Toast 通知功能，任何组件都能通过 `useToast()` hook 触发。

#### Scenario: 显示 Toast
- **WHEN** 组件调用 `showToast("消息")`
- **THEN** 屏幕中央显示 Toast 消息
- **AND** 默认 2500ms 后自动消失

#### Scenario: 自定义时长
- **WHEN** 组件调用 `showToast("消息", 5000)`
- **THEN** Toast 在 5000ms 后消失

#### Scenario: 替换旧消息
- **WHEN** Toast 正在显示时触发新 Toast
- **THEN** 旧消息被新消息替换
