## Context

当前账单系统已有：
- `bills` → `bill_items` → `bill_item_members` 三级数据模型
- `bill_reactions` 表支持"😡异议"愤怒值系统，但仅是情绪表达，无实际修改能力
- `scan-receipt` Edge Function 已封装 Claude API 调用，支持 prompt + 图片/文本输入
- SplitDetail 组件已区分 payer 和 member 角色，展示不同操作按钮
- BillSheet 组件已支持账单编辑（修改 items 和 member 分配）

## Goals / Non-Goals

**Goals:**
- 让被分摊成员能提出有理有据的争议，而非只能"发怒"
- AI 根据辩词自动生成合理的新分配方案（主要调整 item 的 member 分配）
- 账单发起者能清晰看到争议原因和建议方案，一键决定是否采纳
- 整个流程状态可追踪（裁决中 / 已解决）

**Non-Goals:**
- 不支持多人同时对同一账单发起多个争议（一次只处理一个活跃争议）
- 不支持争议的多轮协商（一次辩词 → 一次裁决 → 发起者决定）
- 不改变现有的愤怒值系统，争议是独立功能

## Decisions

### 1. 数据模型：新建 `bill_disputes` 表

```sql
create table bill_disputes (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id) on delete cascade,
  challenger_id uuid references auth.users(id),
  reason text not null,                    -- 质疑人的辩词
  suggested_items jsonb not null,          -- AI 生成的新分配方案
  status text not null default 'pending',  -- pending | accepted | rejected
  created_at timestamptz default now()
);
```

**为什么用 jsonb 存 suggested_items**：AI 生成的是完整的 items+members 方案快照，用 jsonb 存储最灵活，无需额外关联表。发起者接受后再写入实际的 bill_items 表。

**为什么不复用 bill_reactions**：reactions 是轻量的情绪表达（anger_count），争议需要存储辩词、AI 方案、审批状态，职责完全不同。

### 2. AI 裁决：复用 `scan-receipt` Edge Function

不新建 Edge Function。`scan-receipt` 已支持纯文本 prompt（无图片时用 haiku 模型），争议裁决只需构建合适的 prompt 发送即可。

**Prompt 策略**：将原账单的 items + members 数据和质疑人的辩词一起发给 AI，要求返回调整后的 items JSON（仅修改 member 分配，不改价格/数量）。

### 3. 前端流程设计

**质疑人侧（member）**：
- SplitDetail 中现有"😡 异议"按钮旁新增"⚖️ 质疑"按钮
- 点击弹出 DisputeSheet：文本框输入辩词 → 提交 → AI 返回新方案 → 可编辑微调 → 确认提交
- 提交后在 bill_disputes 表创建记录

**发起者侧（payer）**：
- 账单列表中有活跃争议的账单显示"裁决中"标记
- SplitDetail 顶部显示争议 banner，点击展开查看辩词和建议方案的 diff
- 两个按钮：接受（更新账单）/ 拒绝（关闭争议）

### 4. 账单状态展示

不在 bills 表中新增字段。通过 join 查询 `bill_disputes` 中是否有 `status='pending'` 的记录来判断是否"裁决中"。避免数据冗余和状态同步问题。

## Risks / Trade-offs

- **AI 方案质量不稳定** → 质疑人可在提交前编辑 AI 方案；发起者有最终决定权
- **争议可能被滥用** → 限制同一账单同时只能有一个 pending 争议；已结清账单不可质疑
- **jsonb 存储方案的一致性** → 接受争议时需要完整替换 bill_items，复用现有 `updateBill` 逻辑确保数据一致性
