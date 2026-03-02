-- ══════════════════════════════════════════════════════════════
--  分一下 · Supabase Schema
--  在 Supabase SQL Editor 中执行此文件
-- ══════════════════════════════════════════════════════════════

-- 1. 用户表
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  emoji text default '😀',
  color text default '#1c1c26',
  pin_hash text,
  created_at timestamptz default now()
);

-- 2. 好友关系（双向：A加B后，B也能看到A）
create table friendships (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references users(id) on delete cascade not null,
  user_b uuid references users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

-- 3. 账单主表
create table bills (
  id uuid default gen_random_uuid() primary key,
  icon text not null default '🧾',
  title text not null,
  description text,
  total_amount numeric(10,2) not null,
  date date not null default current_date,
  payer_id uuid references users(id) not null,
  settled boolean default false,
  color text,
  created_at timestamptz default now()
);

-- 4. 账单条目（每张小票上的每一项）
create table bill_items (
  id uuid default gen_random_uuid() primary key,
  bill_id uuid references bills(id) on delete cascade not null,
  name text not null,
  price numeric(10,2) not null,
  qty int default 1,
  sort_order int default 0
);

-- 5. 条目分摊人（谁分摊这一项）
create table bill_item_members (
  item_id uuid references bill_items(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  primary key (item_id, user_id)
);

-- ══════════════════════════════════════════════════════════════
--  视图：快速查询"和我相关的所有账单"
-- ══════════════════════════════════════════════════════════════
create or replace view my_bills as
select distinct b.*,
  payer.name   as payer_name,
  payer.emoji  as payer_emoji
from bills b
join users payer on payer.id = b.payer_id
left join bill_items bi on bi.bill_id = b.id
left join bill_item_members bim on bim.item_id = bi.id
where b.payer_id = auth.uid()          -- 我垫付的
   or bim.user_id = auth.uid();        -- 我参与分摊的

-- ══════════════════════════════════════════════════════════════
--  视图：每个人在某账单中应付多少
-- ══════════════════════════════════════════════════════════════
create or replace view bill_shares as
select
  bi.bill_id,
  bim.user_id,
  u.name as user_name,
  u.emoji as user_emoji,
  sum(bi.price * bi.qty / member_count.cnt) as share_amount
from bill_items bi
join bill_item_members bim on bim.item_id = bi.id
join users u on u.id = bim.user_id
join lateral (
  select count(*)::numeric as cnt
  from bill_item_members bim2
  where bim2.item_id = bi.id
) member_count on true
group by bi.bill_id, bim.user_id, u.name, u.emoji;

-- ══════════════════════════════════════════════════════════════
--  RLS：行级安全策略
-- ══════════════════════════════════════════════════════════════
alter table users enable row level security;
alter table friendships enable row level security;
alter table bills enable row level security;
alter table bill_items enable row level security;
alter table bill_item_members enable row level security;

-- 用户只能读自己 + 好友的信息
create policy "users_read_self_and_friends" on users for select using (
  id = auth.uid()
  or id in (
    select user_b from friendships where user_a = auth.uid()
    union
    select user_a from friendships where user_b = auth.uid()
  )
);
create policy "users_insert_self" on users for insert with check (id = auth.uid());
create policy "users_update_self" on users for update using (id = auth.uid());

-- 好友关系：自己创建的
create policy "friendships_read" on friendships for select using (
  user_a = auth.uid() or user_b = auth.uid()
);
create policy "friendships_insert" on friendships for insert with check (
  user_a = auth.uid()
);

-- 账单：我垫付的 或 我参与的
create policy "bills_read" on bills for select using (
  payer_id = auth.uid()
  or id in (
    select bi.bill_id from bill_items bi
    join bill_item_members bim on bim.item_id = bi.id
    where bim.user_id = auth.uid()
  )
);
create policy "bills_insert" on bills for insert with check (payer_id = auth.uid());
create policy "bills_update" on bills for update using (payer_id = auth.uid());

-- 账单条目：跟随账单权限
create policy "bill_items_read" on bill_items for select using (
  bill_id in (select id from bills)  -- 利用 bills 的 RLS
);
create policy "bill_items_insert" on bill_items for insert with check (
  bill_id in (select id from bills where payer_id = auth.uid())
);

-- 条目分摊人：跟随条目权限
create policy "bill_item_members_read" on bill_item_members for select using (
  item_id in (select id from bill_items)
);
create policy "bill_item_members_insert" on bill_item_members for insert with check (
  item_id in (
    select bi.id from bill_items bi
    join bills b on b.id = bi.bill_id
    where b.payer_id = auth.uid()
  )
);

-- ══════════════════════════════════════════════════════════════
--  索引
-- ══════════════════════════════════════════════════════════════
create index idx_bills_payer on bills(payer_id);
create index idx_bills_date on bills(date desc);
create index idx_bill_items_bill on bill_items(bill_id);
create index idx_bill_item_members_user on bill_item_members(user_id);
create index idx_friendships_a on friendships(user_a);
create index idx_friendships_b on friendships(user_b);
