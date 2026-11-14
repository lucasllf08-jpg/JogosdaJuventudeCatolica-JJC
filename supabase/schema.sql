-- ====================================================================
-- JJC · Banco de dados dos resultados (Supabase)
-- Cole este arquivo inteiro em  Supabase > SQL Editor > New query > Run
-- ====================================================================

-- 1) Resultados de cada jogo -----------------------------------------
-- id = "modalidade/categoria/origem/posição"
--   ex.: mesa/tenis-de-mesa-adulto-masculino/c0/j0   (chave 1, jogo 1)
--        mesa/tenis-de-mesa-adulto-masculino/f1/j0   (fase final 2, jogo 1)
-- (o painel html/admin.html gera esses ids sozinho)
create table if not exists public.jogos_resultados (
  id            text primary key,
  placar        text not null default '',     -- "3x1"
  penaltis      text not null default '',     -- "4x3"
  obs           text not null default '',     -- "W.O.", "Adiado"...
  a             text,                         -- troca o time A (mata-mata)
  b             text,                         -- troca o time B (mata-mata)
  data          text,                         -- "21/11"
  hora          text,                         -- "08:00"
  local         text,                         -- "Quadra 1"
  cartoes       jsonb not null default '[]'::jsonb,  -- [{lado,atleta,tipo}]
  atualizado_em timestamptz not null default now()
);

-- 2) Quem é administrador --------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 3) Segurança (RLS): todos leem, só administrador grava ------------
alter table public.jogos_resultados enable row level security;
alter table public.admins           enable row level security;

drop policy if exists "leitura publica"   on public.jogos_resultados;
drop policy if exists "admin insere"      on public.jogos_resultados;
drop policy if exists "admin atualiza"    on public.jogos_resultados;
drop policy if exists "admin apaga"       on public.jogos_resultados;
drop policy if exists "ver o proprio admin" on public.admins;

create policy "leitura publica" on public.jogos_resultados
  for select to anon, authenticated using (true);

create policy "admin insere" on public.jogos_resultados
  for insert to authenticated
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admin atualiza" on public.jogos_resultados
  for update to authenticated
  using      (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "admin apaga" on public.jogos_resultados
  for delete to authenticated
  using (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "ver o proprio admin" on public.admins
  for select to authenticated using (user_id = auth.uid());

grant select on public.jogos_resultados to anon, authenticated;
grant insert, update, delete on public.jogos_resultados to authenticated;
grant select on public.admins to authenticated;

-- 4) DEPOIS de criar o seu usuário em  Authentication > Users  ------
--    (Add user > Create new user, com e-mail e senha), rode:
--
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'SEU_EMAIL_AQUI';
--
-- IMPORTANTE: em  Authentication > Sign In / Providers  DESLIGUE
-- "Allow new users to sign up" para ninguém criar conta sozinho.
