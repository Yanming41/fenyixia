## ADDED Requirements

### Requirement: 设置页面展示用户信息
系统 SHALL 在设置页面展示当前登录用户的基本信息。

#### Scenario: 展示用户信息
- **WHEN** 用户导航到设置页面
- **THEN** 系统展示用户的 emoji 头像、名称和邮箱

### Requirement: 登出功能
系统 SHALL 提供登出按钮，允许用户退出当前登录。

#### Scenario: 成功登出
- **WHEN** 用户点击"登出"按钮
- **THEN** 系统清除登录状态并导航到登录页面

### Requirement: 设置页面版本信息
系统 SHALL 在设置页面底部展示应用版本号。

#### Scenario: 展示版本号
- **WHEN** 设置页面加载
- **THEN** 页面底部显示"v0.1.0"版本标识
