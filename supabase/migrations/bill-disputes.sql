-- Bill disputes: allows members to challenge bill item assignments via AI arbitration
create table if not exists bill_disputes (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  challenger_id uuid not null references auth.users(id),
  reason text not null,
  suggested_items jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

-- Index for fast lookup by bill
create index if not exists idx_bill_disputes_bill_id on bill_disputes(bill_id);

-- RLS policies
alter table bill_disputes enable row level security;

-- Anyone involved in the bill can read disputes
create policy "Users can read disputes on their bills"
  on bill_disputes for select
  using (
    exists (
      select 1 from bills b
      where b.id = bill_disputes.bill_id
      and (
        b.payer_id = auth.uid()
        or exists (
          select 1 from bill_items bi
          join bill_item_members bim on bim.item_id = bi.id
          where bi.bill_id = b.id and bim.user_id = auth.uid()
        )
      )
    )
  );

-- Members (non-payer) can insert disputes
create policy "Members can create disputes"
  on bill_disputes for insert
  with check (challenger_id = auth.uid());

-- Payer can update dispute status (accept/reject)
create policy "Payer can update dispute status"
  on bill_disputes for update
  using (
    exists (
      select 1 from bills b
      where b.id = bill_disputes.bill_id
      and b.payer_id = auth.uid()
    )
  );
