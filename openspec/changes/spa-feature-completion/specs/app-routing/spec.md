## ADDED Requirements

### Requirement: BottomNav 路由注册
系统 SHALL 为所有 BottomNav tab 注册对应的路由。

#### Scenario: 导航到好友页面
- **WHEN** 用户点击 BottomNav 的"好友"tab
- **THEN** 系统导航到 `/friends` 路由并展示好友页面

#### Scenario: 导航到设置页面
- **WHEN** 用户点击 BottomNav 的"设置"tab
- **THEN** 系统导航到 `/settings` 路由并展示设置页面

#### Scenario: 导航到首页
- **WHEN** 用户点击 BottomNav 的"首页"tab
- **THEN** 系统导航到 `/` 路由并展示首页

### Requirement: 所有页面需要登录保护
非登录页面的所有路由 SHALL 使用 ProtectedRoute 包裹。

#### Scenario: 未登录访问受保护页面
- **WHEN** 未登录用户尝试访问 `/friends` 或 `/settings`
- **THEN** 系统重定向到 `/login`

### Requirement: BottomNav 高亮当前页面
BottomNav SHALL 高亮显示当前所在页面对应的 tab。

#### Scenario: 在好友页面时
- **WHEN** 用户在 `/friends` 页面
- **THEN** BottomNav 的"好友"tab 显示为激活/高亮状态
