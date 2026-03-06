## ADDED Requirements

### Requirement: 移动端优先布局

所有页面 SHALL 以移动端（375px 宽度）为基准设计，通过 media query 向上适配更大屏幕。

#### Scenario: 移动端默认展示
- **WHEN** 用户在 375px 宽度设备上访问应用
- **THEN** 所有页面元素完整展示，无水平滚动，无内容溢出

#### Scenario: 平板适配
- **WHEN** 用户在 768px 宽度设备上访问应用
- **THEN** 内容区域居中，最大宽度 480px，两侧留白

### Requirement: 安全区域适配

系统 SHALL 使用 `env(safe-area-inset-*)` 适配 iOS 刘海屏和底部 Home Indicator。

#### Scenario: 底部导航栏避开 Home Indicator
- **WHEN** 用户在 iPhone（有 Home Indicator）上查看底部Tab Bar
- **THEN** Tab Bar 底部留出 `env(safe-area-inset-bottom)` 的空白

#### Scenario: 顶部状态栏适配
- **WHEN** 用户在刘海屏设备上查看顶部导航
- **THEN** 导航栏顶部留出 `env(safe-area-inset-top)` 的空白

### Requirement: 触摸友好的交互尺寸

所有可交互元素 SHALL 有不小于 44×44px 的触摸目标区域。

#### Scenario: 按钮触摸区域
- **WHEN** 用户尝试点击任意按钮
- **THEN** 按钮的实际可点击区域不小于 44×44px

### Requirement: 字体大小响应式

系统 SHALL 基于视口宽度使用 `clamp()` 函数设置关键字号，确保在不同屏幕上有良好可读性。

#### Scenario: 小屏字号
- **WHEN** 用户在 320px 宽度设备上查看
- **THEN** 正文字号不小于 14px，标题字号不小于 18px

#### Scenario: 大屏字号
- **WHEN** 用户在 1280px 宽度显示器上查看
- **THEN** 字号不超过 design token 定义的最大值，保持视觉协调
