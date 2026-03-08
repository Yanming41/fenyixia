## ADDED Requirements

### Requirement: 个人账单视图
系统 SHALL 提供"我的待付"视图，只展示当前用户需要付款且未结清的账单。

#### Scenario: 切换到个人视图
- **WHEN** 用户点击 📌 按钮
- **THEN** 隐藏轮播卡片，展示筛选后的个人待付账单列表

#### Scenario: 筛选逻辑
- **GIVEN** 当前用户 ID
- **THEN** 只展示满足以下条件的账单：未结清 (`!settled`) + 用户在至少一个 item 的 members 中

#### Scenario: 点击查看详情
- **WHEN** 用户点击列表中的账单
- **THEN** 弹出 SplitDetail 展示该账单详情

### Requirement: BottomNav 固定定位
系统 SHALL 将 BottomNav 固定在视口底部。

### Requirement: "+" 按钮全局可用
系统 SHALL 在所有页面都能通过 "+" 按钮唤出添加账单流程。
