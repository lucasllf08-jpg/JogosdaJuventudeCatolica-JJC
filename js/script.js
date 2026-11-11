/* ==================================================================
   script.js
   ------------------------------------------------------------------
   Script único do portal JJC. Organizado em módulos independentes:

   1. NAV        -> menu fixo, estado "scrolled" e menu mobile
   2. CONTADOR    -> contagem regressiva reutilizável (várias páginas)
   3. MODALIDADES -> renderiza cards da home a partir de JJC_DATA
   4. MODALIDADE  -> preenche a página de cada modalidade a partir de
                     JJC_DATA (info geral, categorias, programação,
                     premiação, equipes, FAQ)
   5. EQUIPE      -> monta a página de uma equipe a partir da URL
                     (?modalidade=futsal&id=futsal-leoes-de-juda)
   8. ABA EQUIPES -> abas "Informações | Equipes" das modalidades, cards
                     de faixa etária e página times.html (equipes por
                     faixa), a partir de js/equipes-data.js

   Cada módulo só executa se encontrar os elementos correspondentes
   na página atual, então este mesmo arquivo pode ser incluído em
   todas as páginas do site sem gerar erros.
   ================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initContadores();
  renderModalidadesHome();
  renderInfoGeralHome();
  renderPaginaModalidade();
  initAbasModalidade();
  renderAbaEquipes();
  renderPaginaTimes();
  renderPaginaEquipe();
  renderPaginaRegulamentos();
  renderPaginaRepresentantes();
});


/* ==================================================================
   1. NAVEGAÇÃO
   ================================================================== */
function initNav() {
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  if (!nav) return;

  // Muda a aparência do menu ao rolar a página
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", onScroll);
  onScroll();

  // Menu mobile (hambúrguer)
  // Menu mobile (hambúrguer)
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      toggle.classList.toggle("open");
    });

    // Fecha o menu ao clicar em um link (mobile)
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });

    // Fecha o menu ao tocar/clicar fora dele
    document.addEventListener("click", (e) => {
      const menuAberto = links.classList.contains("open");
      const cliqueForaDoMenu = !links.contains(e.target) && !toggle.contains(e.target);
      if (menuAberto && cliqueForaDoMenu) {
        links.classList.remove("open");
        toggle.classList.remove("open");
      }
    });

    // Fecha o menu ao pressionar a tecla Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.classList.remove("open");
      }
    });
  }

  // Marca o link ativo com base na página atual
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  nav.querySelectorAll(".jjc-nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === paginaAtual) a.classList.add("active");
  });
}


/* ==================================================================
   2. CONTADOR REGRESSIVO (reutilizável)
   ------------------------------------------------------------------
   Qualquer elemento com [data-contador][data-alvo="ISO_DATE"] vira
   um contador regressivo automaticamente. Suporta múltiplos
   contadores na mesma página (ex: futuramente mais de um evento).
   ================================================================== */
function initContadores() {
  const contadores = document.querySelectorAll("[data-contador]");

  contadores.forEach(el => {
    const alvoStr = el.getAttribute("data-alvo");
    if (!alvoStr) return;

    const alvo = new Date(alvoStr).getTime();
    const elDias = el.querySelector("[data-cd-dias]");
    const elHoras = el.querySelector("[data-cd-horas]");
    const elMin = el.querySelector("[data-cd-min]");
    const elSeg = el.querySelector("[data-cd-seg]");

    function atualizar() {
      const agora = new Date().getTime();
      const diferenca = alvo - agora;

      if (diferenca <= 0) {
        if (elDias) elDias.textContent = "00";
        if (elHoras) elHoras.textContent = "00";
        if (elMin) elMin.textContent = "00";
        if (elSeg) elSeg.textContent = "00";
        clearInterval(intervalo);
        return;
      }

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      if (elDias) elDias.textContent = String(dias).padStart(2, "0");
      if (elHoras) elHoras.textContent = String(horas).padStart(2, "0");
      if (elMin) elMin.textContent = String(minutos).padStart(2, "0");
      if (elSeg) elSeg.textContent = String(segundos).padStart(2, "0");
    }

    atualizar();
    const intervalo = setInterval(atualizar, 1000);
  });
}


/* ==================================================================
   3. CARDS DE MODALIDADES NA HOME
   ------------------------------------------------------------------
   Procura o container [data-modalidades] em index.html e gera um
   card para cada modalidade cadastrada em JJC_DATA. Para adicionar
   uma nova modalidade no futuro, basta incluí-la em data.js.
   ================================================================== */
