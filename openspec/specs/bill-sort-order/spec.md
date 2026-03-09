## ADDED Requirements

### Requirement: 账单按创建时间排序
系统 SHALL 在首页账单列表中按 `created_at` 降序排列所有账单，最新创建的账单显示在最顶部。

#### Scenario: 正常加载账单列表
- **WHEN** 用户打开首页账单列表
- **THEN** 账单按 `created_at` 降序排列（最新创建在前）

#### Scenario: 新建账单后刷新
- **WHEN** 用户新建一条账单并返回列表
- **THEN** 新账单出现在列表最顶部
