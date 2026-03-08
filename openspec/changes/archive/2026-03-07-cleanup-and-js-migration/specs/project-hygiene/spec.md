## ADDED Requirements

### Requirement: SQL 文件归类
项目根目录的数据库相关 SQL 文件 SHALL 被移动到 `db/` 目录。

#### Scenario: 移动 SQL 文件
- **WHEN** 根目录存在 `supabase-schema.sql`, `fix-rls-insert.sql`, `fix-rls-recursion.sql`, `receipt-scans-schema.sql`
- **THEN** 这些文件 SHALL 被移动到 `db/` 目录下

### Requirement: 清理遗留样式文件
根目录中不属于 Vite 构建流程的遗留 CSS 文件 SHALL 被清理。

#### Scenario: 遗留 styles.css 处理
- **WHEN** 根目录存在 `styles.css` 且不被 `index.html` 或 `src/` 下任何文件引用
- **THEN** 该文件 SHALL 被移动到 `legacy/` 目录
