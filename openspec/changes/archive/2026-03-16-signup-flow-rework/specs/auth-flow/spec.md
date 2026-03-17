## auth-flow (delta)

### Changes

1. signUp 只接受 email + password，移除 name/emoji/color 参数
2. 注册步骤重排：email → password → verify（移除注册时的 name/emoji 步骤）
3. 新增 `updateProfile(name, emoji, color)` 函数用于验证后完善资料
4. onAuthStateChange 检测到新登录时，查询 profile_completed 状态
