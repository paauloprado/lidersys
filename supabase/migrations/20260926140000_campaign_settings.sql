-- Tabela de configurações gerais da campanha (meta de votos, etc.)
create table if not exists public.campaign_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserir meta padrão de 5000
insert into public.campaign_settings (key, value)
values ('meta_eleitores', '5000')
on conflict (key) do nothing;

-- RLS: apenas service_role e admin podem escrever
alter table public.campaign_settings enable row level security;

-- Qualquer autenticado pode ler
create policy "Autenticados podem ler configurações" on public.campaign_settings
  for select using ( auth.role() = 'authenticated' );

-- Apenas admins podem modificar
create policy "Admins podem modificar configurações" on public.campaign_settings
  for all using ( auth.uid() in (select id from public.profiles where role = 'admin') );