function renderModalidadesHome() {
  const container = document.querySelector("[data-modalidades]");
  if (!container || typeof JJC_DATA === "undefined") return;

  const html = Object.values(JJC_DATA).map(mod => `
    <article class="jjc-modalidade-card">
      <div class="jjc-modalidade-img" style="background-image:url('${mod.imagemCard}')"></div>
      <div class="jjc-modalidade-body">
        <h3>${mod.nome}</h3>
        <p>${mod.descricaoCurta}</p>
        <a href="html/${mod.slug}.html" class="cc-btn cc-btn-primary">Saiba Mais</a>
      </div>
    </article>
  `).join("");

  container.innerHTML = html;
}


/* ==================================================================
   3B. INFORMAÇÕES GERAIS NA HOME (identidade do evento + alojamento)
   ------------------------------------------------------------------
   Procura [data-identidade] e [data-alojamento] em index.html e
   preenche a partir de JJC_INFO (definido em data.js). Se algum dos
   dois blocos não existir na página, é simplesmente ignorado.
   ================================================================== */
function renderInfoGeralHome() {
  if (typeof JJC_INFO === "undefined") return;

  // --- Identidade do evento ---
  const identidadeBox = document.querySelector("[data-identidade]");
  if (identidadeBox && JJC_INFO.identidade) {
    setText("[data-identidade-titulo]", JJC_INFO.identidade.titulo);
    setText("[data-identidade-texto]", JJC_INFO.identidade.texto);
  }

  // --- Alojamento e café da manhã ---
  const alojamentoBox = document.querySelector("[data-alojamento]");
  if (alojamentoBox && JJC_INFO.alojamento) {
    setText("[data-alojamento-titulo]", JJC_INFO.alojamento.titulo);
    setText("[data-alojamento-texto]", JJC_INFO.alojamento.texto);

    const lista = document.querySelector("[data-alojamento-itens]");
    if (lista) {
      lista.innerHTML = JJC_INFO.alojamento.itens.map(item => `
        <div class="jjc-info-card">
          <p class="cc-eyebrow">${item.label}</p>
          <p>${item.valor}</p>
        </div>
      `).join("");
    }

    setText("[data-alojamento-obs]", JJC_INFO.alojamento.observacao);
  }
}


/* ==================================================================
   4. PÁGINA DE MODALIDADE (futsal.html, volei.html,
      queimada.html, mesa.html)
   ------------------------------------------------------------------
   Cada página de modalidade possui um elemento raiz
   <body data-modalidade="futsal"> — a partir desse atributo o script
   busca os dados correspondentes em JJC_DATA e preenche todas as
   seções dinamicamente. Isso mantém HTML, CSS e dados desacoplados.
   ================================================================== */
