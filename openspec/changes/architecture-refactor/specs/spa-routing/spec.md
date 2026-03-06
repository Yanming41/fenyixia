## ADDED Requirements

### Requirement: SPA 路由结构

系统 SHALL 使用 React Router v7 提供客户端路由，所有页面通过 URL 路径导航，无需整页刷新。

路由表 SHALL 包含以下路径：
- `/login` — 登录/注册流程
- `/` — 主页（账单轮播 + 汇总卡片）
- `/bills/:id` — 账单详情
- `/scan` — 小票 OCR 扫描
- `/members` — 群组成员管理
- `/stats` — 统计页面（预留）
- `/settings` — 设置页面（预留）

#### Scenario: 用户导航到主页
- **WHEN** 已登录用户访问 `/`
- **THEN** 系统展示主页，包含账单卡片轮播和汇总信息

#### Scenario: 用户导航到不存在的路由
- **WHEN** 用户访问未定义的路径
- **THEN** 系统展示 404 页面，提供返回主页的链接

### Requirement: 认证路由守卫

系统 SHALL 在用户未登录时自动将受保护路由重定向到 `/login`。

#### Scenario: 未登录用户访问受保护页面
- **WHEN** 未登录用户访问 `/` 或任何受保护路由
- **THEN** 系统重定向到 `/login`

#### Scenario: 已登录用户访问登录页
- **WHEN** 已登录用户访问 `/login`
- **THEN** 系统重定向到 `/`

### Requirement: 底部导航栏路由联动

底部 Tab Bar SHALL 与当前路由同步——选中的 tab 反映当前页面，点击 tab 导航到对应路由。

#### Scenario: 用户通过 Tab Bar 切换页面
- **WHEN** 用户点击 Tab Bar 的「成员」按钮
- **THEN** 系统导航到 `/members`，「成员」tab 高亮，页面展示成员列表

#### Scenario: URL 变化时 Tab Bar 同步更新
- **WHEN** 用户通过浏览器前进/后退按钮导航
- **THEN** Tab Bar 选中状态与当前 URL 匹配

### Requirement: 路由支持插件扩展

路由系统 SHALL 支持通过 Plugin API 动态注册新路由。

#### Scenario: 插件注册新路由
- **WHEN** 插件通过 `PluginManager.register()` 注册了路由 `/expense-report`
- **THEN** 系统在路由表中添加该路由，用户访问 `/expense-report` 时渲染插件提供的组件
