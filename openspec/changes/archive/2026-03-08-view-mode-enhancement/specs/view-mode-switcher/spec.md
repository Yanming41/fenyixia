## ADDED Requirements

### Requirement: 双维度视图控制
系统 SHALL 提供两个独立的视图控制维度：
- **数据筛选** (`dataFilter`): "全部账单" / "我的待付"
- **展示模式** (`displayMode`): "卡片轮播" / "列表"

#### Scenario: 默认状态
- **WHEN** 用户进入首页
- **THEN** 默认 dataFilter = "全部账单", displayMode = "卡片轮播"

#### Scenario: 切换数据筛选
- **WHEN** 用户点击 "💰 我的" 按钮
- **THEN** 数据从全部账单切换为仅展示自己待付的（未结清 + 非 payer + 在 item members 中）
- **AND** 展示模式保持不变

#### Scenario: 切换展示模式
- **WHEN** 用户点击展示模式切换按钮（🃏 ↔ 📋）
- **THEN** 展示方式在卡片轮播和列表之间切换
- **AND** 数据筛选保持不变

#### Scenario: 两种展示模式
- **卡片轮播**: 复用现有 BillCardCarousel，横向滑动浏览
- **列表模式**: 纵向滚动列表，每行显示 icon + 标题 + 金额 + 日期，可上下滚动

### Requirement: 列表视图可滚动
系统 SHALL 确保列表视图在内容超出屏幕时可上下滚动查看全部内容。

### Requirement: 列表视图通用化
列表视图 SHALL 支持展示任意账单数据（全部 / 筛选后），当展示"我的待付"数据时额外显示 payer 信息和个人份额。
