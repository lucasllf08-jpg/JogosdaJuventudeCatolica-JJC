-- ====================================================================
-- JJC · Colunas novas para o painel por esporte
-- Supabase > SQL Editor > New query > cole TUDO > Run  (rode 1 vez)
-- Pode repetir sem problema.
-- ====================================================================

alter table public.jogos_resultados
  -- pontos de cada set/jogo.  ex.: [[25,20],[18,25],[15,12]]
  -- (vôlei, tênis de mesa, pebolim; na queimada guarda o tempo normal)
  add column if not exists parciais jsonb not null default '[]'::jsonb,

  -- dados específicos do esporte.  ex.: {"ft":{"a":1,"b":0}}  faltas técnicas (pebolim)
  --                                     {"ms":"a"}            morte súbita (queimada)
  add column if not exists extras   jsonb not null default '{}'::jsonb;

-- Conferir:  select id, placar, parciais, extras from public.jogos_resultados;
