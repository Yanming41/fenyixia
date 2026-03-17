## profile-setup

邮箱验证后的用户资料完善流程。

### Requirements

1. 验证回来后检测 `profile_completed` 字段，若为 false 则进入 setup 流程
2. setup-welcome 步骤：显示"欢迎回来！您已完成验证，接下来完善一下资料吧"
3. setup-name 步骤：输入昵称
4. setup-emoji 步骤：选择 emoji 头像 + 背景颜色
5. 完成后 upsert public.users 并设 profile_completed = true
6. 跳转到首页
