-- ══════════════════════════════════════════════════════════════
--  修复 RLS 无限递归（使用 SECURITY DEFINER 函数打破循环）
--  在 Supabase SQL Editor 中执行
-- ══════════════════════════════════════════════════════════════

-- 1. 删除有问题的旧策略
drop policy if exists "bills_read" on bills;
drop policy if exists "bill_items_read" on bill_items;
drop policy if exists "bill_item_members_read" on bill_item_members;

-- 2. 创建 SECURITY DEFINER 辅助函数（绕过 RLS，不会触发递归）
create or replace function get_my_bill_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  -- 我垫付的账单
  select id from bills where payer_id = auth.uid()
  union
  -- 我参与分摊的账单
  select bi.bill_id
  from bill_items bi
  join bill_item_members bim on bim.item_id = bi.id
  where bim.user_id = auth.uid()
$$;

-- 3. 用辅助函数重建三张表的 READ 策略（不再互相引用）
create policy "bills_read" on bills for select using (
  id in (select get_my_bill_ids())
);

create policy "bill_items_read" on bill_items for select using (
  bill_id in (select get_my_bill_ids())
);

create policy "bill_item_members_read" on bill_item_members for select using (
  user_id = auth.uid()
  or item_id in (
    select id from bill_items where bill_id in (select get_my_bill_ids())
  )
);