function renderPaginaModalidade() {
  const slug = document.body.getAttribute("data-modalidade");
  if (!slug || typeof JJC_DATA === "undefined") return;

  const mod = JJC_DATA[slug];
  if (!mod) return;

  // --- HERO ---
  setText("[data-mod-nome]", mod.nome);
  setText("[data-mod-descricao]", mod.descricaoCurta);
  setAttr("[data-mod-imagem]", "style", `background-image:url('${mod.imagem}')`);
  // Inscrições agora são feitas presencialmente — não há mais botão/link
  // de inscrição online. O campo mod.regulamentoPdf é usado na página
  // de Regulamentos (ver renderPaginaRegulamentos), não aqui.
  if (mod.versiculo) setText("[data-mod-versiculo]", mod.versiculo);

  // --- SOBRE ---
  setText("[data-mod-sobre]", mod.sobre);

  // --- INFORMAÇÕES GERAIS ---
  setText("[data-mod-data]", mod.infoGerais.data);
  setText("[data-mod-horario]", mod.infoGerais.horario);
  setText("[data-mod-local]", mod.infoGerais.local);
  setText("[data-mod-publico]", mod.infoGerais.publico);
  setText("[data-mod-categorias-resumo]", mod.categorias.join(" · "));

  // --- CATEGORIAS (lista detalhada) ---
  const catContainer = document.querySelector("[data-mod-categorias-lista]");
  if (catContainer) {
    catContainer.innerHTML = mod.categorias.map(c => `<li>${c}</li>`).join("");
  }

  // --- PROGRAMAÇÃO ---
  const progContainer = document.querySelector("[data-mod-programacao]");
  if (progContainer) {
    progContainer.innerHTML = mod.programacao.map(item => `
      <li><span class="cc-time">${item.hora}</span> ${item.evento}</li>
    `).join("");
  }

  // --- REGULAMENTO ---
  setText("[data-mod-regulamento]", mod.regulamento);

  // --- PREMIAÇÃO ---
  const premGeral = document.querySelector("[data-mod-premiacao-geral]");
  if (premGeral) {
    premGeral.innerHTML = mod.premiacao.geral.map(p => `<li>${p}</li>`).join("");
  }
  const premExtras = document.querySelector("[data-mod-premiacao-extras]");
  if (premExtras) {
    if (mod.premiacao.extras && mod.premiacao.extras.length) {
      premExtras.innerHTML = mod.premiacao.extras.map(p => `<li>${p}</li>`).join("");
      premExtras.closest("[data-mod-premiacao-extras-wrap]")?.removeAttribute("hidden");
    }
  }

  // --- EQUIPES PARTICIPANTES ---
  const equipesContainer = document.querySelector("[data-mod-equipes]");
  if (equipesContainer) {
    if (mod.equipes && mod.equipes.length) {
      equipesContainer.innerHTML = mod.equipes.map(eq => `
        <article class="jjc-team-card">
          <h3>${eq.nome}</h3>
          <p class="jjc-team-comunidade">${eq.comunidade}</p>
          <ul class="jjc-team-meta">
            <li><strong>Capitão:</strong> ${eq.capitao}</li>
            <li><strong>Atletas:</strong> ${eq.atletas.length}</li>
          </ul>
          <a href="equipe.html?modalidade=${mod.slug}&id=${eq.id}" class="cc-btn cc-btn-ghost">Ver elenco</a>
        </article>
      `).join("");
    } else {
      equipesContainer.innerHTML = `<p class="cc-note">Nenhuma equipe cadastrada ainda. Em breve, novas equipes aparecerão automaticamente aqui.</p>`;
    }
  }

  // --- FAQ ---
  const faqContainer = document.querySelector("[data-mod-faq]");
  if (faqContainer) {
    faqContainer.innerHTML = mod.faq.map(item => `
      <details>
        <summary>${item.pergunta}</summary>
        <p>${item.resposta}</p>
      </details>
    `).join("");
  }

  // --- TÍTULO DA PÁGINA ---
  document.title = `${mod.nome} · Jogos da Juventude Católica (JJC)`;
}


/* ==================================================================
   5. PÁGINA DA EQUIPE (equipe.html)
   ------------------------------------------------------------------
   Lê os parâmetros "modalidade" e "id" da URL, localiza a equipe em
   JJC_DATA e preenche a página. Ex:
   equipe.html?modalidade=futsal&id=futsal-leoes-de-juda
   ================================================================== */
function renderPaginaEquipe() {
    const container = document.querySelector("[data-pagina-equipe]");

    if (!container || typeof JJC_EQUIPE === "undefined") return;

    container.innerHTML = `
        <div class="jjc-section-head">
            <h2>Coordenação Geral</h2>

            <p>
                Responsáveis pelo planejamento, organização e
                acompanhamento geral dos Jogos da Juventude Católica.
            </p>
        </div>

        <div class="jjc-equipe-grid">
            ${JJC_EQUIPE.map((pessoa) => `
                <article class="jjc-equipe-card">

                    <div class="jjc-equipe-foto">
                        <img
                            src="${pessoa.foto}"
                            alt="Foto de ${pessoa.nome}"
                        >
                    </div>

                    <div class="jjc-equipe-content">

                        <span class="jjc-equipe-area">
                            ${pessoa.area}
                        </span>

                        <h3>${pessoa.nome}</h3>

                        <a
                            href="https://wa.me/55${pessoa.telefone}"
                            target="_blank"
                            rel="noopener"
                            class="jjc-whatsapp"
                        >
                            WhatsApp
                        </a>

                        <p>
                            ${pessoa.descricao}
                        </p>

                    </div>

                </article>
            `).join("")}
        </div>
    `;
}


/* ==================================================================
   6. PÁGINA DE REGULAMENTOS (regulamentos.html)
   ------------------------------------------------------------------
   Monta a lista do Regulamento Geral (JJC_INFO.regulamentoGeral) e o
   card de cada modalidade (JJC_DATA), com o texto-resumo já usado nas
   páginas de modalidade e um botão de download do PDF específico
   (mod.regulamentoPdf). Enquanto o PDF de uma modalidade não existe,
   o botão some e aparece um aviso "em breve" no lugar.
   ================================================================== */
