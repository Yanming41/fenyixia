## ADDED Requirements

### Requirement: 异议按钮触发怒气 emoji
系统 SHALL 在 SplitDetail 付款方视图提供"😡 异议!"按钮，每次点击飘一个 😡 emoji。

#### Scenario: 单次异议
- **WHEN** 用户在 SplitDetail 点击"😡 异议!"按钮
- **THEN** 从按钮位置向上飘出一个 😡 emoji 动画
- **AND** 调用 `DB.addAnger(billId)` 写入数据库

#### Scenario: 三连击怒气传递
- **WHEN** 用户对同一账单连续点击 3 次"异议"按钮
- **THEN** 显示浮动消息 "😡😡😡 您的怒气已经传递给发起此账单的人！"
- **AND** 计数器重置，可继续连击

### Requirement: 登录时怒气风暴
系统 SHALL 在用户登录后检测未读怒气，触发 emoji 风暴动画和汇总消息。

#### Scenario: 有未读怒气
- **WHEN** 用户登录且存在未读怒气记录
- **THEN** 从屏幕底部飘出最多 20 个 😡 emoji（每个间隔 150ms）
- **AND** 风暴结束后显示汇总消息（发送人 + 次数）
- **AND** 标记所有怒气为已读

#### Scenario: 无未读怒气
- **WHEN** 用户登录且无未读怒气记录
- **THEN** 不触发任何动画
