## 1. 邮件发送 Edge Function

- [ ] 1.1 创建 `supabase/functions/send-email/index.ts`，参照 `scan-receipt` 的 CORS 和错误处理模式
- [ ] 1.2 实现 `type: 'invite'` 邮件模板（包含邀请人昵称、注册链接）
- [ ] 1.3 配置 Resend API Key 到 Supabase secrets（`RESEND_API_KEY`）

## 2. 注册邮箱验证

- [ ] 2.1 在 Supabase Dashboard 开启邮箱确认（Auth → Settings → Enable email confirmations）
- [ ] 2.2 修改 `src/lib/api/auth.ts` 的 `signUp()`，传入 `emailRedirectTo` 参数
- [ ] 2.3 注册成功后前端显示"验证邮件已发送，请查收邮箱"提示
- [ ] 2.4 在 `App.tsx` 添加邮箱未验证检测逻辑，未验证用户显示提示 + 重新发送按钮

## 3. 好友邀请系统

- [ ] 3.1 创建 `invitations` 数据库表（id, inviter_id, email, token, status, created_at）
- [ ] 3.2 修改 `src/lib/api/friends.ts` 的 `addFriend()`：找不到用户时调用 Edge Function 发邀请
- [ ] 3.3 在 `FriendsPage.tsx` 更新 UI 反馈：成功发送邀请 → Toast "已发送邀请邮件"
- [ ] 3.4 注册页面支持 `?invite=token` 参数：自动填充邮箱，注册完成后更新 invitation 状态

## 4. 验证

- [ ] 4.1 `npx vite build` 构建通过
- [ ] 4.2 部署 Edge Function 并测试邀请邮件发送
- [ ] 4.3 测试注册 → 收到验证邮件 → 点击验证链接 → 账户激活流程
