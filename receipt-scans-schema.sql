-- ══════════════════════════════════════════════════════════════
--  小票扫描记录表 + Storage bucket
--  在 Supabase SQL Editor 中执行
-- ══════════════════════════════════════════════════════════════

-- 1. 创建 receipt_scans 表
create table if not exists receipt_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  image_path text not null,               -- Storage 中的路径
  scan_result jsonb not null,             -- Claude 识别出的 JSON
  bill_id uuid references bills(id) on delete set null,  -- 关联的账单（保存后填入）
  created_at timestamptz default now()
);

-- 2. RLS
alter table receipt_scans enable row level security;

create policy "receipt_scans_read_own" on receipt_scans
  for select using (user_id = auth.uid());

create policy "receipt_scans_insert_own" on receipt_scans
  for insert with check (user_id = auth.uid());

create policy "receipt_scans_update_own" on receipt_scans
  for update using (user_id = auth.uid());

-- 3. 索引
create index idx_receipt_scans_user on receipt_scans(user_id);
create index idx_receipt_scans_created on receipt_scans(created_at desc);

-- ══════════════════════════════════════════════════════════════
--  Storage bucket（需要在 Supabase Dashboard → Storage 中创建）
--  或者用 SQL：
-- ══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('receipt-images', 'receipt-images', false)
on conflict (id) do nothing;

-- Storage RLS: 用户只能上传/读取自己的文件
create policy "receipt_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'receipt-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "receipt_images_read" on storage.objects
  for select using (
    bucket_id = 'receipt-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
