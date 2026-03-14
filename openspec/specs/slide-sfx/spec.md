## ADDED Requirements

### Requirement: 卡片滑动音效
系统 SHALL 在卡片轮播滑动时播放音效。

#### Scenario: 滑动触发
- **WHEN** 用户滑动卡片经过整数边界（即从一张卡片过渡到下一张）
- **THEN** 播放当前选中的音效

#### Scenario: 音效开关
- **WHEN** 用户在设置中关闭音效
- **THEN** 滑动不播放任何声音

#### Scenario: 切换音效
- **WHEN** 用户在设置中切换音效
- **THEN** 后续滑动使用新选中的音效

#### Scenario: 内置音效
- **GIVEN** 系统内置 3 个音效
- **WHEN** 首次加载
- **THEN** 所有 3 个音效已准备就绪，默认选中第一个
