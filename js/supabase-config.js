/* ==================================================================
   supabase-config.js
   ------------------------------------------------------------------
   Liga o site ao Supabase (placares, pênaltis, cartões e horários
   lançados em html/admin.html).

   Enquanto  url  e  anonKey  estiverem vazios, o site funciona
   normalmente só com os dados de js/tabelas-data.js.

   COMO PREENCHER
     1. No Supabase: Project Settings > API (ou "API Keys").
     2. url      -> "Project URL"            (https://xxxx.supabase.co)
     3. anonKey  -> chave "anon public" (ou "publishable")

   ATENÇÃO: use SOMENTE a chave anon/publishable. NUNCA coloque a
   chave "service_role" / "secret" aqui — este arquivo é público.
   A anon key pode ser pública porque as regras (RLS) criadas em
   supabase/schema.sql só permitem LER; quem grava precisa estar
   logado como administrador.
   ================================================================== */
const JJC_SUPABASE = {
  url: "https://amxtgaeujqwmeyylcxuc.supabase.co",        // ex.: "https://abcdefghijkl.supabase.co"
  anonKey: "sb_publishable_lqqY8iPv1iIoz03nr7xTvg_6orhEqGS",    // ex.: "eyJhbGciOi..."  ou  "sb_publishable_..."
  tabela: "jogos_resultados"
};
