## Context

当前项目是一个 React + Supabase (BaaS) 的分账小程序，没有自建后端。已有一个 Edge Function（`scan-receipt`）用于 OCR。注册流程（`auth.ts`）无邮箱验证，添加好友（`friends.ts`）对方不存在则直接报错。需要引入邮件能力来实现注册验证和好友邀请。

## Goals / Non-Goals

**Goals:**
- 构建通用的 `send-email` Edge Function，支持多种邮件模板
- 注册时通过邮件验证用户邮箱所有权
- 添加好友时对方不存在则发送邀请邮件
- 新建 `invitations` 表追踪邀请状态

**Non-Goals:**
- 不做营销邮件 / Newsletter
- 不自建 SMTP 服务器
- 注册只是注册，不自动建立好友关系
- 暂不做微信分享邀请渠道

## Decisions

### 邮件发送方案：Resend API
- **选择**：通过 Supabase Edge Function 调用 Resend API
- **替代**：SendGrid（API 复杂）、AWS SES（配置繁琐）、自建 SMTP（运维成本高）
- **理由**：Resend API 极简（一个 POST 请求）、免费额度 100 封/天、足够覆盖当前业务量（<100/天）

### 邮箱验证方案：Supabase Auth 内置确认
- **选择**：利用 Supabase Auth 自带的 `emailRedirectTo` + 确认邮件机制
- **替代**：完全自建验证流程（自己生成 token + 写验证链接 + Edge Function 处理回调）
- **理由**：Supabase Auth `signUp` 已内置邮件确认功能，只需在 Supabase Dashboard 开启并自定义邮件模板即可。避免重复造轮子。自定义邮件模板通过 Supabase Dashboard 的 Auth → Email Templates 配置

### Edge Function 设计：单一通用函数
- **选择**：一个 `send-email` Edge Function，通过 `type` 参数区分模板
- **替代**：每种邮件一个函数（`send-invite`、`send-verification` 等）
- **理由**：减少函数数量，共享 Resend 连接和 CORS 逻辑，新增邮件类型只需添加模板

### 邀请表设计
- **`invitations` 表**字段：`id`, `inviter_id`, `email`, `token`, `status`(pending/accepted/expired), `created_at`
- 邀请链接格式：`{APP_URL}/register?invite={token}`
- 被邀请人注册时自动将 `status` 更新为 `accepted`

## Risks / Trade-offs

- **Resend 免费额度限制** → 100封/天足够，达到瓶颈时升级付费计划（$20/月 5万封）
- **Supabase Edge Function 冷启动** → 首次调用有 ~200ms 延迟，邮件场景可接受
- **邀请邮件进垃圾箱** → Resend 默认域名可能被标记，生产环境建议绑定自定义域名
- **Supabase Auth 邮件模板定制有限** → 只能改 HTML 内容，不能改发件人域名（除非绑定自定义 SMTP）

## Migration Plan

1. 在 Resend 注册账号，获取 API Key
2. `supabase secrets set RESEND_API_KEY=re_xxxx`
3. 部署 `send-email` Edge Function
4. 在 Supabase Dashboard 开启邮件确认（Auth → Settings → Enable email confirmations）
5. 创建 `invitations` 表（通过 SQL migration）
6. 更新前端注册和好友添加逻辑
