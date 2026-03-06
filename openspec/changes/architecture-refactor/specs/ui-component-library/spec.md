## ADDED Requirements

### Requirement: Design Token 体系

系统 SHALL 定义全局 CSS 变量作为 design tokens，所有组件 MUST 引用 token 而非硬编码值。

Token 分类：
- 颜色：`--color-bg`, `--color-surface`, `--color-text`, `--color-accent` 等
- 字号：`--font-xs`, `--font-sm`, `--font-base`, `--font-lg`, `--font-xl`
- 间距：`--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`
- 圆角：`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- 阴影：`--shadow-sm`, `--shadow-md`, `--shadow-lg`
- 动画时长：`--duration-fast`, `--duration-normal`, `--duration-slow`

#### Scenario: 组件使用 design token
- **WHEN** 开发新组件需要设置背景色
- **THEN** 使用 `var(--color-surface)` 而非硬编码 `#1a1916`

### Requirement: 卡片轮播组件

系统 SHALL 提供 `BillCardCarousel` 组件，封装现有的卡片轮播动画引擎。

组件 MUST 支持：
- 触摸/鼠标拖动手势
- 惯性滑动 + snap 回弹
- 可配置动画参数（间距、缩放曲线、透明度曲线等）
- 60fps 流畅渲染

#### Scenario: 用户左右滑动切换卡片
- **WHEN** 用户在轮播区域拖动手指
- **THEN** 卡片跟随手指移动，松手后惯性滑动并 snap 到最近整数卡片

#### Scenario: 动画帧率
- **WHEN** 用户快速连续滑动卡片
- **THEN** 帧率 SHALL 保持在 55fps 以上

### Requirement: 底部导航栏组件

系统 SHALL 提供 `BottomNav` 组件，展示 5 个 tab（账单、成员、添加、统计、设置）。

#### Scenario: Tab 切换高亮
- **WHEN** 用户点击不同 tab
- **THEN** 被点击的 tab 高亮，其余 tab 恢复默认样式

### Requirement: Modal / Sheet 组件

系统 SHALL 提供 `Modal` 和 `ActionSheet` 组件，支持从底部滑出的 iOS 风格弹窗。

#### Scenario: 打开 Modal
- **WHEN** 调用 `Modal` 组件并传入 `open={true}`
- **THEN** 背景遮罩淡入，弹窗从底部滑入

#### Scenario: 关闭 Modal
- **WHEN** 用户点击遮罩层或下拉弹窗手柄
- **THEN** 弹窗滑出并隐藏，触发 `onClose` 回调

### Requirement: 表单控件组件

系统 SHALL 提供表单输入组件（`TextInput`, `NumberInput`, `IconPicker`, `SegmentedControl`），风格与现有 iOS 分组表单一致。

#### Scenario: 输入校验失败
- **WHEN** 必填字段为空时提交表单
- **THEN** 对应输入框显示错误样式（红色边框），不提交数据

### Requirement: Toast 通知组件

系统 SHALL 提供 `Toast` 组件用于展示临时通知消息。

#### Scenario: 显示成功通知
- **WHEN** 操作成功（如创建账单）
- **THEN** 屏幕顶部展示绿色 toast，2 秒后自动消失
