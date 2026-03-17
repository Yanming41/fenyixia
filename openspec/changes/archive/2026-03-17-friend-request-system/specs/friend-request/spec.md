## ADDED Requirements

### Requirement: 通过邮箱搜索用户
系统 SHALL 允许用户输入邮箱地址搜索已注册用户，返回匹配用户的基本信息（名称、头像 emoji）。

#### Scenario: 搜索到已注册用户
- **WHEN** 用户输入一个已注册的邮箱地址并点击搜索
- **THEN** 系统显示该用户的名称和 emoji 头像
- **AND** 显示「发送申请」按钮

#### Scenario: 邮箱未注册
- **WHEN** 用户输入一个未注册的邮箱地址并点击搜索
- **THEN** 系统显示提示「该邮箱未注册」
- **AND** 提供「发送邀请」选项（复用现有邀请流程）

#### Scenario: 搜索自己的邮箱
- **WHEN** 用户输入自己的邮箱地址
- **THEN** 系统显示提示「不能添加自己为好友」

#### Scenario: 搜索已是好友的用户
- **WHEN** 用户输入一个已是好友的用户邮箱
- **THEN** 系统显示提示「对方已是你的好友」

### Requirement: 发送好友申请
系统 SHALL 允许用户向搜索到的已注册用户发送好友申请，申请记录存入 `friend_requests` 表。

#### Scenario: 成功发送申请
- **WHEN** 用户点击「发送申请」
- **THEN** 系统在 `friend_requests` 表创建一条记录（status: pending）
- **AND** 显示 Toast「好友申请已发送」

#### Scenario: 重复发送申请
- **WHEN** 用户向同一用户再次发送申请且上次申请仍为 pending
- **THEN** 系统显示提示「已发送过申请，等待对方确认」

#### Scenario: 对方已向我发送过申请
- **WHEN** 用户向某用户发送申请，但该用户已向当前用户发送了 pending 申请
- **THEN** 系统自动接受对方的申请，直接建立好友关系
- **AND** 显示 Toast「已互相添加为好友」

### Requirement: 查看好友申请列表
系统 SHALL 在好友页面显示当前用户收到的待处理好友申请。

#### Scenario: 有待处理申请
- **WHEN** 用户打开好友页面且有未处理的好友申请
- **THEN** 页面顶部显示「好友申请」区域，列出每条申请的发送人信息和发送时间
- **AND** 每条申请显示「接受」和「拒绝」按钮

#### Scenario: 无待处理申请
- **WHEN** 用户打开好友页面且没有未处理的好友申请
- **THEN** 不显示「好友申请」区域

#### Scenario: 显示已发送的申请
- **WHEN** 用户打开好友页面且有自己发送的 pending 申请
- **THEN** 在「已发送」区域显示这些申请及其状态

### Requirement: 接受好友申请
系统 SHALL 允许用户接受好友申请，接受后双方建立好友关系。

#### Scenario: 接受申请
- **WHEN** 用户点击某条申请的「接受」按钮
- **THEN** 系统将 `friend_requests.status` 更新为 `accepted`
- **AND** 在 `friendships` 表插入一条记录（canonical ordering）
- **AND** 该用户出现在双方的好友列表中
- **AND** 显示 Toast「已添加好友」

### Requirement: 拒绝好友申请
系统 SHALL 允许用户拒绝好友申请。

#### Scenario: 拒绝申请
- **WHEN** 用户点击某条申请的「拒绝」按钮
- **THEN** 系统将 `friend_requests.status` 更新为 `rejected`
- **AND** 该申请从申请列表中移除
- **AND** 显示 Toast「已拒绝」

### Requirement: 好友列表仅显示已确认好友
系统 SHALL 在好友页面和账单成员选择中仅显示已确认的好友，而非所有用户。

#### Scenario: 好友页面展示
- **WHEN** 用户打开好友页面
- **THEN** 「我的好友」区域仅显示 `friendships` 表中与当前用户关联的用户

#### Scenario: 账单创建成员选择
- **WHEN** 用户创建账单（手动/扫描/快速记账）进入成员选择步骤
- **THEN** 成员列表仅显示当前用户的已确认好友 + 自己
