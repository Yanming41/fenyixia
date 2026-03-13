## ADDED Requirements

### Requirement: 通用邮件发送函数
系统 SHALL 提供一个 Supabase Edge Function `send-email`，接收邮件类型和参数，通过 Resend API 发送邮件。

#### Scenario: 发送邀请邮件
- **WHEN** 前端调用 `supabase.functions.invoke('send-email', { body: { type: 'invite', to: 'user@example.com', data: { inviterName: '小明', token: 'abc123' } } })`
- **THEN** Edge Function 通过 Resend API 向指定邮箱发送邀请邮件
- **AND** 返回 `{ success: true }`

#### Scenario: 不支持的邮件类型
- **WHEN** 前端传入未知的 `type` 参数
- **THEN** Edge Function 返回 `{ error: 'Unknown email type' }` 和 HTTP 400

#### Scenario: Resend API 调用失败
- **WHEN** Resend API 返回错误
- **THEN** Edge Function 返回 `{ error: '<错误信息>' }` 和对应 HTTP 状态码