function renderPaginaRegulamentos() {
  const root = document.querySelector("[data-pagina-regulamentos]");
  if (!root || typeof JJC_DATA === "undefined") return;

  // --- Regulamento geral ---
  if (typeof JJC_INFO !== "undefined" && JJC_INFO.regulamentoGeral) {
    setText("[data-reg-geral-titulo]", JJC_INFO.regulamentoGeral.titulo);
    setText("[data-reg-geral-texto]", JJC_INFO.regulamentoGeral.texto);
    setAttr("[data-reg-geral-pdf]", "href", JJC_INFO.regulamentoGeral.pdf);
  }

  // --- Um card por modalidade ---
  const container = document.querySelector("[data-reg-modalidades]");
  if (!container) return;

  container.innerHTML = Object.values(JJC_DATA).map(mod => `
    <article class="jjc-reg-card" id="reg-${mod.slug}">
      <h3>${mod.nome}</h3>
      <p>${mod.regulamento}</p>
      ${mod.regulamentoPdf
        ? `<a href="${mod.regulamentoPdf}" target="_blank" rel="noopener" class="cc-btn cc-btn-primary">Baixar regulamento (PDF)</a>`
        : `<p class="cc-note">Regulamento específico em preparação — será publicado aqui em breve.</p>`
      }
    </article>
  `).join("");
}

/* ==================================================================
   7. PÁGINA DE REPRESENTANTES
   ================================================================== */

function renderPaginaRepresentantes() {
  const root = document.querySelector("[data-pagina-representantes]");

  if (!root || typeof JJC_REPRESENTANTES === "undefined") return;

  const container = document.querySelector("[data-representantes]");

  if (!container) return;

  if (!JJC_REPRESENTANTES.length) {
    container.innerHTML = `
      <p class="cc-note">
        Nenhum representante cadastrado no momento.
      </p>
    `;
    return;
  }

  container.innerHTML = JJC_REPRESENTANTES.map(setor => `
    <div class="jjc-setor-representantes">

      <div class="jjc-setor-header">
        <p class="cc-eyebrow">Setor</p>
        <h2>${setor.setor}</h2>
      </div>

      <div class="jjc-representantes-grid">

        ${setor.pessoas.map(pessoa => `
          <article class="jjc-representante-card">

            <img
              src="${pessoa.foto}"
              alt="Foto de ${pessoa.nome}"
              class="jjc-representante-foto"
            >

            <div class="jjc-representante-info">

              <h3>${pessoa.nome}</h3>

              <a
                href="https://wa.me/55${pessoa.telefone}"
                target="_blank"
                rel="noopener"
                class="jjc-whatsapp"
              >
                WhatsApp
              </a>

            </div>

          </article>
        `).join("")}

      </div>

    </div>
  `).join("");

  document.title =
    "Representantes · Jogos da Juventude Católica (JJC)";
}

/* ==================================================================
   8. ABA "EQUIPES" DAS MODALIDADES + PÁGINA DE TIMES POR FAIXA ETÁRIA
   ------------------------------------------------------------------
   Dados em js/equipes-data.js (JJC_FAIXAS e JJC_EQUIPES).

   - initAbasModalidade(): alterna entre as abas "Informações" e
     "Equipes" nas páginas de modalidade (futsal.html etc.). O link
     futsal.html#equipes já abre direto na aba Equipes.
   - renderAbaEquipes(): monta os cards de faixa etária (Infantil,
     Juvenil, Adulto) que levam para times.html.
   - renderPaginaTimes(): em times.html?modalidade=futsal&faixa=infantil
     lista as equipes da faixa — masculino primeiro, depois feminino
     (e misto), seguindo a ordem definida em JJC_FAIXAS.
   ================================================================== */
const JJC_GENERO_LABEL = { masculino: "Masculino", feminino: "Feminino", misto: "Misto" };
const JJC_JOGO_LABEL = { "tenis-de-mesa": "Tênis de Mesa", pebolim: "Pebolim" };

function escapeHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function equipesDoGrupo(slug, faixaId, grupo) {
  if (typeof JJC_EQUIPES === "undefined") return [];
  return JJC_EQUIPES
    .filter(e =>
      e.modalidade === slug &&
      e.faixa === faixaId &&
      e.genero === grupo.genero &&
      (e.jogo || null) === (grupo.jogo || null))
    .sort((a, b) =>
      a.comunidade.localeCompare(b.comunidade, "pt-BR") ||
      (a.numero || 0) - (b.numero || 0));
}

function resumoFaixa(slug, faixa) {
  const config = JJC_FAIXAS[slug];
  const lista = faixa.grupos.flatMap(g => equipesDoGrupo(slug, faixa.id, g));

  if (config.contagem === "atletas") {
    const total = lista.reduce((soma, e) => soma + e.atletas.length, 0);
    if (!total) return "Nenhum atleta inscrito ainda";
    return total === 1 ? "1 atleta inscrito" : `${total} atletas inscritos`;
  }

  if (!lista.length) return "Nenhuma equipe inscrita ainda";
  return lista.length === 1 ? "1 equipe inscrita" : `${lista.length} equipes inscritas`;
}

/* --- Abas "Informações" | "Equipes" --- */
function initAbasModalidade() {
  const abas = [...document.querySelectorAll("[data-tab]")];
  const paineis = [...document.querySelectorAll("[data-tab-painel]")];
  if (!abas.length || !paineis.length) return;

  const barra = document.getElementById("abas-modalidade");

  function ativar(id, { atualizarUrl = true, rolar = false } = {}) {
    if (!paineis.some(p => p.dataset.tabPainel === id)) id = "info";

    abas.forEach(a => {
      const ativa = a.dataset.tab === id;
      a.classList.toggle("active", ativa);
      a.setAttribute("aria-selected", ativa ? "true" : "false");
    });
    paineis.forEach(p => { p.hidden = p.dataset.tabPainel !== id; });

    if (atualizarUrl) {
      const url = window.location.pathname + window.location.search + (id === "equipes" ? "#equipes" : "");
      history.replaceState(null, "", url);
    }
    if (rolar && barra) barra.scrollIntoView({ block: "start" });
  }

  abas.forEach(a => a.addEventListener("click", () => ativar(a.dataset.tab)));

  window.addEventListener("hashchange", () => {
    ativar(window.location.hash === "#equipes" ? "equipes" : "info", { atualizarUrl: false });
  });

  // Estado inicial (ex.: futsal.html#equipes vindo do botão "Voltar")
  if (window.location.hash === "#equipes") {
    ativar("equipes", { atualizarUrl: false, rolar: true });
  }
}

/* --- Cards de faixa etária dentro da aba Equipes --- */
function renderAbaEquipes() {
  const container = document.querySelector("[data-mod-faixas]");
  const slug = document.body.getAttribute("data-modalidade");
  if (!container || !slug || typeof JJC_FAIXAS === "undefined" || !JJC_FAIXAS[slug]) return;

  container.innerHTML = JJC_FAIXAS[slug].faixas.map(faixa => `
    <a class="jjc-faixa-card" href="times.html?modalidade=${encodeURIComponent(slug)}&faixa=${encodeURIComponent(faixa.id)}">
      <span class="cc-eyebrow">Faixa etária</span>
      <h3>${escapeHtml(faixa.nome)}</h3>
      <p class="jjc-faixa-idade">${escapeHtml(faixa.idade)}</p>
      <p class="jjc-faixa-resumo">${resumoFaixa(slug, faixa)}</p>
      <span class="jjc-faixa-link">Ver equipes <span aria-hidden="true">→</span></span>
    </a>
  `).join("");
}

