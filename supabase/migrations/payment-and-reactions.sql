-- ═══════════════════════════════════
-- 付款凭证表
-- ═══════════════════════════════════
create table if not exists payment_proofs (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  image_url text not null,
  created_at timestamptz default now()
);

alter table payment_proofs enable row level security;
-- 所有登录用户可读
create policy "payment_proofs_select" on payment_proofs
  for select using (true);
-- 登录用户可上传自己的
create policy "payment_proofs_insert" on payment_proofs
  for insert with check (auth.uid() = user_id);

-- ═══════════════════════════════════
-- 异议/怒气表
-- ═══════════════════════════════════
create table if not exists bill_reactions (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  anger_count int default 0,
  seen boolean default false,
  updated_at timestamptz default now(),
  unique(bill_id, user_id)
);

alter table bill_reactions enable row level security;
create policy "bill_reactions_select" on bill_reactions
  for select using (true);
create policy "bill_reactions_insert" on bill_reactions
  for insert with check (auth.uid() = user_id);
-- 自己可以更新自己的怒气，收款人也可以标记已读 → 合并成一条
create policy "bill_reactions_update" on bill_reactions
  for update using (
    auth.uid() = user_id
    or exists (select 1 from bills where bills.id = bill_reactions.bill_id and bills.payer_id = auth.uid())
  );

-- ═══════════════════════════════════
-- Storage: payment-proofs bucket
-- 在 Supabase Dashboard → Storage 手动创建
-- ═══════════════════════════════════
-- 如果 bucket 已存在可跳过这步，需要在 Dashboard 操作：
-- 1. 创建 bucket 名为 "payment-proofs"
-- 2. 设为 Public bucket
-- 3. 然后运行以下 Storage RLS：

-- 允许登录用户上传
create policy "storage_payment_insert"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');

-- 允许所有人读取
create policy "storage_payment_select"
  on storage.objects for select
  using (bucket_id = 'payment-proofs');
