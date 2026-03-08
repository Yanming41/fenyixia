## ADDED Requirements

### Requirement: 添加账单选项面板
系统 SHALL 在用户点击 "+" 按钮时弹出选项面板，提供手动输入和 OCR 扫描两种方式。

#### Scenario: 弹出选项面板
- **WHEN** 用户点击 BottomNav 的 "+" 按钮
- **THEN** 系统弹出选项 overlay，展示"📝 手动输入"和"📷 拍照/扫描"两个选项，以及取消按钮

#### Scenario: 选择手动输入
- **WHEN** 用户点击"手动输入"
- **THEN** 关闭选项面板，打开 BillSheet 创建模式

#### Scenario: 选择 OCR 扫描
- **WHEN** 用户点击"拍照/扫描"
- **THEN** 关闭选项面板，导航到 OCR 扫描页面（`receipt-scanner_final.html`）

#### Scenario: 取消或点击背景
- **WHEN** 用户点击"取消"或点击 overlay 背景
- **THEN** 关闭选项面板，不进行任何操作

### Requirement: 复用 BillSheet 支持创建账单
系统 SHALL 复用现有的 `BillSheet.tsx` 组件，通过 `mode` 参数区分创建和编辑模式。

#### Scenario: 创建模式打开空表单
- **WHEN** 用户从选项面板选择"手动输入"
- **THEN** 系统打开 BillSheet，标题为"新建账单"，所有字段为空

#### Scenario: 创建模式提交调用 createBill
- **WHEN** 用户在创建模式下填写完表单并点击提交
- **THEN** 系统调用 `createBill` API，成功后关闭 Modal 并刷新首页

#### Scenario: 编辑模式保持不变
- **WHEN** 用户在详情页点击编辑
- **THEN** BillSheet 以编辑模式打开，行为与现有一致

#### Scenario: 创建失败保留数据
- **WHEN** 创建 API 调用失败
- **THEN** 系统展示错误信息，保留用户已填写的数据
