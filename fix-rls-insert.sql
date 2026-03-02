-- ══════════════════════════════════════════════════════════════
--  修复 INSERT / UPDATE / DELETE 的 RLS 策略
--  在 Supabase SQL Editor 中执行
-- ══════════════════════════════════════════════════════════════

-- ── 修复 SELECT 策略（STABLE 函数看不到当前语句刚插入的行）──
drop policy if exists "bills_read" on bills;
create policy "bills_read" on bills for select using (
  payer_id = auth.uid()
  OR id IN (SELECT get_my_bill_ids())
);

-- 先删除旧的（如果存在），再重建，避免冲突
drop policy if exists "bills_insert" on bills;
drop policy if exists "bills_update" on bills;
drop policy if exists "bills_delete" on bills;
drop policy if exists "bill_items_insert" on bill_items;
drop policy if exists "bill_items_delete" on bill_items;
drop policy if exists "bill_item_members_insert" on bill_item_members;
drop policy if exists "bill_item_members_delete" on bill_item_members;

-- ── bills 表 ──
create policy "bills_insert" on bills
  for insert with check (payer_id = auth.uid());

create policy "bills_update" on bills
  for update using (payer_id = auth.uid());

create policy "bills_delete" on bills
  for delete using (payer_id = auth.uid());

-- ── bill_items 表 ──
create policy "bill_items_insert" on bill_items
  for insert with check (
    bill_id in (select id from bills where payer_id = auth.uid())
  );

create policy "bill_items_delete" on bill_items
  for delete using (
    bill_id in (select id from bills where payer_id = auth.uid())
  );

-- ── bill_item_members 表 ──
create policy "bill_item_members_insert" on bill_item_members
  for insert with check (
    item_id in (
      select bi.id from bill_items bi
      join bills b on b.id = bi.bill_id
      where b.payer_id = auth.uid()
    )
  );

create policy "bill_item_members_delete" on bill_item_members
  for delete using (
    item_id in (
      select bi.id from bill_items bi
      join bills b on b.id = bi.bill_id
      where b.payer_id = auth.uid()
    )
  );
