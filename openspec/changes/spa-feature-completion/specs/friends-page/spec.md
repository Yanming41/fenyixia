## ADDED Requirements

### Requirement: 好友/成员列表展示
系统 SHALL 展示所有可见用户列表，参考旧版成员面板设计（avatar + 名称 + 邮箱 + "我"标记）。

#### Scenario: 展示成员列表
- **WHEN** 用户导航到好友页面
- **THEN** 系统展示所有可见用户，每条显示：带颜色背景的 emoji 头像、名称、邮箱，当前用户旁显示"我"标记

#### Scenario: 当前用户标记
- **WHEN** 成员列表加载完成
- **THEN** 当前登录用户的条目旁显示"我"的标记徽章

#### Scenario: 无成员时展示空状态
- **WHEN** 没有可见用户
- **THEN** 系统展示"暂无成员"的提示

### Requirement: 通过邮箱添加好友
系统 SHALL 在成员列表上方提供添加好友的入口。

#### Scenario: 成功添加好友
- **WHEN** 用户输入有效邮箱并点击"添加"
- **THEN** 系统调用 `addFriend` API，成功后刷新列表

#### Scenario: 添加失败提示
- **WHEN** 邮箱不存在或已是好友
- **THEN** 系统显示对应的错误提示（Toast）

### Requirement: 加载状态
系统 SHALL 在数据加载期间显示"加载中..."。

#### Scenario: 加载中
- **WHEN** 成员数据正在加载
- **THEN** 列表区域显示"加载中..."文字

#### Scenario: 加载失败
- **WHEN** 数据加载出错
- **THEN** 列表区域显示"加载失败"
