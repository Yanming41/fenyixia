## ADDED Requirements

### Requirement: 插件注册与生命周期

系统 SHALL 提供 `PluginManager` 单例，支持注册、初始化和销毁插件。

每个插件 MUST 实现 `PluginDefinition` 接口：
- `id: string` — 唯一标识符
- `name: string` — 显示名称
- `version: string` — 语义化版本号
- `onInit?: (context) => void` — 初始化回调
- `onDestroy?: () => void` — 销毁回调

#### Scenario: 注册新插件
- **WHEN** 调用 `PluginManager.register(pluginDefinition)`
- **THEN** 插件被添加到注册表，`onInit` 被调用并传入应用上下文

#### Scenario: 重复注册相同 ID 的插件
- **WHEN** 尝试注册一个已存在 ID 的插件
- **THEN** 系统抛出错误提示「插件 {id} 已注册」

#### Scenario: 插件销毁
- **WHEN** 调用 `PluginManager.unregister(pluginId)`
- **THEN** 该插件的 `onDestroy` 被调用，所有注册的路由/菜单/中间件被移除

### Requirement: 路由扩展点

插件 SHALL 能通过 `routes` 属性注册新的路由页面。

```
routes: [
  { path: '/my-feature', component: MyFeaturePage, label: '新功能' }
]
```

#### Scenario: 插件路由可访问
- **WHEN** 用户导航到插件注册的路由路径
- **THEN** 系统渲染插件提供的组件

#### Scenario: 插件卸载后路由移除
- **WHEN** 插件被卸载
- **THEN** 该插件注册的路由不再可访问，返回 404

### Requirement: 菜单扩展点

插件 SHALL 能通过 `menuItems` 属性在底部导航或设置页添加菜单入口。

#### Scenario: 插件添加设置页菜单
- **WHEN** 插件注册了 `menuItems: [{ location: 'settings', label: '汇率设置', icon: '💱', path: '/currency' }]`
- **THEN** 设置页展示该菜单项，点击导航到 `/currency`

### Requirement: 账单中间件扩展点

插件 SHALL 能通过 `billMiddleware` 属性注册账单创建/更新的处理管道。

中间件签名：`(billData, next) => billData`

#### Scenario: 中间件修改账单数据
- **WHEN** 用户创建账单，且有插件注册了账单中间件
- **THEN** 账单数据在写入数据库前经过中间件处理链

#### Scenario: 中间件不阻塞正常流程
- **WHEN** 中间件抛出异常
- **THEN** 系统记录错误日志但继续正常创建账单

### Requirement: 插件上下文

`onInit` 回调 SHALL 接收应用上下文对象，提供以下能力：
- `services` — 数据服务层引用（auth, bills, friends）
- `toast(message)` — 展示通知
- `navigate(path)` — 路由导航

#### Scenario: 插件使用应用服务
- **WHEN** 插件在 `onInit` 中调用 `context.services.bills.fetchMyBills()`
- **THEN** 插件可以获取当前用户的账单数据
