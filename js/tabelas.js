/* ==================================================================
   tabelas.js
   ------------------------------------------------------------------
   Monta a página html/tabelas.html a partir de:
     - js/tabelas-data.js   (as tabelas — arquivo que o organizador edita)
     - js/equipes-data.js   (equipes inscritas)
     - js/data.js           (nomes das modalidades)

   Não é preciso mexer neste arquivo para atualizar tabelas.

   RESULTADOS AO VIVO (Supabase)
   Placares, pênaltis, cartões, horários e confrontos de mata-mata
   lançados em html/admin.html ficam no Supabase. Aqui eles são lidos
   (ver js/supabase-config.js) e SOBREPOSTOS aos jogos de
   js/tabelas-data.js. Se o Supabase não estiver configurado ou estiver
   fora do ar, o site continua funcionando só com o tabelas-data.js.

   URL:  tabelas.html?modalidade=futsal&categoria=adulto-masculino
         tabelas.html?conferir=1      -> tela de conferência (nomes válidos
                                         e avisos de erro de digitação)
   ================================================================== */
(function () {
  "use strict";

  const GENERO = { masculino: "Masculino", feminino: "Feminino", misto: "Misto" };
  const JOGO = { "tenis-de-mesa": "Tênis de Mesa", pebolim: "Pebolim" };

  const DEFAULT_CFG = {
    empate: false,
    pontos: { vitoria: 3, empate: 1, derrota: 0 },
    desempate: ["pontos", "vitorias", "saldo", "pro"],
    placar: { pro: "Pró", contra: "Contra", saldo: "Saldo", legenda: "" }
  };

  document.addEventListener("DOMContentLoaded", init);

  /* ---------------- utilitários ---------------- */
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  // Normaliza nomes para comparar: sem acento, minúsculo, "— Time 2" => " 2"
  const norm = s => String(s ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s*[—–-]\s*time\s*(\d+)/g, " $1")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();

  const idDe = t => [t.jogo, t.faixa, t.genero].filter(Boolean).join("-");
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  function cfgDe(slug) {
    const c = (typeof JJC_TABELAS_CONFIG !== "undefined" && JJC_TABELAS_CONFIG[slug]) || {};
    return {
      ...DEFAULT_CFG, ...c,
      pontos: { ...DEFAULT_CFG.pontos, ...(c.pontos || {}) },
      placar: { ...DEFAULT_CFG.placar, ...(c.placar || {}) },
      desempate: Array.isArray(c.desempate) && c.desempate.length ? c.desempate : DEFAULT_CFG.desempate
    };
  }

  function parsePlacar(p) {
    if (Array.isArray(p) && p.length === 2 &&
        p.every(n => n !== null && n !== "" && Number.isFinite(Number(n)))) {
      return { a: Number(p[0]), b: Number(p[1]) };
    }
    if (typeof p === "string") {
      const m = p.match(/^\s*(\d+)\s*[x×X\-–:]\s*(\d+)\s*$/);
      if (m) return { a: Number(m[1]), b: Number(m[2]) };
    }
    return null;
  }
  const placarPreenchido = p => !(p === undefined || p === null || p === "" || (Array.isArray(p) && !p.length));

  /* ---------------- resultados vindos do Supabase ---------------- */
  // id do jogo -> linha da tabela jogos_resultados (preenchido por carregarResultados)
  let RESULTADOS = {};
  let ULTIMA_ATUALIZACAO = null;
  const INTERVALO_ATUALIZACAO = 30000; // 30 s

  const supabaseConfigurado = () =>
    typeof JJC_SUPABASE !== "undefined" && JJC_SUPABASE && JJC_SUPABASE.url && JJC_SUPABASE.anonKey;

  async function carregarResultados() {
    if (!supabaseConfigurado()) return false;
    try {
      const base = String(JJC_SUPABASE.url).replace(/\/+$/, "");
      const tabela = JJC_SUPABASE.tabela || "jogos_resultados";
      const r = await fetch(`${base}/rest/v1/${tabela}?select=*`, {
        headers: { apikey: JJC_SUPABASE.anonKey },
        cache: "no-store"
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const linhas = await r.json();
      const novo = {};
      let ultima = null;
      linhas.forEach(l => {
        novo[l.id] = l;
        if (l.atualizado_em && (!ultima || l.atualizado_em > ultima)) ultima = l.atualizado_em;
      });
      const mudou = JSON.stringify(novo) !== JSON.stringify(RESULTADOS);
      RESULTADOS = novo;
      ULTIMA_ATUALIZACAO = ultima;
      return mudou;
    } catch (e) {
      console.warn("[Tabelas] Não foi possível ler os resultados do Supabase:", e);
      return false;
    }
  }

  // Aplica a linha do banco sobre um jogo do tabelas-data.js.
  // Texto vazio no banco = "não alterar" (vale o que está no tabelas-data.js).
  function mesclarJogo(j, id) {
    const r = RESULTADOS[id];
    if (!j || !r) return j ? { ...j, id } : j;
    const out = { ...j, id };
    ["placar", "penaltis", "obs", "a", "b", "data", "hora", "local"].forEach(k => {
      if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "") out[k] = r[k];
    });
    if (Array.isArray(r.cartoes) && r.cartoes.length) out.cartoes = r.cartoes;
    if (Array.isArray(r.parciais) && r.parciais.length) out.parciais = r.parciais;
    if (r.extras && typeof r.extras === "object" && Object.keys(r.extras).length) out.extras = r.extras;
    return out;
  }

  function mesclarTabela(slug, catId, t) {
    if (!t) return t;
    return {
      ...t,
      chaves: (t.chaves || []).map((c, ci) => ({
        ...c,
        jogos: (c.jogos || []).map((j, ji) => mesclarJogo(j, `${slug}/${catId}/c${ci}/j${ji}`))
      })),
      fasesFinais: (t.fasesFinais || []).map((f, fi) => ({
        ...f,
        jogos: (f.jogos || []).map((j, ji) => mesclarJogo(j, `${slug}/${catId}/f${fi}/j${ji}`))
      }))
    };
  }

  function textoAtualizacao(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const p = n => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} às ${p(d.getHours())}h${p(d.getMinutes())}`;
  }

  /* ---------------- participantes inscritos ---------------- */
  // Lista {nome, sub} de quem está inscrito na categoria
  function participantes(slug, cat) {
    if (typeof JJC_EQUIPES === "undefined") return [];
    const regs = JJC_EQUIPES
      .filter(e => e.modalidade === slug && e.faixa === cat.faixa && e.genero === cat.genero &&
                   (e.jogo || null) === (cat.jogo || null))
      .sort((a, b) => a.comunidade.localeCompare(b.comunidade, "pt-BR") || (a.numero || 0) - (b.numero || 0));
    const out = [];
    // quantos times cada comunidade tem nesta categoria (só numera quando há mais de um)
    const porComunidade = {};
    regs.forEach(e => { porComunidade[e.comunidade] = (porComunidade[e.comunidade] || 0) + 1; });
    regs.forEach(e => {
      if (e.jogo === "tenis-de-mesa") e.atletas.forEach(a => out.push({ nome: a, sub: e.comunidade }));
      else if (e.jogo === "pebolim") out.push({ nome: e.atletas.join(" / "), sub: e.comunidade });
      else {
        const numerar = porComunidade[e.comunidade] > 1 && e.numero;
        out.push({ nome: numerar ? `${e.comunidade} ${e.numero}` : e.comunidade, sub: e.setor, unico: !numerar });
      }
    });
    return out;
  }

  function mapaRegistrados(part) {
    const m = new Map();
    part.forEach(p => m.set(norm(p.nome), p.nome));
    // equipe única também pode ser digitada como "Comunidade 1"
    part.forEach(p => { if (p.unico && !m.has(norm(p.nome + " 1"))) m.set(norm(p.nome + " 1"), p.nome); });
    return m;
  }

  /* ---------------- categorias de uma modalidade ---------------- */
  function categoriasDa(slug) {
    const faixas = (typeof JJC_FAIXAS !== "undefined" && JJC_FAIXAS[slug]) ? JJC_FAIXAS[slug].faixas : [];
    const tabs = (typeof JJC_TABELAS !== "undefined" && JJC_TABELAS[slug]) || [];
    const cats = [];

    faixas.forEach(f => f.grupos.forEach(g => {
      const cat = { faixa: f.id, faixaNome: f.nome, idade: f.idade, genero: g.genero, jogo: g.jogo || null, obs: g.obs || null };
      cat.id = idDe(cat);
      cats.push(cat);
    }));
    // categorias cadastradas em tabelas-data.js que não existem em JJC_FAIXAS
    tabs.forEach(t => {
      const id = idDe(t);
      if (id && !cats.some(c => c.id === id)) {
        cats.push({ id, faixa: t.faixa, faixaNome: cap(t.faixa), idade: "", genero: t.genero, jogo: t.jogo || null, obs: null, extra: true });
      }
    });

    cats.forEach(c => {
      c.tabela = mesclarTabela(slug, c.id, tabs.find(t => idDe(t) === c.id) || null);
      c.part = participantes(slug, c);
    });
    return cats.filter(c => c.part.length || c.tabela);
  }

  function rotulo(cat) {
    const partes = [];
    if (cat.jogo) partes.push(JOGO[cat.jogo] || cat.jogo);
    partes.push(cat.faixaNome);
    partes.push(GENERO[cat.genero] || cat.genero);
    return partes.join(" · ");
  }

  /* ---------------- classificação ---------------- */
  function classificar(chave, cfg, registrados) {
    const mapa = new Map();
    const resolve = n => registrados.get(norm(n)) || String(n).trim();
    const linha = n => {
      const nome = resolve(n);
      const k = norm(nome);
      if (!mapa.has(k)) mapa.set(k, { nome, J: 0, V: 0, E: 0, D: 0, pro: 0, contra: 0, saldo: 0, pts: 0 });
      return mapa.get(k);
    };
    const pt = cfg.pontos;

    (chave.equipes || []).forEach(n => { if (n) linha(n); });
    (chave.jogos || []).forEach(j => {
      if (!j || !j.a || !j.b) return;
      const A = linha(j.a), B = linha(j.b);
      const p = parsePlacar(j.placar);
      if (!p) return;
      A.J++; B.J++;
      A.pro += p.a; A.contra += p.b;
      B.pro += p.b; B.contra += p.a;
      if (p.a > p.b) { A.V++; B.D++; A.pts += pt.vitoria; B.pts += pt.derrota; }
      else if (p.a < p.b) { B.V++; A.D++; B.pts += pt.vitoria; A.pts += pt.derrota; }
      else { A.E++; B.E++; A.pts += pt.empate; B.pts += pt.empate; }
    });

    const rows = [...mapa.values()];
    rows.forEach(r => { r.saldo = r.pro - r.contra; });

    const crit = {
      pontos: (x, y) => y.pts - x.pts,
      vitorias: (x, y) => y.V - x.V,
      saldo: (x, y) => y.saldo - x.saldo,
      pro: (x, y) => y.pro - x.pro,
      contra: (x, y) => x.contra - y.contra
    };
    const ordem = (chave.ordem || []).map(n => norm(resolve(n)));
    const porCriterios = (x, y) => {
      for (const c of cfg.desempate) {
        const f = crit[c];
        if (f) { const d = f(x, y); if (d) return d; }
      }
      return 0;
    };

    rows.sort((x, y) => {
      const d = porCriterios(x, y);
      if (d) return d;
      const ix = ordem.indexOf(norm(x.nome)), iy = ordem.indexOf(norm(y.nome));
      if (ix >= 0 && iy >= 0) return ix - iy;
      return x.nome.localeCompare(y.nome, "pt-BR");
    });

    // empates totais sem desempate manual (só importa depois que há jogos)
    const empatesSemOrdem = [];
    for (let i = 0; i < rows.length - 1; i++) {
      // só avisa quando as duas equipes já jogaram (antes disso todos empatam em zero)
      if (rows[i].J > 0 && rows[i + 1].J > 0 && porCriterios(rows[i], rows[i + 1]) === 0) {
        const ix = ordem.indexOf(norm(rows[i].nome)), iy = ordem.indexOf(norm(rows[i + 1].nome));
        if (!(ix >= 0 && iy >= 0)) empatesSemOrdem.push([rows[i].nome, rows[i + 1].nome]);
      }
    }
    return { rows, empatesSemOrdem };
  }

  /* ---------------- HTML: peças ---------------- */
  function htmlClassificacao(chave, cfg, registrados) {
    const { rows } = classificar(chave, cfg, registrados);
    if (!rows.length) return "";
    const pl = cfg.placar;
    const n = Number(chave.classificam) || 0;
    const mostraE = !!cfg.empate;
    const sinal = v => (v > 0 ? "+" + v : String(v));

    return `
      <div class="tb-scroll">
        <table class="tb-tabela">
          <thead>
            <tr>
              <th class="tb-pos" scope="col">#</th>
              <th class="tb-nome" scope="col">Equipe</th>
              <th scope="col" title="Pontos">Pts</th>
              <th scope="col" title="Jogos">J</th>
              <th scope="col" title="Vitórias">V</th>
              ${mostraE ? '<th scope="col" title="Empates">E</th>' : ""}
              <th scope="col" title="Derrotas">D</th>
              <th scope="col">${esc(pl.pro)}</th>
              <th scope="col">${esc(pl.contra)}</th>
              <th scope="col">${esc(pl.saldo)}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr class="${n && i < n ? "tb-classificado" : ""}">
                <td class="tb-pos">${i + 1}</td>
                <td class="tb-nome">${esc(r.nome)}</td>
                <td class="tb-pts">${r.pts}</td>
                <td>${r.J}</td>
                <td>${r.V}</td>
                ${mostraE ? `<td>${r.E}</td>` : ""}
                <td>${r.D}</td>
                <td>${r.pro}</td>
                <td>${r.contra}</td>
                <td>${sinal(r.saldo)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="tb-legenda">
        ${n ? `<span class="tb-legenda-dest">Em destaque: classificam para a próxima fase.</span> ` : ""}
        ${esc(pl.legenda || "")}
      </p>`;
  }

  function htmlJogos(jogos, registrados) {
    const lista = (jogos || []).filter(j => j && (j.a || j.b));
    if (!lista.length) return "";
    const nome = n => registrados.get(norm(n)) || String(n ?? "").trim();
    let rodadaAtual = null;

    return `<ul class="tb-jogos">` + lista.map(j => {
      const p = parsePlacar(j.placar);
      const pen = parsePlacar(j.penaltis);
      let venceA = false, venceB = false;
      if (p) {
        if (p.a > p.b) venceA = true; else if (p.b > p.a) venceB = true;
        else if (pen) { if (pen.a > pen.b) venceA = true; else if (pen.b > pen.a) venceB = true; }
      }
      const info = [j.data, j.hora, j.local].filter(Boolean).map(esc).join(" · ");
      const obs = [pen ? `Pênaltis: ${pen.a} × ${pen.b}` : "", j.obs || ""].filter(Boolean).map(esc).join(" · ");
      const cartoes = (Array.isArray(j.cartoes) ? j.cartoes : []).filter(c => c && c.atleta).map(c => {
        const vermelho = String(c.tipo || "").toLowerCase().startsWith("verm");
        const equipe = c.lado === "b" ? nome(j.b) : c.lado === "a" ? nome(j.a) : "";
        return `<li class="tb-cartao ${vermelho ? "tb-cartao-vermelho" : "tb-cartao-amarelo"}">
                  <span class="tb-cartao-icone" aria-label="Cartão ${vermelho ? "vermelho" : "amarelo"}"></span>
                  ${esc(c.atleta)}${equipe && equipe !== c.atleta ? ` <small>(${esc(equipe)})</small>` : ""}
                </li>`;
      }).join("");

      // parciais (sets/jogos), morte súbita e faltas técnicas — lançados no painel
      const parc = (Array.isArray(j.parciais) ? j.parciais : []).filter(x => Array.isArray(x) && x.length === 2 && x[0] !== "" && x[1] !== "");
      const ex = (j.extras && typeof j.extras === "object") ? j.extras : {};
      const extra = [];
      if (ex.ms && parc[0]) extra.push(`Tempo normal ${parc[0][0]}×${parc[0][1]} · Morte súbita: ${esc(nome(ex.ms === "b" ? j.b : j.a))}`);
      else if (parc.length) extra.push(parc.map(x => `${x[0]}×${x[1]}`).join(" · "));
      if (ex.ft && (Number(ex.ft.a) || Number(ex.ft.b))) extra.push(`Faltas técnicas: ${Number(ex.ft.a) || 0} × ${Number(ex.ft.b) || 0}`);

      let cab = "";
      if (placarPreenchido(j.rodada) && j.rodada !== rodadaAtual) {
        rodadaAtual = j.rodada;
        const r = String(j.rodada);
        cab = `<li class="tb-rodada">${/^\d+$/.test(r) ? "Rodada " + esc(r) : esc(r)}</li>`;
      }

      return cab + `
        <li class="tb-jogo${p ? " tb-jogo-feito" : ""}">
          ${info ? `<div class="tb-jogo-info">${info}</div>` : ""}
          <div class="tb-confronto">
            <span class="tb-eq tb-eq-a${venceA ? " tb-venc" : ""}">${esc(nome(j.a))}</span>
            <span class="tb-placar">${p ? `<b>${p.a}</b><i>×</i><b>${p.b}</b>` : "<i>×</i>"}</span>
            <span class="tb-eq tb-eq-b${venceB ? " tb-venc" : ""}">${esc(nome(j.b))}</span>
          </div>
          ${extra.length ? `<div class="tb-parciais">${extra.join("<br>")}</div>` : ""}
          ${obs ? `<div class="tb-obs">${obs}</div>` : ""}
          ${cartoes ? `<ul class="tb-cartoes" aria-label="Cartões">${cartoes}</ul>` : ""}
        </li>`;
    }).join("") + `</ul>`;
  }

  function htmlPodio(podio) {
    if (!podio) return "";
    const itens = [["🥇", "1º lugar", podio.primeiro], ["🥈", "2º lugar", podio.segundo], ["🥉", "3º lugar", podio.terceiro]]
      .filter(i => i[2]);
    if (!itens.length) return "";
    return `
      <div class="tb-podio">
        ${itens.map(i => `
          <div class="tb-podio-item">
            <span class="tb-podio-medalha" aria-hidden="true">${i[0]}</span>
            <span class="tb-podio-lugar">${i[1]}</span>
            <strong>${esc(i[2])}</strong>
          </div>`).join("")}
      </div>`;
  }

  function htmlCategoria(slug, cat, cfg) {
    const t = cat.tabela;
    const unidade = slug === "mesa" && cat.jogo === "tenis-de-mesa" ? "atleta" : (slug === "mesa" ? "dupla" : "equipe");
    const nIns = cat.part.length;
    const insc = `${nIns} ${unidade}${nIns === 1 ? "" : "s"} inscrit${unidade === "equipe" || unidade === "dupla" ? "a" : "o"}${nIns === 1 ? "" : "s"}`;
    const registrados = mapaRegistrados(cat.part);
    const titulo = rotulo(cat);

    // Sem tabela ainda
    const chaves = t && Array.isArray(t.chaves) ? t.chaves.filter(c => c && ((c.equipes && c.equipes.length) || (c.jogos && c.jogos.length))) : [];
    const finais = t && Array.isArray(t.fasesFinais) ? t.fasesFinais.filter(f => f && f.jogos && f.jogos.length) : [];

    if (!chaves.length && !finais.length) {
      return `
        <section class="cc-section tb-secao">
          <div class="cc-wrap">
            <p class="cc-eyebrow">${esc(cat.faixaNome)}${cat.idade ? " · " + esc(cat.idade) : ""}</p>
            <h2>${esc(titulo)}</h2>
            <p class="jjc-grupo-meta"><span class="jjc-grupo-pill">${insc}</span>${cat.obs ? `<span>${esc(cat.obs)}</span>` : ""}</p>
            <div class="tb-embreve">
              <strong>Tabela em breve</strong>
              <p>A tabela de jogos desta categoria ainda não foi divulgada. Assim que a organização definir as chaves e os horários, ela aparecerá aqui.</p>
            </div>
            ${cat.part.length ? `
              <h3 class="tb-sub">${unidade === "atleta" ? "Atletas" : unidade === "dupla" ? "Duplas" : "Equipes"} inscritos</h3>
              <ul class="tb-inscritos">
                ${cat.part.map(p => `<li>${esc(p.nome)}<small>${esc(p.sub)}</small></li>`).join("")}
              </ul>` : ""}
          </div>
        </section>`;
    }

    const formato = chaves.length > 1 ? `Fase de grupos · ${chaves.length} chaves`
                  : chaves.length === 1 ? "Chave única · pontos corridos" : "Mata-mata";

    const blocosChaves = chaves.map((c, i) => `
      <article class="tb-chave">
        <h3 class="tb-chave-titulo">${esc(c.nome || (chaves.length > 1 ? `Chave ${String.fromCharCode(65 + i)}` : "Classificação"))}</h3>
        ${htmlClassificacao(c, cfg, registrados)}
        ${(c.jogos && c.jogos.length) ? `<h4 class="tb-sub">Jogos</h4>${htmlJogos(c.jogos, registrados)}` : ""}
      </article>`).join("");

    const blocosFinais = finais.length ? `
      <div class="tb-finais">
        <h3 class="tb-fase-titulo">Fase final</h3>
        ${finais.map(f => `
          <article class="tb-fase">
            <h4 class="tb-sub">${esc(f.fase || "Jogos")}</h4>
            ${htmlJogos(f.jogos, registrados)}
          </article>`).join("")}
      </div>` : "";

    return `
      <section class="cc-section tb-secao">
        <div class="cc-wrap">
          <p class="cc-eyebrow">${esc(cat.faixaNome)}${cat.idade ? " · " + esc(cat.idade) : ""}</p>
          <h2>${esc(titulo)}</h2>
          <p class="jjc-grupo-meta">
            <span class="jjc-grupo-pill">${esc(formato)}</span>
            <span class="jjc-grupo-pill">${insc}</span>
            ${cat.obs ? `<span>${esc(cat.obs)}</span>` : ""}
          </p>
          ${t && t.observacao ? `<p class="cc-note">${esc(t.observacao)}</p>` : ""}
          ${htmlPodio(t && t.podio)}
          <div class="tb-chaves${chaves.length > 1 ? " tb-chaves-multi" : ""}">${blocosChaves}</div>
          ${blocosFinais}
        </div>
      </section>`;
  }

  /* ---------------- conferência (?conferir=1) ---------------- */
  function validar() {
    const avisos = [];
    if (typeof JJC_TABELAS === "undefined") return ["JJC_TABELAS não foi encontrado em js/tabelas-data.js."];

    Object.keys(JJC_TABELAS).forEach(slug => {
      const modNome = (typeof JJC_DATA !== "undefined" && JJC_DATA[slug]) ? JJC_DATA[slug].nome : slug;
      if (typeof JJC_DATA !== "undefined" && !JJC_DATA[slug]) {
        avisos.push(`Modalidade "${slug}" não existe. Use: futsal, volei, queimada ou mesa.`);
        return;
      }
      const cats = categoriasDa(slug);
      const cfg = cfgDe(slug);

      (JJC_TABELAS[slug] || []).forEach((t, idx) => {
        const id = idDe(t);
        const onde = `${modNome} › ${id || "entrada " + (idx + 1)}`;
        if (!t.faixa || !t.genero) { avisos.push(`${onde}: faltam os campos "faixa" e/ou "genero".`); return; }
        if (slug === "mesa" && !t.jogo) avisos.push(`${onde}: na modalidade mesa é preciso informar  jogo: "tenis-de-mesa"  ou  "pebolim".`);
        const cat = cats.find(c => c.id === id);
        if (!cat || cat.extra) avisos.push(`${onde}: esta categoria não existe em JJC_FAIXAS (confira faixa/genero${slug === "mesa" ? "/jogo" : ""}).`);
        else if (!cat.part.length) avisos.push(`${onde}: não há equipes inscritas nesta categoria.`);

        const registrados = mapaRegistrados(cat ? cat.part : []);
        const vistas = new Map();

        (t.chaves || []).forEach((c, ci) => {
          const nomeChave = c.nome || `Chave ${String.fromCharCode(65 + ci)}`;
          const lista = (c.equipes || []);
          const naLista = new Set(lista.map(norm));

          const checaNome = (n, ctx) => {
            if (!n) return;
            if (registrados.size && !registrados.has(norm(n))) avisos.push(`${onde} › ${nomeChave}: "${n}" (${ctx}) não corresponde a nenhuma equipe inscrita.`);
          };
          lista.forEach(n => {
            checaNome(n, "lista de equipes");
            const k = norm(n);
            if (vistas.has(k) && vistas.get(k) !== ci) avisos.push(`${onde}: "${n}" aparece em mais de uma chave.`);
            vistas.set(k, ci);
          });
          (c.jogos || []).forEach((j, ji) => {
            const jn = `jogo ${ji + 1}`;
            if (!j || !j.a || !j.b) { avisos.push(`${onde} › ${nomeChave}: ${jn} sem equipe "a" ou "b".`); return; }
            checaNome(j.a, jn); checaNome(j.b, jn);
            if (lista.length && (!naLista.has(norm(j.a)) || !naLista.has(norm(j.b)))) {
              avisos.push(`${onde} › ${nomeChave}: ${jn} (${j.a} × ${j.b}) usa equipe que não está na lista "equipes" da chave.`);
            }
            if (placarPreenchido(j.placar) && !parsePlacar(j.placar)) avisos.push(`${onde} › ${nomeChave}: ${jn} tem placar inválido ("${j.placar}"). Use o formato "3x1".`);
            if (placarPreenchido(j.penaltis) && !parsePlacar(j.penaltis)) avisos.push(`${onde} › ${nomeChave}: ${jn} tem pênaltis inválidos ("${j.penaltis}"). Use "4x3".`);
            const p = parsePlacar(j.placar);
            if (p && p.a === p.b && !cfg.empate) avisos.push(`${onde} › ${nomeChave}: ${jn} terminou empatado (${j.placar}), mas esta modalidade não admite empate.`);
          });
          classificar(c, cfg, registrados).empatesSemOrdem.forEach(par => {
            avisos.push(`${onde} › ${nomeChave}: "${par[0]}" e "${par[1]}" empatam em todos os critérios. Defina o desempate com  ordem: ["${par[0]}", "${par[1]}"]  (ou o inverso).`);
          });
        });

        (t.fasesFinais || []).forEach(f => (f.jogos || []).forEach((j, ji) => {
          if (placarPreenchido(j.placar) && !parsePlacar(j.placar)) avisos.push(`${onde} › ${f.fase || "fase final"}: jogo ${ji + 1} tem placar inválido ("${j.placar}").`);
        }));
      });
    });
    return avisos;
  }

  function htmlConferir(slugAtual) {
    const avisos = validar();
    avisos.forEach(a => console.warn("[Tabelas] " + a));
    const mods = typeof JJC_DATA !== "undefined" ? Object.values(JJC_DATA) : [];

    return `
      <section class="cc-section tb-secao tb-conferir">
        <div class="cc-wrap">
          <p class="cc-eyebrow">Conferência</p>
          <h2>Conferir tabelas</h2>
          <p>Tela de apoio para quem edita <code>js/tabelas-data.js</code>. Ela não aparece para os visitantes do site.</p>

          <h3 class="tb-sub">${avisos.length ? `⚠️ ${avisos.length} aviso${avisos.length === 1 ? "" : "s"}` : "✅ Nenhum problema encontrado"}</h3>
          ${avisos.length ? `<ul class="tb-avisos">${avisos.map(a => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}

          <h3 class="tb-sub">Nomes válidos por categoria (copie e cole)</h3>
          ${mods.map(m => {
            const cats = categoriasDa(m.slug).filter(c => c.part.length);
            if (!cats.length) return "";
            return `
              <details class="tb-nomes" ${m.slug === slugAtual ? "open" : ""}>
                <summary>${esc(m.nome)}</summary>
                ${cats.map(c => `
                  <div class="tb-nomes-cat">
                    <h4>${esc(rotulo(c))} <small>faixa: "${esc(c.faixa)}", genero: "${esc(c.genero)}"${c.jogo ? `, jogo: "${esc(c.jogo)}"` : ""}</small></h4>
                    <ul>${c.part.map(p => `<li><code>"${esc(p.nome)}"</code></li>`).join("")}</ul>
                  </div>`).join("")}
              </details>`;
          }).join("")}
        </div>
      </section>`;
  }

  /* ---------------- página ---------------- */
  function init() {
    const root = document.querySelector("[data-pagina-tabelas]");
    if (!root) return;

    render();

    // Resultados ao vivo: busca ao abrir e repete a cada 30 s (só com a aba visível)
    if (supabaseConfigurado()) {
      const atualizar = () => carregarResultados().then(mudou => { if (mudou) render(); });
      atualizar();
      if (!new URLSearchParams(window.location.search).has("conferir")) {
        setInterval(() => { if (!document.hidden) atualizar(); }, INTERVALO_ATUALIZACAO);
      }
    }
  }

  function render() {
    const root = document.querySelector("[data-pagina-tabelas]");
    if (!root) return;

    if (typeof JJC_DATA === "undefined" || typeof JJC_FAIXAS === "undefined" || typeof JJC_TABELAS === "undefined") {
      root.innerHTML = `<section class="cc-section"><div class="cc-wrap"><p class="cc-note">Não foi possível carregar os dados das tabelas.</p></div></section>`;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const conferir = params.has("conferir");
    const mods = Object.values(JJC_DATA);
    let slug = params.get("modalidade");
    if (!JJC_DATA[slug]) slug = mods[0].slug;
    const mod = JJC_DATA[slug];
    const cfg = cfgDe(slug);

    // Atualizado em
    const meta = typeof JJC_TABELAS_META !== "undefined" ? JJC_TABELAS_META : {};
    const elDesc = document.querySelector("[data-tab-descricao]");
    if (elDesc) {
      const quando = meta.atualizadoEm || (ULTIMA_ATUALIZACAO ? textoAtualizacao(ULTIMA_ATUALIZACAO) : "");
      elDesc.textContent = quando
        ? `Chaves, jogos e classificação · Atualizado em ${quando}`
        : "Chaves, jogos e classificação de cada modalidade e categoria.";
    }

    const url = (m, c) => `tabelas.html?modalidade=${encodeURIComponent(m)}${c ? "&categoria=" + encodeURIComponent(c) : ""}${conferir ? "&conferir=1" : ""}`;

    // Chips de modalidade
    const navMod = document.querySelector("[data-tab-modalidades]");
    if (navMod) {
      navMod.innerHTML = `<div class="cc-wrap jjc-faixa-chips-inner">
        ${mods.map(m => `<a href="${url(m.slug)}" class="jjc-faixa-chip${m.slug === slug ? " active" : ""}"
            ${m.slug === slug ? 'aria-current="page"' : ""}>${esc(m.nome)}</a>`).join("")}
      </div>`;
      navMod.hidden = false;
    }

    // Categorias
    const cats = categoriasDa(slug);
    let cat = cats.find(c => c.id === params.get("categoria"));
    if (!cat) cat = cats.find(c => c.tabela) || cats[0];

    const navCat = document.querySelector("[data-tab-categorias]");
    if (navCat) {
      if (cats.length) {
        navCat.innerHTML = `<div class="cc-wrap jjc-faixa-chips-inner tb-chips-cat">
          ${cats.map(c => `<a href="${url(slug, c.id)}" class="jjc-faixa-chip tb-chip-sm${cat && c.id === cat.id ? " active" : ""}${c.tabela ? " tb-chip-com-tabela" : ""}"
              ${cat && c.id === cat.id ? 'aria-current="page"' : ""}>${esc(rotulo(c))}</a>`).join("")}
        </div>`;
        navCat.hidden = false;
      } else navCat.hidden = true;
    }

    document.title = `Tabelas · ${mod.nome} · Jogos da Juventude Católica (JJC)`;

    let html = conferir ? htmlConferir(slug) : "";
    if (!cats.length) {
      html += `
        <section class="cc-section tb-secao"><div class="cc-wrap">
          <h2>${esc(mod.nome)}</h2>
          <div class="tb-embreve"><strong>Tabela em breve</strong>
          <p>Ainda não há equipes inscritas ou tabelas divulgadas para esta modalidade.</p></div>
        </div></section>`;
    } else {
      html += htmlCategoria(slug, cat, cfg);
    }
    root.innerHTML = html;
  }

})();
