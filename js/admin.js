/* ==================================================================
   admin.js — painel da organização (html/admin.html)
   ------------------------------------------------------------------
   Lança placar, pênaltis, cartões, horário/local e (no mata-mata) os
   confrontos de cada jogo. Tudo é gravado no Supabase (tabela
   jogos_resultados) e aparece em html/tabelas.html sem mexer no código.

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

  const GENERO = { masculino: "Masculino", feminino: "Feminino", misto: "Misto" };
  const JOGO = { "tenis-de-mesa": "Tênis de Mesa", pebolim: "Pebolim" };
  const TABELA = (typeof JJC_SUPABASE !== "undefined" && JJC_SUPABASE.tabela) || "jogos_resultados";

  let client = null;
  let cats = [];
  let atual = null;      // categoria selecionada
  let linhas = {};       // id -> linha do banco da categoria atual
  let contador = 0;

  document.addEventListener("DOMContentLoaded", boot);

  /* ---------------- inicialização ---------------- */
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

    // só administradores (tabela admins) podem usar o painel
    const { data, error } = await client.from("admins").select("user_id").eq("user_id", uid).maybeSingle();
    if (error || !data) {
      aviso("Este usuário não tem permissão de administrador. Peça para ser adicionado na tabela admins.");
      $("[data-ad-email]").textContent = session.user.email || "";
      $("[data-ad-usuario]").hidden = false;
      mostrar("nenhum");
      return;
    }
    aviso("");
    $("[data-ad-email]").textContent = session.user.email || "";
    $("[data-ad-usuario]").hidden = false;
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

  /* ---------------- categorias ---------------- */
  function rotuloCategoria(slug, t) {
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
        cats.push({
          slug, t,
          id: [t.jogo, t.faixa, t.genero].filter(Boolean).join("-"),
          modalidade: (typeof JJC_DATA !== "undefined" && JJC_DATA[slug]) ? JJC_DATA[slug].nome : slug,
          label: rotuloCategoria(slug, t)
        });
      });
    });

    const sel = $("[data-ad-categoria]");
    if (!cats.length) {
      sel.innerHTML = "";
      $("[data-ad-jogos]").innerHTML = `<p class="ad-aviso">Nenhuma categoria com jogos cadastrados em js/tabelas-data.js.</p>`;
      return;
    }
    const grupos = {};
    cats.forEach((c, i) => { (grupos[c.modalidade] = grupos[c.modalidade] || []).push([i, c]); });
    sel.innerHTML = Object.keys(grupos).map(m =>
      `<optgroup label="${esc(m)}">${grupos[m].map(([i, c]) => `<option value="${i}">${esc(c.label)}</option>`).join("")}</optgroup>`
    ).join("");
    abrirCategoria(sel.value);
  }

  async function abrirCategoria(indice) {
    atual = cats[Number(indice)];
    if (!atual) return;
    const box = $("[data-ad-jogos]");
    box.innerHTML = `<p class="ad-dica">Carregando...</p>`;
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

  /* ---------------- atletas (para os cartões) ---------------- */
  function atletasDe(nomeEquipe) {
    if (typeof JJC_EQUIPES === "undefined" || !atual) return [];
    const t = atual.t, n = norm(nomeEquipe);
    const regs = JJC_EQUIPES.filter(e => e.modalidade === atual.slug && e.faixa === t.faixa &&
      e.genero === t.genero && (e.jogo || null) === (t.jogo || null));
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
    if (typeof JJC_EQUIPES === "undefined" || !atual) return [];
    const t = atual.t;
    const regs = JJC_EQUIPES.filter(e => e.modalidade === atual.slug && e.faixa === t.faixa &&
      e.genero === t.genero && (e.jogo || null) === (t.jogo || null));
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

  /* ---------------- desenho dos jogos ---------------- */
  const valor = (j, r, k) => (r && r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "") ? r[k] : (j[k] ?? "");

  function parsePar(txt) {
    const m = String(txt ?? "").match(/^\s*(\d+)\s*[x×X\-–:]\s*(\d+)\s*$/);
    return m ? [m[1], m[2]] : ["", ""];
  }

  function desenhar() {
    const t = atual.t;
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
    document.querySelectorAll(".ad-jogo").forEach(atualizarNomes);
  }

  function htmlJogo(j, id, final) {
    const r = linhas[id];
    const n = ++contador;
    const [pa, pb] = parsePar(valor(j, r, "placar"));
    const [qa, qb] = parsePar(valor(j, r, "penaltis"));
    const nomeA = valor(j, r, "a"), nomeB = valor(j, r, "b");
    const cartoes = Array.isArray(r && r.cartoes) ? r.cartoes : (Array.isArray(j.cartoes) ? j.cartoes : []);
    const info = [valor(j, r, "data"), valor(j, r, "hora"), valor(j, r, "local")].filter(Boolean).join(" · ");

    const lado = (k, nome) => final
      ? `<div class="ad-lado ad-lado-${k}"><label>Equipe ${k.toUpperCase()}
           <input class="ad-${k}" type="text" list="ad-inscritos" value="${esc(nome)}"></label></div>`
      : `<div class="ad-lado ad-lado-${k}"><span class="ad-lado-nome ad-${k}-nome">${esc(nome)}</span></div>`;

    return `
      <article class="ad-jogo" data-id="${esc(id)}" data-final="${final ? 1 : 0}" data-n="${n}"
               data-a0="${esc(j.a ?? "")}" data-b0="${esc(j.b ?? "")}">
        ${info ? `<div class="ad-jogo-info">${esc(info)}</div>` : ""}
        <div class="ad-confronto">
          ${lado("a", nomeA)}
          <div class="ad-placar">
            <input class="ad-pa" type="number" inputmode="numeric" min="0" value="${esc(pa)}" aria-label="Placar da equipe A">
            <i>×</i>
            <input class="ad-pb" type="number" inputmode="numeric" min="0" value="${esc(pb)}" aria-label="Placar da equipe B">
          </div>
          ${lado("b", nomeB)}
        </div>

        <details class="ad-mais">
          <summary>Pênaltis, observação, data e local</summary>
          <div class="ad-grid">
            <div><label>Pênaltis</label>
              <div class="ad-placar">
                <input class="ad-qa" type="number" inputmode="numeric" min="0" value="${esc(qa)}" aria-label="Pênaltis A">
                <i>×</i>
                <input class="ad-qb" type="number" inputmode="numeric" min="0" value="${esc(qb)}" aria-label="Pênaltis B">
              </div></div>
            <label>Observação<input class="ad-obs" type="text" placeholder="W.O., Adiado..." value="${esc(valor(j, r, "obs"))}"></label>
            <label>Data<input class="ad-data" type="text" placeholder="21/11" value="${esc(valor(j, r, "data"))}"></label>
            <label>Hora<input class="ad-hora" type="text" placeholder="08:00" value="${esc(valor(j, r, "hora"))}"></label>
            <label>Local<input class="ad-local" type="text" placeholder="Quadra 1" value="${esc(valor(j, r, "local"))}"></label>
          </div>
        </details>

        <p class="ad-cartoes-titulo">Cartões</p>
        <datalist id="ad-atl-${n}"></datalist>
        <div class="ad-cartoes">${cartoes.map(htmlCartao).join("")}</div>
        <button type="button" class="ad-btn ad-btn-sec" data-acao="add-cartao">+ Cartão</button>

        <div class="ad-rodape">
          <button type="button" class="ad-btn" data-acao="salvar">Salvar jogo</button>
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

  const nomeDoLado = (card, k) => {
    const inp = card.querySelector(`input.ad-${k}`);
    return inp ? inp.value.trim() : (card.querySelector(`.ad-${k}-nome`) || {}).textContent || "";
  };

  // atualiza os nomes nos seletores de cartão e a lista de atletas do jogo
  function atualizarNomes(card) {
    const a = nomeDoLado(card, "a"), b = nomeDoLado(card, "b");
    card.querySelectorAll(".ad-c-lado").forEach(sel => {
      sel.options[0].textContent = a || "Equipe A";
      sel.options[1].textContent = b || "Equipe B";
    });
    const dl = card.querySelector(`#ad-atl-${card.dataset.n}`);
    if (dl) dl.innerHTML = [...atletasDe(a), ...atletasDe(b)].map(x => `<option value="${esc(x)}">`).join("");
    card.querySelectorAll(".ad-c-atleta").forEach(i => i.setAttribute("list", `ad-atl-${card.dataset.n}`));
  }

  /* ---------------- eventos ---------------- */
  function aoDigitar(e) {
    const card = e.target.closest && e.target.closest(".ad-jogo");
    if (!card) return;
    if (e.target.matches("input.ad-a, input.ad-b")) atualizarNomes(card);
    if (e.target.matches(".ad-c-lado")) {
      // se o atleta está vazio (ou é o único atleta do lado anterior), sugere o do novo lado
      const linha = e.target.closest(".ad-cartao-linha");
      const inp = linha.querySelector(".ad-c-atleta");
      const antes = atletasDe(nomeDoLado(card, e.target.dataset.ladoAtual || "a"));
      const novo = atletasDe(nomeDoLado(card, e.target.value));
      if ((!inp.value || (antes.length === 1 && inp.value === antes[0])) && novo.length === 1) inp.value = novo[0];
      e.target.dataset.ladoAtual = e.target.value;
    }
  }

  function aoClicar(e) {
    const bt = e.target.closest && e.target.closest("[data-acao]");
    if (!bt) return;
    const acao = bt.dataset.acao;
    const card = bt.closest(".ad-jogo");

    if (acao === "sair") { client.auth.signOut(); }
    else if (acao === "recarregar") { if (atual) abrirCategoria(String(cats.indexOf(atual))); }
    else if (acao === "add-cartao" && card) {
      const unico = atletasDe(nomeDoLado(card, "a"));
      card.querySelector(".ad-cartoes").insertAdjacentHTML("beforeend",
        htmlCartao({ tipo: "amarelo", lado: "a", atleta: unico.length === 1 ? unico[0] : "" }));
      atualizarNomes(card);
    }
    else if (acao === "rem-cartao") { bt.closest(".ad-cartao-linha").remove(); }
    else if (acao === "salvar" && card) { salvar(card, bt); }
  }

  /* ---------------- salvar ---------------- */
  function status(card, msg, tipo) {
    const el = card.querySelector(".ad-status");
    el.textContent = msg; el.className = "ad-status" + (tipo ? " " + tipo : "");
  }

  function lerPar(card, ca, cb, rotulo) {
    const va = card.querySelector(ca).value.trim(), vb = card.querySelector(cb).value.trim();
    if (va === "" && vb === "") return { txt: "" };
    if (va === "" || vb === "") return { erro: `${rotulo}: preencha os dois lados (ou deixe os dois vazios).` };
    if (!/^\d+$/.test(va) || !/^\d+$/.test(vb)) return { erro: `${rotulo}: use apenas números inteiros.` };
    return { txt: `${Number(va)}x${Number(vb)}`, a: Number(va), b: Number(vb) };
  }

  async function salvar(card, bt) {
    const id = card.dataset.id;
    const final = card.dataset.final === "1";
    const cfg = (typeof JJC_TABELAS_CONFIG !== "undefined" && JJC_TABELAS_CONFIG[atual.slug]) || {};

    const placar = lerPar(card, ".ad-pa", ".ad-pb", "Placar");
    if (placar.erro) return status(card, placar.erro, "erro");
    const pen = lerPar(card, ".ad-qa", ".ad-qb", "Pênaltis");
    if (pen.erro) return status(card, pen.erro, "erro");

    if (placar.txt && placar.a === placar.b) {
      if (final && !pen.txt) return status(card, "Empate no mata-mata: informe o resultado dos pênaltis/desempate (em “Pênaltis…”).", "erro");
      if (!final && !cfg.empate) return status(card, "Esta modalidade não admite empate na fase de grupos.", "erro");
    }

    const a = nomeDoLado(card, "a"), b = nomeDoLado(card, "b");
    const vazio = v => (v && String(v).trim() !== "") ? String(v).trim() : null;

    const cartoes = [...card.querySelectorAll(".ad-cartao-linha")].map(l => ({
      lado: l.querySelector(".ad-c-lado").value,
      atleta: l.querySelector(".ad-c-atleta").value.trim(),
      tipo: l.querySelector(".ad-c-tipo").value
    })).filter(c => c.atleta);

    const row = {
      id,
      placar: placar.txt,
      penaltis: pen.txt,
      obs: card.querySelector(".ad-obs").value.trim(),
      // só grava a/b se o confronto foi trocado em relação ao tabelas-data.js
      a: final && a && a !== card.dataset.a0 ? a : null,
      b: final && b && b !== card.dataset.b0 ? b : null,
      data: vazio(card.querySelector(".ad-data").value),
      hora: vazio(card.querySelector(".ad-hora").value),
      local: vazio(card.querySelector(".ad-local").value),
      cartoes,
      atualizado_em: new Date().toISOString()
    };

    bt.disabled = true; status(card, "Salvando...");
    const { error } = await client.from(TABELA).upsert(row, { onConflict: "id" });
    bt.disabled = false;
    if (error) {
      const semPermissao = /row-level security|permission|JWT/i.test(error.message || "");
      return status(card, semPermissao ? "Sem permissão para salvar. Entre novamente ou confira a tabela admins." : "Erro ao salvar: " + error.message, "erro");
    }
    linhas[id] = row;
    const d = new Date();
    status(card, `Salvo ✓ ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`, "ok");
  }

})();
