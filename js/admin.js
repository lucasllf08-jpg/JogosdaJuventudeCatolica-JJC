/* ==================================================================
   admin.js — painel da organização (html/admin.html)
   ------------------------------------------------------------------
   Lança placar, parciais (sets), pênaltis, cartões, horário/local e (no
   mata-mata) os confrontos de cada jogo. Tudo é gravado no Supabase
   (tabela jogos_resultados) e aparece em html/tabelas.html sem mexer
   no código.

   Cada esporte tem seu formulário (ver perfilDe):
     Futsal ........ gols · pênaltis (mata-mata empatado) · cartões
     Vôlei ......... pontos de cada set (set 3 só se 1x1) · placar em sets
     Queimada ...... queimados · morte súbita se empatar
     Tênis de mesa . pontos de cada set (3 a 5, botão "+ Set")
     Pebolim ....... gols de cada jogo (3 a 5) · faltas técnicas

   Os jogos listados aqui vêm de js/tabelas-data.js. O id de cada jogo
   é gerado pela POSIÇÃO dele no arquivo:
        modalidade/categoria/c<chave>/j<jogo>      (fase de grupos)
        modalidade/categoria/f<fase>/j<jogo>       (fase final)
   => depois que os resultados começarem a ser lançados, NÃO reordene
      nem apague jogos em tabelas-data.js (acrescentar no fim é seguro).
   ================================================================== */
