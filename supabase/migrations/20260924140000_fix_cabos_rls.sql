-- Fix: Adiciona policy de SELECT para cabos_ledger (estava faltando)
-- e garante que cabos_ledger tem SELECT para liderança e admin.

-- SELECT: Admin vê tudo; liderança e líderes veem os seus próprios registros
drop policy if exists "Cabos select allowed" on public.cabos_ledger;
create policy "Cabos select allowed" on public.cabos_ledger
  for select using (
    public.is_admin()
    or auth.uid() = user_id
    or user_id in (select id from public.profiles where parent_id = auth.uid())
  );

-- Fix: Garante que SELECT da tabela profiles também permite que o próprio usuário
-- autenticado leia seu perfil (necessário para is_admin() funcionar corretamente).
drop policy if exists "Usuário pode visualizar seu próprio perfil" on public.profiles;
create policy "Usuário pode visualizar seu próprio perfil" on public.profiles
  for select using (auth.uid() = id);

-- Fix: Adiciona SELECT de voting_locations para todos os autenticados (necessário para o select de formulários)
drop policy if exists "Authenticated users can view voting locations" on public.voting_locations;
create policy "Authenticated users can view voting locations" on public.voting_locations
  for select using (auth.uid() is not null);