/* --- Página times.html --- */
function renderPaginaTimes() {
  const root = document.querySelector("[data-pagina-times]");
  if (!root || typeof JJC_FAIXAS === "undefined" || typeof JJC_DATA === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("modalidade");
  const faixaId = params.get("faixa");
  const mod = JJC_DATA[slug];
  const config = JJC_FAIXAS[slug];
  const faixa = config && config.faixas.find(f => f.id === faixaId);

  if (!mod || !faixa) {
    setText("[data-times-titulo]", "Equipes");
    setText("[data-times-descricao]", "Faixa etária não encontrada. Escolha uma modalidade para ver as equipes.");
    root.innerHTML = `
      <section class="cc-section">
        <div class="cc-wrap">
          <p class="cc-eyebrow">Modalidades</p>
          <h2>Escolha uma modalidade</h2>
          <ul class="jjc-categorias-lista">
            ${Object.values(JJC_DATA).map(m => `<li><a href="${m.slug}.html#equipes">${escapeHtml(m.nome)}</a></li>`).join("")}
          </ul>
        </div>
      </section>`;
    return;
  }

  // --- Hero ---
  setText("[data-times-tag]", `Jogos da Juventude Católica · ${mod.nome}`);
  setText("[data-times-titulo]", `${mod.nome} · ${faixa.nome}`);
  setText("[data-times-descricao]", `Equipes inscritas · Faixa etária: ${faixa.idade}`);
  const voltar = document.querySelector("[data-times-voltar]");
  if (voltar) {
    voltar.href = `${slug}.html#equipes`;
    voltar.textContent = `← Voltar para ${mod.nome}`;
  }
  document.title = `${mod.nome} ${faixa.nome} · Equipes · Jogos da Juventude Católica (JJC)`;

  // Link ativo no menu: a modalidade atual
  document.querySelectorAll(".jjc-nav-links a").forEach(a => {
    if (a.getAttribute("href") === `${slug}.html`) a.classList.add("active");
  });

  // --- Troca rápida entre faixas (Infantil · Juvenil · Adulto) ---
  const chips = document.querySelector("[data-times-faixas]");
  if (chips) {
    chips.innerHTML = `<div class="cc-wrap jjc-faixa-chips-inner">
      ${config.faixas.map(f => `
        <a href="times.html?modalidade=${encodeURIComponent(slug)}&faixa=${encodeURIComponent(f.id)}"
           class="jjc-faixa-chip${f.id === faixa.id ? " active" : ""}"
           ${f.id === faixa.id ? 'aria-current="page"' : ""}>${escapeHtml(f.nome)}</a>
      `).join("")}
    </div>`;
    chips.hidden = false;
  }

  // --- Um bloco por grupo (masculino, feminino, misto...) ---
  root.innerHTML = faixa.grupos.map(grupo => {
    const equipes = equipesDoGrupo(slug, faixa.id, grupo);
    const jogo = grupo.jogo ? JJC_JOGO_LABEL[grupo.jogo] : null;
    const genero = JJC_GENERO_LABEL[grupo.genero] || grupo.genero;
    const titulo = jogo ? `${jogo} · ${genero}` : genero;
    const unidade = config.contagem === "atletas" ? "atleta" : "equipe";
    const total = config.contagem === "atletas"
      ? equipes.reduce((soma, e) => soma + e.atletas.length, 0)
      : equipes.length;
    const contagem = `${total} ${unidade}${total === 1 ? "" : "s"}`;

    return `
      <section class="cc-section">
        <div class="cc-wrap">
          <p class="cc-eyebrow">${escapeHtml(faixa.nome)}</p>
          <h2>${escapeHtml(titulo)}</h2>
          <p class="jjc-grupo-meta">
            <span class="jjc-grupo-pill">${contagem}</span>
            ${grupo.obs ? `<span>${escapeHtml(grupo.obs)}</span>` : ""}
          </p>

          ${equipes.length ? `
            <div class="jjc-teams-grid">
              ${equipes.map(eq => cardTime(eq, config.contagem)).join("")}
            </div>
          ` : `<p class="cc-note">Nenhuma ${config.contagem === "atletas" ? "inscrição" : "equipe inscrita"} nesta categoria até o momento.</p>`}
        </div>
      </section>`;
  }).join("");
}

function cardTime(eq, contagem) {
  const nome = eq.numero ? `${eq.comunidade} — Time ${eq.numero}` : eq.comunidade;
  const qtd = eq.atletas.length;
  const rotulo = `${qtd} atleta${qtd === 1 ? "" : "s"}`;

  return `
    <article class="jjc-team-card">
      <h3>${escapeHtml(nome)}</h3>
      <p class="jjc-team-comunidade">${escapeHtml(eq.setor)}</p>
      <details class="jjc-atletas" ${contagem === "atletas" ? "open" : ""}>
        <summary>${rotulo}</summary>
        <ol class="jjc-atletas-lista">
          ${eq.atletas.map(n => `<li>${escapeHtml(n)}</li>`).join("")}
        </ol>
      </details>
    </article>`;
}


/* ==================================================================
   UTILITÁRIOS
   ================================================================== */
function setText(selector, valor) {
  const el = document.querySelector(selector);
  if (el) el.textContent = valor;
}

function setAttr(selector, atributo, valor) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(atributo, valor);
}
