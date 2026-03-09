## ADDED Requirements

### Requirement: 付款时自动复制金额
系统 SHALL 在用户点击"付款"按钮时自动复制金额到剪贴板。

#### Scenario: 复制成功
- **WHEN** 用户在 SplitDetail 点击"💳 付款"按钮
- **THEN** 将金额（格式 `X.XX`）复制到系统剪贴板
- **AND** Toast 提示 "📋 已复制 $X.XX 到剪贴板, 上传e-Transfer截屏完成付款🙂‍↕️"

#### Scenario: 剪贴板 API 不可用
- **WHEN** `navigator.clipboard.writeText()` 抛出异常
- **THEN** Toast 提示 "付款金额: $X.XX（请手动复制）"
