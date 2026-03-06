## ADDED Requirements

### Requirement: 服务模块化拆分

数据服务层 SHALL 将 `supabase.js` 拆分为独立的功能模块：
- `services/supabase.js` — Supabase client 初始化（唯一持有连接配置）
- `services/auth.js` — 认证相关（signUp, signIn, signOut, getCurrentUser, onAuthChange）
- `services/bills.js` — 账单 CRUD（fetchMyBills, createBill, updateBill, deleteBill, toggleSettled）
- `services/friends.js` — 好友管理（getFriends, addFriend）
- `services/reactions.js` — 怒气/凭证（addAnger, getUnseenAnger, uploadPaymentProof, getPaymentProofs）

#### Scenario: 各服务模块独立导入
- **WHEN** 页面组件只需要账单功能
- **THEN** 可以仅导入 `services/bills.js`，不引入认证或好友模块的代码

### Requirement: React Context 注入

系统 SHALL 通过 React Context 提供数据访问，组件通过 `useAuth()`、`useBills()` 等 hook 获取数据和操作方法。

#### Scenario: 组件获取当前用户
- **WHEN** 组件调用 `useAuth()` hook
- **THEN** 返回 `{ user, loading, signIn, signUp, signOut }` 对象

#### Scenario: 组件获取账单列表
- **WHEN** 组件调用 `useBills()` hook
- **THEN** 返回 `{ bills, loading, error, refresh, createBill, deleteBill }` 对象

### Requirement: 统一错误处理

所有数据服务调用 SHALL 通过统一的错误处理层，将 Supabase 错误转换为用户友好的中文提示。

#### Scenario: 网络错误
- **WHEN** Supabase 请求因网络问题失败
- **THEN** 系统展示「网络连接失败，请检查网络」的 toast 提示

#### Scenario: 认证过期
- **WHEN** Supabase 返回 401/403 错误
- **THEN** 系统自动重定向到登录页并展示「登录已过期」提示

### Requirement: 数据格式转换保留

`normalizeBill()` 函数 SHALL 保留现有的数据格式转换逻辑（Supabase 原始数据 → 前端卡片格式），确保与现有 UI 组件兼容。

#### Scenario: 账单数据端对端一致
- **WHEN** 从 Supabase 拉取账单并经过 `normalizeBill()` 转换
- **THEN** 输出格式包含 `id, icon, title, description, total_amount, date, payer_name, settled, color, items, members, per_amount, my_share` 字段
