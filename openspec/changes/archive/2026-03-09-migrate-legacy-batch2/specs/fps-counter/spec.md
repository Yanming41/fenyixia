## ADDED Requirements

### Requirement: 实时 FPS 显示
系统 SHALL 在调试面板中显示实时 FPS 计数器。

#### Scenario: FPS 正常显示
- **WHEN** 调试面板开启且 FPS 计数开关打开
- **THEN** 显示实时 FPS 数值（30 帧滑动窗口求均值）
- **AND** 颜色：≥55 绿色 / ≥40 橙色 / <40 红色

#### Scenario: FPS 开关关闭
- **WHEN** FPS 计数开关关闭
- **THEN** 停止 rAF 循环，不显示 FPS 数值
