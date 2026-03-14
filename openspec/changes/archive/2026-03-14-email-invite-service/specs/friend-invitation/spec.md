## ADDED Requirements

### Requirement: 添加好友时邮箱不存在则发送邀请
系统 SHALL 在用户添加好友时，若该邮箱不在系统中，自动发送邀请邮件而非报错。

#### Scenario: 邮箱已注册
- **WHEN** 用户输入邮箱添加好友且该邮箱已存在于系统中
- **THEN** 直接建立好友关系（现有逻辑不变）

#### Scenario: 邮箱未注册且未邀请过
- **WHEN** 用户输入邮箱添加好友且该邮箱不在系统中
- **THEN** 系统在 `invitations` 表创建一条记录（status: pending）
- **AND** 调用 `send-email` Edge Function 发送邀请邮件
- **AND** 显示 Toast "已发送邀请邮件到 xxx@xx.com"

#### Scenario: 已发送过邀请
- **WHEN** 用户输入邮箱添加好友且该邮箱已有 pending 状态的邀请记录
- **THEN** 显示 Toast "已邀请过该用户，等待对方注册"

#### Scenario: 邀请注册链接
- **WHEN** 被邀请人收到邀请邮件并点击注册链接
- **THEN** 跳转到注册页面，邮箱自动填充
- **AND** 注册完成后，`invitations` 表中对应记录的 `status` 更新为 `accepted`
