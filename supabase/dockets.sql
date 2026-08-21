-- Docket handling for Booking / TS Booking / Nursery booking income.
-- Run this in the Supabase SQL Editor.

create table if not exists public.dockets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  docket_number text not null,
  status text not null default 'in_hand'
    check (status in ('in_hand', 'used')),
  delivery_status text
    check (delivery_status in ('delivered', 'undelivered')),
  chargeable_weight numeric(12, 3),
  amount numeric(12, 2),
  transaction_id uuid references public.transactions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dockets_account_number_unique unique (account_id, docket_number),
  constraint dockets_in_hand_clean check (
    (
      status = 'in_hand'
      and delivery_status is null
      and chargeable_weight is null
      and amount is null
      and transaction_id is null
    )
    or status = 'used'
  ),
  constraint dockets_used_ready check (
    status = 'in_hand'
    or (
      status = 'used'
      and delivery_status is not null
      and chargeable_weight is not null
      and transaction_id is not null
    )
  )
);

create index if not exists dockets_account_status_idx
  on public.dockets (account_id, status);

create index if not exists dockets_user_id_idx
  on public.dockets (user_id);

create index if not exists dockets_transaction_id_idx
  on public.dockets (transaction_id);

create or replace function public.set_dockets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dockets_set_updated_at on public.dockets;
create trigger dockets_set_updated_at
before update on public.dockets
for each row
execute procedure public.set_dockets_updated_at();

-- Return used dockets to in-hand when the linked booking is deleted.
create or replace function public.reset_dockets_on_transaction_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dockets
  set
    status = 'in_hand',
    delivery_status = null,
    chargeable_weight = null,
    amount = null,
    transaction_id = null,
    updated_at = now()
  where transaction_id = old.id;

  return old;
end;
$$;

drop trigger if exists dockets_reset_on_transaction_delete on public.transactions;
create trigger dockets_reset_on_transaction_delete
before delete on public.transactions
for each row
execute procedure public.reset_dockets_on_transaction_delete();

alter table public.dockets enable row level security;

drop policy if exists "Users can view own dockets" on public.dockets;
create policy "Users can view own dockets"
  on public.dockets
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own dockets" on public.dockets;
create policy "Users can insert own dockets"
  on public.dockets
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own dockets" on public.dockets;
create policy "Users can update own dockets"
  on public.dockets
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own dockets" on public.dockets;
create policy "Users can delete own dockets"
  on public.dockets
  for delete
  using (auth.uid() = user_id);
