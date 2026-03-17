## MODIFIED Requirements

### Requirement: 添加好友时邮箱不存在则发送邀请
系统 SHALL 在用户搜索邮箱添加好友时，若该邮箱不在系统中，提供发送邀请选项。邮箱已注册的用户不再直接建立好友关系，而是发送好友申请。

#### Scenario: 邮箱已注册
- **WHEN** 用户输入邮箱搜索且该邮箱已存在于系统中
- **THEN** 显示该用户信息，提供「发送好友申请」按钮（不再直接建立好友关系）

#### Scenario: 邮箱未注册且未邀请过
- **WHEN** 用户输入邮箱搜索且该邮箱不在系统中
- **THEN** 系统在 `invitations` 表创建一条记录（status: pending）
- **AND** 调用 `send-email` Edge Function 发送邀请邮件
- **AND** 显示 Toast "已发送邀请邮件到 xxx@xx.com"

#### Scenario: 已发送过邀请
- **WHEN** 用户输入邮箱搜索且该邮箱已有 pending 状态的邀请记录
- **THEN** 显示 Toast "已邀请过该用户，等待对方注册"

#### Scenario: 被邀请人注册后自动发送好友申请
- **WHEN** 被邀请人通过邀请链接注册成功
- **THEN** 系统自动为邀请人向被邀请人创建一条 pending 好友申请
- **AND** 被邀请人可在好友页面看到该申请并选择接受或拒绝
