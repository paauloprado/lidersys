-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- Enum de Perfis
create type user_role as enum ('admin', 'lider', 'lideranca', 'liderado');

-- Tabela de Perfis/Usuários vinculada ao auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  cpf text unique,
  phone text,
  role user_role not null default 'liderado',
  parent_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Liderados / Base de Votos
create table public.voters_ledger (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  city text,
  zone text,
  section text,
  notes text,
  lideranca_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- HABILITAR RLS
alter table public.profiles enable row level security;
alter table public.voters_ledger enable row level security;

-- ==========================================
-- POLÍTICAS: public.profiles
-- ==========================================
-- Admins veem tudo
create policy "Admins podem visualizar todos os perfis" on public.profiles
  for select using ( auth.uid() in (select id from public.profiles where role = 'admin') );

-- O próprio usuário pode visualizar seu perfil
create policy "Usuário pode visualizar seu próprio perfil" on public.profiles
  for select using ( auth.uid() = id );

-- Líder pode visualizar as lideranças subordinadas a ele
create policy "Líder pode visualizar suas lideranças subordinadas" on public.profiles
  for select using ( parent_id = auth.uid() );

-- Admins podem inserir e atualizar perfis
create policy "Admins podem modificar perfis" on public.profiles
  for all using ( auth.uid() in (select id from public.profiles where role = 'admin') );

-- ==========================================
-- POLÍTICAS: public.voters_ledger
-- ==========================================
-- Admins veem e gerenciam tudo
create policy "Admins gerenciam voters" on public.voters_ledger
  for all using ( auth.uid() in (select id from public.profiles where role = 'admin') );

-- Líder pode visualizar (Select) os liderados das suas Lideranças
create policy "Líder pode visualizar voters de suas lideranças" on public.voters_ledger
  for select using (
    lideranca_id in (select id from public.profiles where parent_id = auth.uid())
  );

-- Liderança pode gerenciar (CRUD) seus próprios liderados
create policy "Lideranças gerenciam seus próprios voters" on public.voters_ledger
  for all using ( lideranca_id = auth.uid() );
