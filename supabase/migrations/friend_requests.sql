-- 1.1 Create friend_requests table
create table friend_requests (
  id uuid default gen_random_uuid() primary key,
  from_user uuid references users(id) on delete cascade not null,
  to_user uuid references users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (from_user, to_user)
);

alter table friend_requests enable row level security;

create policy "Users can view their own requests"
  on friend_requests for select
  using (from_user = auth.uid() or to_user = auth.uid());

create policy "Users can send requests"
  on friend_requests for insert
  with check (from_user = auth.uid());

create policy "Users can update requests sent to them"
  on friend_requests for update
  using (to_user = auth.uid());

-- 1.2 Search user by email RPC
create or replace function search_user_by_email(search_email text)
returns table(id uuid, name text, emoji text) as $$
begin
  return query
    select u.id, u.name, u.emoji
    from users u
    where u.email = search_email
      and u.id != auth.uid()
    limit 1;
end;
$$ language plpgsql security definer;

-- 1.3 Accept friend request RPC
create or replace function accept_friend_request(request_id uuid)
returns void as $$
declare
  req record;
  a uuid;
  b uuid;
begin
  select * into req from friend_requests
    where id = request_id and to_user = auth.uid() and status = 'pending';

  if not found then
    raise exception 'Request not found or not authorized';
  end if;

  -- Update request status
  update friend_requests set status = 'accepted', updated_at = now()
    where id = request_id;

  -- Insert friendship with canonical ordering
  a := least(req.from_user, req.to_user);
  b := greatest(req.from_user, req.to_user);
  insert into friendships (user_a, user_b)
    values (a, b)
    on conflict (user_a, user_b) do nothing;
end;
$$ language plpgsql security definer;

-- 1.4 Reject friend request RPC
create or replace function reject_friend_request(request_id uuid)
returns void as $$
begin
  update friend_requests set status = 'rejected', updated_at = now()
    where id = request_id and to_user = auth.uid() and status = 'pending';

  if not found then
    raise exception 'Request not found or not authorized';
  end if;
end;
$$ language plpgsql security definer;