(function () {
  "use strict";

  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const norm = s => String(s ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s*[—–-]\s*time\s*(\d+)/g, " $1")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const GENERO = { masculino: "Masc.", feminino: "Fem.", misto: "Misto" };
  const JOGO = { "tenis-de-mesa": "Tênis de Mesa", pebolim: "Pebolim" };
  const TABELA = (typeof JJC_SUPABASE !== "undefined" && JJC_SUPABASE.tabela) || "jogos_resultados";

  let client = null;
  let cats = [];            // categorias que esta pessoa pode editar
  let permissoes = null;    // null = acesso total
  let modAtual = null;
  let atual = null;         // categoria selecionada
  let linhas = {};          // id -> linha do banco da categoria atual
  let defs = {};            // id -> { a, b, est } dos jogos desenhados
  let contador = 0;

  document.addEventListener("DOMContentLoaded", boot);

  /* ================================================================
     PERFIL DE CADA ESPORTE
     ================================================================ */
  function perfilDe(cat) {
    const s = cat.slug, j = cat.t.jogo;
    if (s === "futsal")
      return { tipo: "pontos", unidade: "Gols", penaltis: true, cartoes: true, local: true };
    if (s === "volei")
      return { tipo: "sets", unidade: "Set", sets: 3, max: 3, limite: 25, limiteDecisivo: 15, decisivo: true, local: true };
    if (s === "queimada")
      return { tipo: "pontos", unidade: "Queimados", morteSubita: true, local: true };
    if (s === "mesa" && j === "pebolim")
      return { tipo: "sets", unidade: "Jogo", sets: 3, max: 5, faltas: true, local: false };
    if (s === "mesa")
      return { tipo: "sets", unidade: "Set", sets: 3, max: 5, limite: 11, local: false };
    return { tipo: "pontos", unidade: "Pontos", penaltis: true, local: true };
  }

  /* ================================================================
     INICIALIZAÇÃO / LOGIN
     ================================================================ */
  function aviso(msg) {
    const el = $("[data-ad-aviso]");
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  async function boot() {
    if (typeof JJC_SUPABASE === "undefined" || !JJC_SUPABASE.url || !JJC_SUPABASE.anonKey) {
      aviso("Supabase ainda não configurado. Preencha url e anonKey em js/supabase-config.js.");
      return;
    }
    if (!window.supabase || !window.supabase.createClient) {
      aviso("Não foi possível carregar a biblioteca do Supabase (verifique a conexão com a internet).");
      return;
    }
    client = window.supabase.createClient(JJC_SUPABASE.url, JJC_SUPABASE.anonKey);

    document.addEventListener("click", aoClicar);
    document.addEventListener("input", aoDigitar);
    document.addEventListener("change", aoDigitar);
    $("[data-ad-form]").addEventListener("submit", entrar);
    $("[data-ad-categoria]").addEventListener("change", e => abrirCategoria(e.target.value));

    const { data } = await client.auth.getSession();
    await aoMudarSessao(data && data.session);
    client.auth.onAuthStateChange((_ev, session) => { aoMudarSessao(session); });
  }

  let sessaoId;   // undefined = ainda não verificado
  async function aoMudarSessao(session) {
    const uid = session && session.user ? session.user.id : null;
    if (uid === sessaoId) return;   // renovação de token etc.: nada a refazer
    sessaoId = uid;

    if (!session) { mostrar("login"); return; }

    // só administradores (tabela admins) usam o painel; 'permissoes' limita o que cada um edita
    let r = await client.from("admins").select("user_id, permissoes").eq("user_id", uid).maybeSingle();
    if (r.error && /permissoes/i.test(r.error.message || "")) {
      // coluna ainda não criada (permissoes.sql não rodou): todos os admins têm acesso total
      r = await client.from("admins").select("user_id").eq("user_id", uid).maybeSingle();
    }
    const email = session.user.email || "";
    $("[data-ad-email]").textContent = email;
    $("[data-ad-inicial]").textContent = (email[0] || "?");
    $("[data-ad-usuario]").hidden = false;

    if (r.error || !r.data) {
      aviso("Este usuário não tem permissão de administrador. Peça para ser adicionado na tabela admins.");
      mostrar("nenhum");
      return;
    }
    permissoes = Array.isArray(r.data.permissoes) ? r.data.permissoes : null;
    aviso("");
    mostrar("painel");
    montarCategorias();
  }

  function mostrar(qual) {
    $("[data-ad-login]").hidden = qual !== "login";
    $("[data-ad-painel]").hidden = qual !== "painel";
    if (qual === "login") { $("[data-ad-usuario]").hidden = true; aviso(""); }
  }

  async function entrar(e) {
    e.preventDefault();
    const f = e.target;
    const st = $("[data-ad-login-status]");
    st.className = "ad-status"; st.textContent = "Entrando...";
    const { error } = await client.auth.signInWithPassword({
      email: f.email.value.trim(), password: f.senha.value
    });
    if (error) { st.className = "ad-status erro"; st.textContent = "E-mail ou senha incorretos."; }
    else { st.textContent = ""; f.senha.value = ""; }
  }

  /* ================================================================
     MODALIDADES E CATEGORIAS
     ================================================================ */
  function podeCategoria(c) {
    if (!permissoes || permissoes.includes("*")) return true;
    const base = `${c.slug}/${c.id}/`;
    return permissoes.some(p => p && (base.startsWith(p) || p.startsWith(base)));
  }

  function rotuloCurto(slug, t) {
    const faixas = (typeof JJC_FAIXAS !== "undefined" && JJC_FAIXAS[slug]) ? JJC_FAIXAS[slug].faixas : [];
    const f = faixas.find(x => x.id === t.faixa);
    return [t.jogo ? (JOGO[t.jogo] || t.jogo) : "", f ? f.nome : cap(t.faixa), GENERO[t.genero] || t.genero]
      .filter(Boolean).join(" · ");
  }

  function montarCategorias() {
    cats = [];
    Object.keys(JJC_TABELAS).forEach(slug => {
      (JJC_TABELAS[slug] || []).forEach(t => {
        const temJogos = (t.chaves || []).some(c => (c.jogos || []).length) ||
                         (t.fasesFinais || []).some(f => (f.jogos || []).length);
        if (!temJogos) return;
        const c = {
          slug, t,
          id: [t.jogo, t.faixa, t.genero].filter(Boolean).join("-"),
          modalidade: (typeof JJC_DATA !== "undefined" && JJC_DATA[slug]) ? JJC_DATA[slug].nome : slug,
          label: rotuloCurto(slug, t)
        };
        c.perfil = perfilDe(c);
        if (podeCategoria(c)) cats.push(c);
      });
    });

    const abas = $("[data-ad-abas]");
    const box = $("[data-ad-jogos]");
    if (!cats.length) {
      abas.hidden = true;
      $("[data-ad-categoria]").innerHTML = "";
      box.innerHTML = `<p class="ad-aviso">Nenhuma categoria liberada para este usuário (ou sem jogos em js/tabelas-data.js).</p>`;
      return;
    }
    const mods = [];
    cats.forEach(c => { if (!mods.some(m => m.slug === c.slug)) mods.push({ slug: c.slug, nome: c.modalidade }); });
    abas.innerHTML = mods.map(m =>
      `<button type="button" role="tab" class="ad-aba" data-acao="aba" data-slug="${esc(m.slug)}" aria-selected="false">${esc(m.nome)}</button>`
    ).join("");
    abas.hidden = mods.length < 2;
    abrirModalidade(mods[0].slug);
  }

  function abrirModalidade(slug) {
    modAtual = slug;
    document.querySelectorAll(".ad-aba").forEach(b => b.setAttribute("aria-selected", b.dataset.slug === slug ? "true" : "false"));
    const sel = $("[data-ad-categoria]");
    sel.innerHTML = cats.map((c, i) => c.slug === slug ? `<option value="${i}">${esc(c.label)}</option>` : "").join("");
    abrirCategoria(sel.value);
  }

  async function abrirCategoria(indice) {
    atual = cats[Number(indice)];
    if (!atual) return;
    const box = $("[data-ad-jogos]");
    box.innerHTML = `<p class="ad-dica" style="color:var(--text-muted)">Carregando...</p>`;
    $("[data-ad-resumo]").innerHTML = "";
    $("[data-ad-ver]").href = `tabelas.html?modalidade=${encodeURIComponent(atual.slug)}&categoria=${encodeURIComponent(atual.id)}`;

    const { data, error } = await client.from(TABELA).select("*").like("id", `${atual.slug}/${atual.id}/%`);
    if (error) {
      box.innerHTML = `<p class="ad-aviso">Erro ao carregar resultados: ${esc(error.message)}</p>`;
      return;
    }
    linhas = {};
    (data || []).forEach(l => { linhas[l.id] = l; });
    desenhar();
  }

  /* ================================================================
     ATLETAS / INSCRITOS (para cartões e confrontos)
     ================================================================ */
  function registrosDaCategoria() {
    if (typeof JJC_EQUIPES === "undefined" || !atual) return [];
    const t = atual.t;
    return JJC_EQUIPES.filter(e => e.modalidade === atual.slug && e.faixa === t.faixa &&
      e.genero === t.genero && (e.jogo || null) === (t.jogo || null));
  }

  function atletasDe(nomeEquipe) {
    const n = norm(nomeEquipe);
    const regs = registrosDaCategoria();
    const porCom = {};
    regs.forEach(e => { porCom[e.comunidade] = (porCom[e.comunidade] || 0) + 1; });
    for (const e of regs) {
      if (e.jogo === "tenis-de-mesa") {
        const a = e.atletas.find(x => norm(x) === n);
        if (a) return [a];
      } else if (e.jogo === "pebolim") {
        if (norm(e.atletas.join(" / ")) === n) return e.atletas.slice();
      } else {
        const numerar = porCom[e.comunidade] > 1 && e.numero;
        const nome = numerar ? `${e.comunidade} ${e.numero}` : e.comunidade;
        if (norm(nome) === n || (!numerar && norm(nome + " 1") === n)) return e.atletas.slice();
      }
    }
    return [];
  }

  function nomesInscritos() {
    const regs = registrosDaCategoria();
    const porCom = {};
    regs.forEach(e => { porCom[e.comunidade] = (porCom[e.comunidade] || 0) + 1; });
    const out = [];
    regs.forEach(e => {
      if (e.jogo === "tenis-de-mesa") e.atletas.forEach(a => out.push(a));
      else if (e.jogo === "pebolim") out.push(e.atletas.join(" / "));
      else out.push(porCom[e.comunidade] > 1 && e.numero ? `${e.comunidade} ${e.numero}` : e.comunidade);
    });
    return out;
  }

  /* ================================================================
     DESENHO DOS JOGOS
     ================================================================ */
  const valor = (j, r, k) => (r && r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "") ? r[k] : (j[k] ?? "");

  function parsePar(txt) {
    const m = String(txt ?? "").match(/^\s*(\d+)\s*[x×X\-–:]\s*(\d+)\s*$/);
    return m ? [m[1], m[2]] : ["", ""];
  }

  function desenhar() {
    const t = atual.t;
    defs = {};
    const nChaves = (t.chaves || []).length;
    let html = `<datalist id="ad-inscritos">${nomesInscritos().map(n => `<option value="${esc(n)}">`).join("")}</datalist>`;

    (t.chaves || []).forEach((c, ci) => {
      if (!(c.jogos || []).length) return;
      html += `<h2 class="ad-secao-titulo">${esc(c.nome || (nChaves > 1 ? `Chave ${String.fromCharCode(65 + ci)}` : "Fase classificatória"))}</h2>`;
      let rod = null;
      c.jogos.forEach((j, ji) => {
        if (j.rodada !== undefined && j.rodada !== "" && j.rodada !== rod) {
          rod = j.rodada;
          html += `<p class="ad-rodada">${/^\d+$/.test(String(rod)) ? "Rodada " + esc(rod) : esc(rod)}</p>`;
        }
        html += htmlJogo(j, `${atual.slug}/${atual.id}/c${ci}/j${ji}`, false);
      });
    });

    (t.fasesFinais || []).forEach((f, fi) => {
      if (!(f.jogos || []).length) return;
      html += `<h2 class="ad-secao-titulo">${esc(f.fase || "Fase final")}</h2>`;
      f.jogos.forEach((j, ji) => { html += htmlJogo(j, `${atual.slug}/${atual.id}/f${fi}/j${ji}`, true); });
    });

    $("[data-ad-jogos]").innerHTML = html;
    document.querySelectorAll(".ad-jogo").forEach(card => { atualizarNomes(card); recalc(card); });
    atualizarProgresso();
    atualizarResumo();
  }

  function celula(classe, rotulo, k, i, val, extraAttr) {
    return `<label class="ad-cel"${extraAttr || ""}><span>${esc(rotulo)}</span>` +
           `<input class="${classe}" data-l="${k}" data-i="${i}" type="number" inputmode="numeric" min="0" step="1" value="${esc(val)}"></label>`;
  }

  function htmlTime(k, nome, final, P, n, vals, pen, ft) {
    const nomeHtml = final
      ? `<input class="ad-nm ad-nm-${k}" type="text" list="ad-inscritos" value="${esc(nome)}" aria-label="Equipe ${k.toUpperCase()}">`
      : `<span class="ad-nome ad-nome-${k}">${esc(nome)}</span>`;

    if (P.tipo === "pontos") {
      return `<div class="ad-time ad-time-${k}"><div class="ad-time-cab">${nomeHtml}` +
        celula("ad-s", P.unidade, k, 0, vals[0] ?? "") +
        (P.penaltis && final ? celula("ad-pen", "Pên.", k, 0, pen ?? "", " hidden") : "") +
        `</div></div>`;
    }
    let cels = "";
    for (let i = 0; i < n; i++) cels += celula("ad-s", `${P.unidade} ${i + 1}`, k, i, vals[i] ?? "");
    return `<div class="ad-time ad-time-${k}"><div class="ad-time-cab">${nomeHtml}` +
      (P.faltas ? celula("ad-ft", "FT", k, 0, ft ?? "") : "") +
      `<span class="ad-total" data-total="${k}">0</span></div>` +
      `<div class="ad-sets ad-sets-${k}">${cels}</div></div>`;
  }

  function htmlJogo(j, id, final) {
    const P = atual.perfil;
    const r = linhas[id];
    const n = ++contador;
    const nomeA = valor(j, r, "a"), nomeB = valor(j, r, "b");
    const extras = (r && r.extras && typeof r.extras === "object") ? r.extras : (j.extras || {});
    const parciais = (r && Array.isArray(r.parciais) && r.parciais.length) ? r.parciais : (Array.isArray(j.parciais) ? j.parciais : []);
    const pl = parsePar(valor(j, r, "placar"));
    const pen = parsePar(valor(j, r, "penaltis"));
    const cartoes = Array.isArray(r && r.cartoes) ? r.cartoes : (Array.isArray(j.cartoes) ? j.cartoes : []);

    let valsA = [], valsB = [], qtd = 0, ms = "";
    if (P.tipo === "sets") {
      parciais.forEach((p, i) => { valsA[i] = p[0]; valsB[i] = p[1]; });
      qtd = Math.min(P.max, Math.max(P.sets, parciais.length));
    } else if (P.morteSubita && extras.ms && parciais[0]) {
      valsA = [parciais[0][0]]; valsB = [parciais[0][1]]; ms = extras.ms;
    } else {
      valsA = [pl[0]]; valsB = [pl[1]];
    }
    const ft = extras.ft || {};

    defs[id] = { a: nomeA, b: nomeB, est: j.placar || "" };

    const infoTxt = [
      (j.rodada !== undefined && j.rodada !== "" ? (/^\d+$/.test(String(j.rodada)) ? `Jogo ${esc(String(j.rodada))}` : esc(j.rodada)) : ""),
      esc(valor(j, r, "data")), esc(valor(j, r, "hora")), P.local ? esc(valor(j, r, "local")) : ""
    ].filter(Boolean).join(" · ");

    const campoLocal = P.local
      ? `<label>Local<input class="ad-local" type="text" placeholder="Quadra 1" value="${esc(valor(j, r, "local"))}"></label>` : "";

    return `
      <article class="ad-jogo" data-id="${esc(id)}" data-final="${final ? 1 : 0}" data-n="${n}"
               data-a0="${esc(j.a ?? "")}" data-b0="${esc(j.b ?? "")}" data-ms="${esc(ms)}">
        <div class="ad-jogo-topo"><span class="ad-jogo-info">${infoTxt}</span><span class="ad-chip">Pendente</span></div>

        ${htmlTime("a", nomeA, final, P, qtd, valsA, pen[0], ft.a)}
        ${htmlTime("b", nomeB, final, P, qtd, valsB, pen[1], ft.b)}

        ${P.tipo === "sets" && P.max > P.sets ? `
          <div class="ad-sets-acoes">
            <button type="button" class="ad-btn ad-btn-sec ad-btn-mini" data-acao="mais-set">+ ${esc(P.unidade)}</button>
            <button type="button" class="ad-btn ad-btn-sec ad-btn-mini" data-acao="menos-set">− ${esc(P.unidade)}</button>
          </div>` : ""}

        ${P.morteSubita ? `
          <div class="ad-ms" hidden>
            <p>Empate! Morte súbita (1 minuto): quem queimou primeiro?</p>
            <div class="ad-ms-opcoes">
              <button type="button" class="ad-ms-btn" data-acao="ms" data-l="a" aria-pressed="${ms === "a"}"></button>
              <button type="button" class="ad-ms-btn" data-acao="ms" data-l="b" aria-pressed="${ms === "b"}"></button>
            </div>
          </div>` : ""}

        <p class="ad-avisos" role="status"></p>

        <details class="ad-mais">
          <summary>Mais opções</summary>
          <div class="ad-grid">
            <label class="ad-largo">Observação<input class="ad-obs" type="text" placeholder="W.O., adiado..." value="${esc(valor(j, r, "obs"))}"></label>
            <label>Data<input class="ad-data" type="text" placeholder="21/11" value="${esc(valor(j, r, "data"))}"></label>
            <label>Hora<input class="ad-hora" type="text" placeholder="08:00" value="${esc(valor(j, r, "hora"))}"></label>
            ${campoLocal}
          </div>
        </details>

        ${P.cartoes ? `
          <p class="ad-cartoes-titulo">Cartões</p>
          <datalist id="ad-atl-${n}"></datalist>
          <div class="ad-cartoes">${cartoes.map(htmlCartao).join("")}</div>
          <button type="button" class="ad-btn ad-btn-sec ad-btn-mini" data-acao="add-cartao">+ Cartão</button>` : ""}

        <div class="ad-wo" hidden>
          <span>Quem não compareceu?</span>
          <button type="button" class="ad-btn ad-btn-sec ad-btn-mini" data-acao="wo" data-l="a"></button>
          <button type="button" class="ad-btn ad-btn-sec ad-btn-mini" data-acao="wo" data-l="b"></button>
        </div>

        <div class="ad-rodape">
          <button type="button" class="ad-btn ad-salvar" data-acao="salvar">Salvar jogo</button>
          <button type="button" class="ad-btn ad-btn-sec" data-acao="wo-abrir">W.O.</button>
          <p class="ad-status" role="status"></p>
        </div>
      </article>`;
  }

  function htmlCartao(c) {
    const tipo = String(c && c.tipo || "").toLowerCase().startsWith("verm") ? "vermelho" : "amarelo";
    const lado = c && c.lado === "b" ? "b" : "a";
    return `
      <div class="ad-cartao-linha">
        <select class="ad-c-tipo" aria-label="Tipo do cartão">
          <option value="amarelo"${tipo === "amarelo" ? " selected" : ""}>🟨 Amarelo</option>
          <option value="vermelho"${tipo === "vermelho" ? " selected" : ""}>🟥 Vermelho</option>
        </select>
        <select class="ad-c-lado" data-lado-atual="${lado}" aria-label="Equipe do cartão">
          <option value="a"${lado === "a" ? " selected" : ""}>A</option>
          <option value="b"${lado === "b" ? " selected" : ""}>B</option>
        </select>
        <input class="ad-c-atleta" type="text" placeholder="Atleta" value="${esc(c && c.atleta || "")}">
        <button type="button" class="ad-x" data-acao="rem-cartao" aria-label="Remover cartão">✕</button>
      </div>`;
  }

  /* ================================================================
     LEITURA DO FORMULÁRIO + REGRAS DE CADA ESPORTE
     ================================================================ */
  const nomeDoLado = (card, k) => {
    const inp = card.querySelector(`input.ad-nm-${k}`);
    return inp ? inp.value.trim() : ((card.querySelector(`.ad-nome-${k}`) || {}).textContent || "");
  };
  const campo = (card, cls, k, i) => card.querySelector(`.${cls}[data-l="${k}"][data-i="${i}"]`);
  const numDe = el => (el && el.value.trim() !== "") ? Number(el.value) : null;
  const qtdSets = card => card.querySelectorAll(".ad-sets-a .ad-cel").length;

  // mensagem de conferência para um set (vazio = ok)
  function conferirSet(P, i, a, b) {
    const rot = `${P.unidade} ${i + 1} (${a}×${b})`;
    if (a === b) return `${rot}: empatado.`;
    if (!P.limite) return "";
    const lim = (P.decisivo && i === P.sets - 1) ? P.limiteDecisivo : P.limite;
    const mx = Math.max(a, b), mn = Math.min(a, b);
    if (mx < lim) return `${rot}: o ${P.unidade.toLowerCase()} costuma ir até ${lim} pontos.`;
    if (mx - mn < 2) return `${rot}: precisa de 2 pontos de diferença.`;
    if (mx > lim && mx - mn !== 2) return `${rot}: passou de ${lim} com diferença maior que 2.`;
    return "";
  }

  // recalcula totais, mostra/esconde campos e avisos de um jogo
  function recalc(card) {
    const P = atual.perfil;
    const final = card.dataset.final === "1";
    const avisos = [];
    let feito = false;

    if (P.tipo === "sets") {
      const n = qtdSets(card);
      let wa = 0, wb = 0, w2a = 0, w2b = 0, ft = [0, 0];
      for (let i = 0; i < n; i++) {
        const a = numDe(campo(card, "ad-s", "a", i)), b = numDe(campo(card, "ad-s", "b", i));
        if (a === null || b === null) continue;
        if (i < 2) { if (a > b) w2a++; else if (b > a) w2b++; }
      }
      // vôlei: o set decisivo só aparece com 1x1 (ou se já tiver valor)
      if (P.decisivo) {
        const i = P.sets - 1;
        const tem = ["a", "b"].some(k => (campo(card, "ad-s", k, i) || {}).value);
        const mostrar = tem || (w2a === 1 && w2b === 1);
        ["a", "b"].forEach(k => { const el = campo(card, "ad-s", k, i); if (el) el.closest(".ad-cel").hidden = !mostrar; });
      }
      for (let i = 0; i < n; i++) {
        const a = numDe(campo(card, "ad-s", "a", i)), b = numDe(campo(card, "ad-s", "b", i));
        if (a === null || b === null) continue;
        feito = true;
        if (a > b) wa++; else if (b > a) wb++;
        const m = conferirSet(P, i, a, b);
        if (m) avisos.push(m);
      }
      card.querySelector('[data-total="a"]').textContent = wa;
      card.querySelector('[data-total="b"]').textContent = wb;
      if (feito && wa === wb) avisos.push(`Partida empatada em ${wa}×${wb}: confira se falta algum ${P.unidade.toLowerCase()}.`);
      if (P.faltas) {
        ft = [numDe(campo(card, "ad-ft", "a", 0)) || 0, numDe(campo(card, "ad-ft", "b", 0)) || 0];
        if (ft[0] >= 3 && wa > wb) avisos.push(`${nomeDoLado(card, "a") || "Equipe A"} tem 3 faltas técnicas: perde a partida pelo regulamento. Confira o placar.`);
        if (ft[1] >= 3 && wb > wa) avisos.push(`${nomeDoLado(card, "b") || "Equipe B"} tem 3 faltas técnicas: perde a partida pelo regulamento. Confira o placar.`);
      }
      const bMais = card.querySelector('[data-acao="mais-set"]'), bMenos = card.querySelector('[data-acao="menos-set"]');
      if (bMais) bMais.disabled = n >= P.max;
      if (bMenos) bMenos.disabled = n <= P.sets;
    } else {
      const a = numDe(campo(card, "ad-s", "a", 0)), b = numDe(campo(card, "ad-s", "b", 0));
      feito = a !== null && b !== null;
      const empate = feito && a === b;

      if (P.penaltis && final) {
        const pens = card.querySelectorAll(".ad-pen");
        const jaTem = [...pens].some(p => p.value !== "");
        pens.forEach(p => { p.closest(".ad-cel").hidden = !(empate || jaTem); });
        if (empate && ![...pens].every(p => p.value !== "")) avisos.push("Empate no mata-mata: informe os pênaltis.");
      }
      if (P.morteSubita) {
        const box = card.querySelector(".ad-ms");
        box.hidden = !empate;
        if (!empate) card.dataset.ms = "";
        box.querySelectorAll(".ad-ms-btn").forEach(btn => btn.setAttribute("aria-pressed", String(card.dataset.ms === btn.dataset.l)));
        if (empate && !card.dataset.ms) avisos.push("Empate: escolha quem fez a morte súbita.");
      }
      if (empate && !final && !P.morteSubita && !P.penaltis) avisos.push("Placar empatado.");
    }

    const av = card.querySelector(".ad-avisos");
    av.innerHTML = avisos.map(esc).join("<br>");
    av.classList.toggle("on", avisos.length > 0);

    const chip = card.querySelector(".ad-chip");
    chip.textContent = feito ? "Com placar" : "Pendente";
    chip.classList.toggle("ok", feito);
  }

  // junta tudo o que será gravado (ou devolve { erro })
  function coletar(card) {
    const P = atual.perfil;
    const final = card.dataset.final === "1";
    const out = { placar: "", penaltis: "", parciais: [], extras: {} };
    const inteiro = v => /^\d+$/.test(String(v));

    if (P.tipo === "sets") {
      const n = qtdSets(card);
      let wa = 0, wb = 0;
      for (let i = 0; i < n; i++) {
        const va = campo(card, "ad-s", "a", i).value.trim(), vb = campo(card, "ad-s", "b", i).value.trim();
        if (va === "" && vb === "") continue;
        if (va === "" || vb === "") return { erro: `${P.unidade} ${i + 1}: preencha os dois lados (ou deixe os dois vazios).` };
        if (!inteiro(va) || !inteiro(vb)) return { erro: `${P.unidade} ${i + 1}: use apenas números inteiros.` };
        const a = Number(va), b = Number(vb);
        out.parciais.push([a, b]);
        if (a > b) wa++; else if (b > a) wb++;
      }
      if (out.parciais.length) out.placar = `${wa}x${wb}`;
      if (P.faltas) {
        const fa = numDe(campo(card, "ad-ft", "a", 0)) || 0, fb = numDe(campo(card, "ad-ft", "b", 0)) || 0;
        if (fa < 0 || fb < 0) return { erro: "Faltas técnicas: use números positivos." };
        if (fa || fb) out.extras.ft = { a: fa, b: fb };
      }
    } else {
      const va = campo(card, "ad-s", "a", 0).value.trim(), vb = campo(card, "ad-s", "b", 0).value.trim();
      if (va !== "" || vb !== "") {
        if (va === "" || vb === "") return { erro: `${P.unidade}: preencha os dois lados (ou deixe os dois vazios).` };
        if (!inteiro(va) || !inteiro(vb)) return { erro: `${P.unidade}: use apenas números inteiros.` };
        let a = Number(va), b = Number(vb);
        if (P.morteSubita && a === b && card.dataset.ms) {
          out.parciais = [[a, b]];                 // tempo normal
          out.extras.ms = card.dataset.ms;
          if (card.dataset.ms === "a") a += 1; else b += 1;   // o ponto da morte súbita
        }
        out.placar = `${a}x${b}`;

        if (P.penaltis && final && Number(va) === Number(vb)) {
          const pa = campo(card, "ad-pen", "a", 0).value.trim(), pb = campo(card, "ad-pen", "b", 0).value.trim();
          if (pa !== "" || pb !== "") {
            if (pa === "" || pb === "") return { erro: "Pênaltis: preencha os dois lados (ou deixe os dois vazios)." };
            if (!inteiro(pa) || !inteiro(pb)) return { erro: "Pênaltis: use apenas números inteiros." };
            out.penaltis = `${Number(pa)}x${Number(pb)}`;
          }
        }
      }
    }
    return out;
  }

  /* ================================================================
     NOMES, PROGRESSO E RESUMO
     ================================================================ */
  function atualizarNomes(card) {
    const a = nomeDoLado(card, "a"), b = nomeDoLado(card, "b");
    card.querySelectorAll(".ad-c-lado").forEach(sel => {
      sel.options[0].textContent = a || "Equipe A";
      sel.options[1].textContent = b || "Equipe B";
    });
    const dl = card.querySelector(`#ad-atl-${card.dataset.n}`);
    if (dl) dl.innerHTML = [...atletasDe(a), ...atletasDe(b)].map(x => `<option value="${esc(x)}">`).join("");
    card.querySelectorAll(".ad-c-atleta").forEach(i => i.setAttribute("list", `ad-atl-${card.dataset.n}`));
    card.querySelectorAll(".ad-ms-btn, .ad-wo [data-l]").forEach(btn => { btn.textContent = btn.dataset.l === "a" ? (a || "Equipe A") : (b || "Equipe B"); });
  }

  function atualizarProgresso() {
    const ids = Object.keys(defs);
    const feitos = ids.filter(id => {
      const l = linhas[id];
      return (l && String(l.placar || "").trim() !== "") || (!l && String(defs[id].est || "").trim() !== "");
    }).length;
    $("[data-ad-progresso]").textContent = `${feitos} de ${ids.length} ${ids.length === 1 ? "jogo" : "jogos"} com placar`;
    $("[data-ad-barra]").style.width = ids.length ? `${Math.round(100 * feitos / ids.length)}%` : "0";
  }

  // futsal: quadro de cartões da categoria (aviso de suspensão)
  function atualizarResumo() {
    const alvo = $("[data-ad-resumo]");
    if (!atual || !atual.perfil.cartoes) { alvo.innerHTML = ""; return; }
    const mapa = {};
    Object.keys(linhas).forEach(id => {
      (Array.isArray(linhas[id].cartoes) ? linhas[id].cartoes : []).forEach(c => {
        if (!c || !c.atleta) return;
        const d = defs[id] || {};
        const equipe = c.lado === "b" ? d.b : d.a;
        const k = norm(c.atleta) + "|" + norm(equipe);
        const m = mapa[k] = mapa[k] || { atleta: c.atleta, equipe: equipe || "", am: 0, vm: 0 };
        if (String(c.tipo || "").toLowerCase().startsWith("verm")) m.vm++; else m.am++;
      });
    });
    const lista = Object.values(mapa).sort((x, y) => (y.vm - x.vm) || (y.am - x.am) || x.atleta.localeCompare(y.atleta));
    if (!lista.length) { alvo.innerHTML = ""; return; }
    alvo.innerHTML = `<details class="ad-resumo-box ad-resumo"><summary>Cartões da categoria (${lista.length})</summary>
      <ul class="ad-resumo-lista">${lista.map(m => {
        const alerta = m.vm >= 1 ? "🟥 suspensão" : (m.am >= 2 ? "⚠ 2 amarelos" : "");
        return `<li><span>${esc(m.atleta)} <small>${esc(m.equipe)}</small></span>
                <span>${"🟨".repeat(m.am)}${"🟥".repeat(m.vm)} ${alerta ? `<span class="ad-resumo-alerta">${alerta}</span>` : ""}</span></li>`;
      }).join("")}</ul>
      <p style="font-size:.74rem;margin:8px 0 0">Regulamento: 2 amarelos acumulados ou 1 vermelho = suspensão. Confira com a coordenação.</p>
    </details>`;
  }

  /* ================================================================
     EVENTOS
     ================================================================ */
  function fecharMenu() {
    const m = $("[data-ad-menu]");
    if (m) m.hidden = true;
    const b = $('[data-acao="menu-conta"]');
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function aoDigitar(e) {
    const card = e.target.closest && e.target.closest(".ad-jogo");
    if (!card) return;
    if (e.target.matches("input.ad-nm")) { atualizarNomes(card); }
    if (e.target.matches(".ad-c-lado")) {
      const linha = e.target.closest(".ad-cartao-linha");
      const inp = linha.querySelector(".ad-c-atleta");
      const antes = atletasDe(nomeDoLado(card, e.target.dataset.ladoAtual || "a"));
      const novo = atletasDe(nomeDoLado(card, e.target.value));
      if ((!inp.value || (antes.length === 1 && inp.value === antes[0])) && novo.length === 1) inp.value = novo[0];
      e.target.dataset.ladoAtual = e.target.value;
    }
    if (e.target.matches(".ad-s, .ad-pen, .ad-ft, input.ad-nm")) recalc(card);
  }

  function aoClicar(e) {
    const bt = e.target.closest && e.target.closest("[data-acao]");
    if (!bt) {
      if (!(e.target.closest && e.target.closest(".ad-conta"))) fecharMenu();
      return;
    }
    const acao = bt.dataset.acao;
    const card = bt.closest(".ad-jogo");
    if (acao !== "menu-conta") { if (!bt.closest(".ad-conta")) fecharMenu(); }

    if (acao === "menu-conta") {
      const m = $("[data-ad-menu]");
      m.hidden = !m.hidden;
      bt.setAttribute("aria-expanded", String(!m.hidden));
    }
    else if (acao === "sair") { fecharMenu(); client.auth.signOut(); }
    else if (acao === "aba") { abrirModalidade(bt.dataset.slug); }
    else if (acao === "recarregar") { if (atual) abrirCategoria(String(cats.indexOf(atual))); }
    else if (acao === "ajuda") { const p = $("[data-ad-ajuda]"); p.hidden = !p.hidden; }
    else if (acao === "mais-set" && card) { mudarSets(card, +1); }
    else if (acao === "menos-set" && card) { mudarSets(card, -1); }
    else if (acao === "ms" && card) { card.dataset.ms = (card.dataset.ms === bt.dataset.l) ? "" : bt.dataset.l; recalc(card); }
    else if (acao === "add-cartao" && card) {
      const unico = atletasDe(nomeDoLado(card, "a"));
      card.querySelector(".ad-cartoes").insertAdjacentHTML("beforeend",
        htmlCartao({ tipo: "amarelo", lado: "a", atleta: unico.length === 1 ? unico[0] : "" }));
      atualizarNomes(card);
    }
    else if (acao === "rem-cartao") { bt.closest(".ad-cartao-linha").remove(); }
    else if (acao === "wo-abrir" && card) { const w = card.querySelector(".ad-wo"); w.hidden = !w.hidden; }
    else if (acao === "wo" && card) {
      const nome = nomeDoLado(card, bt.dataset.l) || ("Equipe " + bt.dataset.l.toUpperCase());
      card.querySelector(".ad-obs").value = `W.O. — ${nome} não compareceu`;
      card.querySelector(".ad-mais").open = true;
      card.querySelector(".ad-wo").hidden = true;
      status(card, "Observação de W.O. preenchida. Digite o placar que a organização definir e salve.", "");
      const prim = card.querySelector(".ad-s"); if (prim) prim.focus();
    }
    else if (acao === "salvar" && card) { salvar(card, bt); }
  }

  function mudarSets(card, delta) {
    const P = atual.perfil;
    const n = qtdSets(card);
    const novo = n + delta;
    if (novo < P.sets || novo > P.max) return;
    ["a", "b"].forEach(k => {
      const caixa = card.querySelector(`.ad-sets-${k}`);
      if (delta > 0) {
        caixa.insertAdjacentHTML("beforeend", celula("ad-s", `${P.unidade} ${n + 1}`, k, n, ""));
      } else {
        const ult = caixa.lastElementChild;
        if (ult) ult.remove();
      }
    });
    recalc(card);
  }

  /* ================================================================
     SALVAR
     ================================================================ */
  function status(card, msg, tipo) {
    const el = card.querySelector(".ad-status");
    el.textContent = msg; el.className = "ad-status" + (tipo ? " " + tipo : "");
  }

  async function salvar(card, bt) {
    const P = atual.perfil;
    const id = card.dataset.id;
    const final = card.dataset.final === "1";

    const c = coletar(card);
    if (c.erro) return status(card, c.erro, "erro");

    const a = nomeDoLado(card, "a"), b = nomeDoLado(card, "b");
    const vazio = v => (v && String(v).trim() !== "") ? String(v).trim() : null;
    const cartoes = P.cartoes ? [...card.querySelectorAll(".ad-cartao-linha")].map(l => ({
      lado: l.querySelector(".ad-c-lado").value,
      atleta: l.querySelector(".ad-c-atleta").value.trim(),
      tipo: l.querySelector(".ad-c-tipo").value
    })).filter(x => x.atleta) : [];

    const antes = linhas[id] || {};
    const row = {
      id,
      placar: c.placar,
      penaltis: c.penaltis,
      obs: card.querySelector(".ad-obs").value.trim(),
      // só grava a/b se o confronto foi trocado em relação ao tabelas-data.js
      a: final && a && a !== card.dataset.a0 ? a : null,
      b: final && b && b !== card.dataset.b0 ? b : null,
      data: vazio(card.querySelector(".ad-data").value),
      hora: vazio(card.querySelector(".ad-hora").value),
      local: P.local ? vazio((card.querySelector(".ad-local") || {}).value) : null,
      cartoes,
      atualizado_em: new Date().toISOString()
    };
    // colunas novas (supabase/parciais.sql): só vão junto quando há conteúdo
    // (ou quando é preciso limpar algo que já estava gravado)
    if (c.parciais.length || (Array.isArray(antes.parciais) && antes.parciais.length)) row.parciais = c.parciais;
    if (Object.keys(c.extras).length || (antes.extras && Object.keys(antes.extras).length)) row.extras = c.extras;

    bt.disabled = true; status(card, "Salvando...");
    const { error } = await client.from(TABELA).upsert(row, { onConflict: "id" });
    bt.disabled = false;
    if (error) {
      const msg = error.message || "";
      if (/parciais|extras|schema cache|column/i.test(msg))
        return status(card, "Falta rodar o SQL das colunas novas (supabase/parciais.sql) no Supabase.", "erro");
      const semPermissao = /row-level security|permission|JWT/i.test(msg);
      return status(card, semPermissao ? "Sem permissão para salvar este jogo. Entre novamente ou confira suas permissões." : "Erro ao salvar: " + msg, "erro");
    }
    linhas[id] = { ...antes, ...row };
    defs[id] = { ...(defs[id] || {}), a: valor({ a: card.dataset.a0 }, row, "a"), b: valor({ b: card.dataset.b0 }, row, "b") };
    const d = new Date();
    status(card, `Salvo ✓ ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`, "ok");
    atualizarProgresso();
    atualizarResumo();
  }

})();
