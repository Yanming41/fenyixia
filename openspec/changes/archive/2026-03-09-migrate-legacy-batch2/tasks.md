## 1. 怒气风暴系统

- [x] 1.1 创建 `useAngerStorm` hook（异议计数、`protestBill(billId)` + `spawnAngerEmoji()` + 三连击消息）
- [x] 1.2 创建怒气 emoji 飘动画 CSS（`.anger-float` 上飘淡出 + `.anger-storm` 从底部飘起 + `.anger-msg` 浮动消息）
- [x] 1.3 在 SplitDetail 付款方视图添加"😡 异议!"按钮，调用 `protestBill`
- [x] 1.4 实现 `checkAngerStorm()`：登录后调用 `DB.getUnseenAnger()`，触发 emoji 风暴 + 汇总消息 + 标记已读

## 2. FPS 计数器

- [x] 2.1 在 DebugConsole 中集成 `useFps` hook，添加 FPS 显示开关和实时数值

## 3. 付款金额复制

- [x] 3.1 在 SplitDetail 的"💳 付款"按钮 onClick 中调用 `navigator.clipboard.writeText(amount)`
- [x] 3.2 复制成功/失败均通过 `showToast()` 提示

## 4. 统计 Tab 占位

- [x] 4.1 在底部导航栏添加"📊 统计"按钮
- [x] 4.2 点击时 `showToast('📊 统计功能暂未实现')`，不切换路由

## 5. 验证

- [x] 5.1 `npx vite build` 构建通过
- [x] 5.2 怒气异议按钮可点击、emoji 飘出
- [x] 5.3 付款复制 + Toast 提示正常
