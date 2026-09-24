-- Tables and columns required by the current application.
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(), name text not null,
  number text not null, role text not null, party text, created_at timestamptz not null default now()
);
create table if not exists public.voting_locations (
  id uuid primary key default gen_random_uuid(), name text not null,
  neighborhood text not null, created_at timestamptz not null default now()
);
create table if not exists public.cabos_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'individual', quantity integer not null default 1,
  candidate_id uuid references public.candidates(id) on delete set null,
  name text, phone text, neighborhood text, voting_location text,
  created_at timestamptz not null default now()
);
alter table public.voters_ledger add column if not exists type text not null default 'individual';
alter table public.voters_ledger add column if not exists quantity integer not null default 1;
alter table public.voters_ledger add column if not exists neighborhood text;
alter table public.voters_ledger add column if not exists voting_location text;

-- Roles, RLS, and write permissions required by the current application.
alter table public.profiles add column if not exists access_modules jsonb not null default '[]'::jsonb;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.role = 'admin' from public.profiles p where p.id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
alter table public.voters_ledger enable row level security;
alter table public.cabos_ledger enable row level security;
alter table public.candidates enable row level security;
alter table public.voting_locations enable row level security;

drop policy if exists "Admins podem visualizar todos os perfis" on public.profiles;
create policy "Admins podem visualizar todos os perfis" on public.profiles
  for select using (public.is_admin());
drop policy if exists "Admins podem modificar perfis" on public.profiles;
create policy "Admins podem modificar perfis" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins gerenciam voters" on public.voters_ledger;
create policy "Admins gerenciam voters" on public.voters_ledger
  for all using (public.is_admin()) with check (public.is_admin());

-- Replace legacy unscoped policies. Postgres combines permissive policies with OR.
drop policy if exists "voting_locations_all" on public.voting_locations;
drop policy if exists "voting_locations_read" on public.voting_locations;
drop policy if exists "voting_locations_admin_manage" on public.voting_locations;
create policy "voting_locations_admin_manage" on public.voting_locations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can insert own cabos" on public.cabos_ledger;
create policy "Cabos insert allowed for owner or admin" on public.cabos_ledger
  for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "Users can update own cabos" on public.cabos_ledger;
create policy "Cabos update allowed for owner or admin" on public.cabos_ledger
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "Users can delete own cabos" on public.cabos_ledger;
create policy "Cabos delete allowed for owner or admin" on public.cabos_ledger
  for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage candidates" on public.candidates;
create policy "Admins can manage candidates" on public.candidates
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Everyone can view candidates" on public.candidates;
create policy "Authenticated users can view candidates" on public.candidates
  for select using (auth.uid() is not null);
