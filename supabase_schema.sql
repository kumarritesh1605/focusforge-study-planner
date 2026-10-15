-- FocusForge Supabase setup
-- Run this entire script in Supabase Dashboard → SQL Editor → New query.
-- These policies make each signed-in user able to access ONLY their own rows.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text default 'General',
  priority text not null default 'Medium' check (priority in ('High','Medium','Low')),
  due_date date,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  reminder_at timestamptz,
  repeat text not null default 'none' check (repeat in ('none','daily','weekly','monthly')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null,
  mock_date date not null default current_date,
  score numeric not null default 0,
  max_score numeric not null default 100 check (max_score > 0),
  correct integer,
  wrong integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_due_idx on public.tasks(user_id, due_date);
create index if not exists tasks_user_created_idx on public.tasks(user_id, created_at desc);
create index if not exists mocks_user_date_idx on public.mocks(user_id, mock_date desc);

alter table public.tasks enable row level security;
alter table public.mocks enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks" on public.tasks
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own mocks" on public.mocks;
create policy "Users manage own mocks" on public.mocks
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.mocks to authenticated;


-- Upcoming exam tracker with manually entered platform scores
create table if not exists public.exam_tracker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_name text not null,
  exam_date date,
  notes text,
  oliveboard_score numeric,
  testbook_score numeric,
  guidely_score numeric,
  created_at timestamptz not null default now()
);
create index if not exists exam_tracker_user_date_idx on public.exam_tracker(user_id, exam_date);
alter table public.exam_tracker enable row level security;
drop policy if exists "Users manage own exam tracker" on public.exam_tracker;
create policy "Users manage own exam tracker" on public.exam_tracker
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
grant select, insert, update, delete on public.exam_tracker to authenticated;
