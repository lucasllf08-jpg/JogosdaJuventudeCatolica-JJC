/* ==================================================================
   tabelas-data.js
   ------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR PARA ATUALIZAR AS
   TABELAS DO SITE (página html/tabelas.html).

   Enquanto uma categoria não tiver tabela aqui, o site mostra
   "Tabela em breve" junto com as equipes inscritas. Quando você
   cadastrar a tabela, ela aparece sozinha.

   -----------------------------------------------------------------
   COMO FUNCIONA (resumo)
   -----------------------------------------------------------------
   Dentro de cada modalidade (futsal, volei, queimada, mesa) você
   cria uma entrada por categoria. Cada categoria tem 1 ou mais
   "chaves":

     • 1 chave   -> todos contra todos, classificação por pontos
                    (usado quando há poucas equipes);
     • 2 chaves  -> Chave A e Chave B + "fasesFinais" (semifinal,
                    final...) (usado quando há muitas equipes).

   Você só digita as equipes e os jogos. A CLASSIFICAÇÃO (pontos,
   vitórias, saldo...) É CALCULADA AUTOMATICAMENTE a partir dos
   placares. Para lançar um resultado, basta preencher o campo
   placar do jogo, por exemplo  placar: "3x1".

   -----------------------------------------------------------------
   NOMES DAS EQUIPES
   -----------------------------------------------------------------
   Use o mesmo nome das equipes inscritas:
     • Futsal, Vôlei e Queimada: "Comunidade" ou "Comunidade N" quando
       a comunidade tem mais de um time na categoria.
       Ex.: "São Bento", "São Vicente de Paulo 1"
     • Tênis de Mesa: nome do atleta.   Ex.: "Arthur Schmidt"
     • Pebolim: nomes da dupla.         Ex.: "Allan Henrique / Gabriel Alieve"

   Maiúsculas/minúsculas e acentos não fazem diferença. Para conferir
   se digitou tudo certo, abra no navegador:
        html/tabelas.html?conferir=1
   Essa tela lista os nomes válidos de cada categoria e avisa sobre
   qualquer nome que não bate com uma equipe inscrita.

   -----------------------------------------------------------------
   MODELO COMPLETO DE UMA CATEGORIA (copie, cole e ajuste)
   -----------------------------------------------------------------
   Dentro de  futsal: [ ... ]  (ou volei, queimada, mesa), adicione:

     {
       faixa: "adulto",          // "infantil" | "juvenil" | "adulto"
       genero: "masculino",      // "masculino" | "feminino" | "misto"
       // jogo: "pebolim",       // SÓ na modalidade mesa: "tenis-de-mesa" ou "pebolim"

       observacao: "Texto livre opcional exibido acima da tabela.",

       // Opcional: preencha quando a categoria terminar
       podio: { primeiro: "São Bento", segundo: "São Miguel", terceiro: "" },

       chaves: [
         {
           nome: "Chave A",     // pode omitir quando houver só 1 chave
           classificam: 2,      // opcional: quantas equipes avançam (destaca na tabela)
           // ordem: ["Equipe X", "Equipe Y"],  // opcional: desempate manual (veja abaixo)
           equipes: [
             "São Bento",
             "São Miguel",
             "São Vicente de Paulo 1"
           ],
           jogos: [
             { data: "21/11", hora: "08:00", local: "Quadra 1",
               a: "São Bento", b: "São Miguel", placar: "3x1" },
             { data: "21/11", hora: "09:00", local: "Quadra 1",
               a: "São Bento", b: "São Vicente de Paulo 1", placar: "" }   // "" = ainda não jogou
           ]
         },
         {
           nome: "Chave B",
           equipes: [ ... ],
           jogos: [ ... ]
         }
       ],

       // Opcional: mata-mata. Aqui os nomes podem ser texto livre
       // (ex.: "1º Chave A") até as equipes serem definidas.
       fasesFinais: [
         { fase: "Semifinais", jogos: [
             { data: "22/11", hora: "13:00", local: "Quadra 1",
               a: "1º Chave A", b: "2º Chave B", placar: "" },
             { data: "22/11", hora: "14:00", local: "Quadra 1",
               a: "1º Chave B", b: "2º Chave A", placar: "" }
         ]},
         { fase: "Final", jogos: [
             { data: "22/11", hora: "16:00", local: "Quadra 1",
               a: "Vencedor SF1", b: "Vencedor SF2", placar: "", penaltis: "" }
         ]}
       ]
     }

   CAMPOS DE UM JOGO
     data, hora, local  -> opcionais (aparecem se preenchidos)
     num                -> opcional: número do jogo na tabela oficial (aparece como "Jogo 12")
     a, b               -> as duas equipes (obrigatório)
     placar             -> "3x1" (aceita "3 x 1", "3-1"). Vazio = não jogou.
     penaltis           -> opcional, para mata-mata decidido nos pênaltis: "4x3"
     obs                -> opcional, texto curto (ex.: "W.O.", "Adiado")
     rodada             -> opcional, número/nome para agrupar os jogos (ex.: 1, "Rodada 1")

   DESEMPATE MANUAL (campo "ordem" da chave)
     A ordem de classificação segue os critérios abaixo em
     JJC_TABELAS_CONFIG.  Se duas equipes empatarem em TODOS os
     critérios, o site avisa em ?conferir=1 e você decide a posição
     com  ordem: ["Quem fica na frente", "Quem fica atrás"].

   COMO ATUALIZAR DURANTE O EVENTO
     1. Abra este arquivo, ache o jogo e preencha  placar: "2x0".
     2. Salve e publique o arquivo. Pronto: a classificação se recalcula.
   ================================================================== */


/* Texto "Atualizado em ..." mostrado no topo da página. Deixe "" para ocultar. */
const JJC_TABELAS_META = {
  atualizadoEm: ""          // ex.: "21/11 às 15h30"
};


/* ------------------------------------------------------------------
   REGRAS DE PONTUAÇÃO E DESEMPATE POR MODALIDADE
   Os regulamentos deixam estes critérios a cargo da organização.
   Ajuste aqui quando forem definidos — vale para todas as tabelas
   da modalidade.

   pontos   -> pontos por vitória / empate / derrota
   empate   -> true se a modalidade admite empate na fase de grupos
               (esconde a coluna "E" quando false)
   placar   -> nomes das colunas (Pró / Contra / Saldo) conforme o
               que se conta: gols, sets, pontos...
   desempate-> ordem dos critérios, do primeiro ao último:
               "pontos", "vitorias", "saldo", "pro", "contra"
   ------------------------------------------------------------------ */
const JJC_TABELAS_CONFIG = {

  futsal: {
    empate: true,
    pontos: { vitoria: 3, empate: 1, derrota: 0 },
    placar: { pro: "GP", contra: "GC", saldo: "SG", legenda: "GP = gols pró · GC = gols contra · SG = saldo de gols" },
    // ordem do Índice Técnico (TABELA_DO_FUTSAL.pdf): pontos, vitórias, saldo de gols,
    // menos gols contra. Depois: menos vermelhos, menos amarelos e sorteio (use  ordem: [...]  na chave).
    desempate: ["pontos", "vitorias", "saldo", "contra"]
  },

  volei: {
    empate: false,
    pontos: { vitoria: 3, empate: 0, derrota: 0 },
    placar: { pro: "SP", contra: "SC", saldo: "SS", legenda: "SP = sets pró · SC = sets contra · SS = saldo de sets" },
    desempate: ["pontos", "vitorias", "saldo", "pro"]
  },

  queimada: {
    empate: false,
    pontos: { vitoria: 3, empate: 0, derrota: 0 },
    placar: { pro: "PP", contra: "PC", saldo: "SP", legenda: "PP = pontos pró (queimados) · PC = pontos contra · SP = saldo de pontos" },
    desempate: ["pontos", "vitorias", "saldo", "pro"]
  },

  mesa: {
    // Conforme a planilha do Torneio de Tênis de Mesa Adulto (todos contra todos):
    // vitória = 2 pontos, derrota = 0; desempate por saldo e, persistindo, por
    // confronto direto (use  ordem: [...]  na chave) ou ordem alfabética.
    empate: false,
    pontos: { vitoria: 2, empate: 0, derrota: 0 },
    placar: { pro: "JP", contra: "JC", saldo: "SJ", legenda: "JP = jogos pró · JC = jogos contra · SJ = saldo de jogos (os placares são em jogos/sets vencidos na partida)" },
    desempate: ["pontos", "saldo"]
  }

};


/* ------------------------------------------------------------------
   AS TABELAS
   Cada modalidade começa vazia: as categorias aparecem no site como
   "Tabela em breve" até você cadastrar a tabela aqui dentro.
   ------------------------------------------------------------------ */
/* Local usado nos jogos de futsal (troque aqui para mudar em todos) */
const JJC_QUADRA = "Quadra Escola Jean Piaget";

const JJC_TABELAS = {

  futsal: [

    /* Origem: TABELA_DO_FUTSAL_2.pdf (coordenadores: Fleukes e Juliano).
       Todos os jogos: Quadra Escola Jean Piaget. Sáb 21/11 e Dom 22/11,
       manhã às 8h e tarde às 13h. O número de cada jogo (num) é o da tabela oficial. */

    /* ============ FUTSAL · ADULTO · MASCULINO ============ */
    {
      faixa: "adulto",
      genero: "masculino",
      observacao: "Fase classificatória em 3 grupos (A, B e C), em turno único. Classificam-se para as semifinais o 1º de cada grupo e o melhor 2º lugar pelo Índice Técnico (nos grupos maiores, são desconsiderados os resultados contra o último colocado de cada grupo).",
      chaves: [
        {
          nome: "Grupo A",
          classificam: 1,
          equipes: [
            "Santo Expedito 2",
            "São Miguel",
            "São Vicente de Paulo 1"
          ],
          jogos: [
            { num: 10, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "São Miguel", b: "Santo Expedito 2", placar: "" },
            { num: 15, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "São Vicente de Paulo 1", b: "Santo Expedito 2", placar: "" },
            { num: 21, data: "Dom 22/11", hora: "8h", local: JJC_QUADRA, a: "São Miguel", b: "São Vicente de Paulo 1", placar: "" }
          ]
        },
        {
          nome: "Grupo B",
          classificam: 1,
          equipes: [
            "Nossa Senhora Aparecida 2",
            "Santo Expedito 1",
            "São Bento",
            "São Paulo"
          ],
          jogos: [
            { num: 11, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "São Bento", b: "São Paulo", placar: "" },
            { num: 13, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 2", b: "Santo Expedito 1", placar: "" },
            { num: 17, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 2", b: "São Bento", placar: "" },
            { num: 20, data: "Dom 22/11", hora: "8h", local: JJC_QUADRA, a: "Santo Expedito 1", b: "São Paulo", placar: "" },
            { num: 22, data: "Dom 22/11", hora: "8h", local: JJC_QUADRA, a: "São Bento", b: "Santo Expedito 1", placar: "" },
            { num: 23, data: "Dom 22/11", hora: "8h", local: JJC_QUADRA, a: "São Paulo", b: "Nossa Senhora Aparecida 2", placar: "" }
          ]
        },
        {
          nome: "Grupo C",
          classificam: 1,
          equipes: [
            "Nossa Senhora Aparecida 1",
            "Nossa Senhora Aparecida 4",
            "São Vicente de Paulo 2"
          ],
          jogos: [
            { num: 14, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "São Vicente de Paulo 2", b: "Nossa Senhora Aparecida 4", placar: "" },
            { num: 19, data: "Dom 22/11", hora: "8h", local: JJC_QUADRA, a: "São Vicente de Paulo 2", b: "Nossa Senhora Aparecida 1", placar: "" },
            { num: 24, data: "Dom 22/11", hora: "8h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 4", b: "Nossa Senhora Aparecida 1", placar: "" }
          ]
        }
      ],
      fasesFinais: [
        { fase: "Semifinais", jogos: [
          { num: 25, data: "Dom 22/11", hora: "13h", local: JJC_QUADRA, a: "1º Grupo A", b: "2º Gr. B ou C / 1º Gr. C", placar: "", obs: "Melhor 2º lugar pelo Índice Técnico" },
          { num: 26, data: "Dom 22/11", hora: "13h", local: JJC_QUADRA, a: "1º Grupo B", b: "1º Gr. C ou 2º Gr. A", placar: "", obs: "Melhor 2º lugar pelo Índice Técnico" }
        ]},
        { fase: "Final", jogos: [
          { num: 30, data: "Dom 22/11", hora: "13h", local: JJC_QUADRA, a: "Vencedor do Jogo 25", b: "Vencedor do Jogo 26", placar: "", penaltis: "" }
        ]}
      ]
    },

    /* ============ FUTSAL · JUVENIL · MASCULINO ============ */
    {
      faixa: "juvenil",
      genero: "masculino",
      observacao: "Grupo único, todos contra todos. Classificam-se para a final o 1º e o 2º lugar do grupo.",
      chaves: [
        {
          classificam: 2,
          equipes: [
            "Nossa Senhora Aparecida 1",
            "Nossa Senhora Aparecida 2",
            "Santo Expedito",
            "São Bento"
          ],
          jogos: [
            { num: 2, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "São Bento", b: "Nossa Senhora Aparecida 1", placar: "" },
            { num: 3, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 2", b: "Santo Expedito", placar: "" },
            { num: 5, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 2", b: "São Bento", placar: "" },
            { num: 6, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Santo Expedito", b: "Nossa Senhora Aparecida 1", placar: "" },
            { num: 8, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "São Bento", b: "Santo Expedito", placar: "" },
            { num: 9, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 1", b: "Nossa Senhora Aparecida 2", placar: "" }
          ]
        }
      ],
      fasesFinais: [
        { fase: "Final", jogos: [
          { num: 29, data: "Dom 22/11", hora: "13h", local: JJC_QUADRA, a: "1º colocado", b: "2º colocado", placar: "", penaltis: "" }
        ]}
      ]
    },

    /* ============ FUTSAL · INFANTIL · MASCULINO ============ */
    {
      faixa: "infantil",
      genero: "masculino",
      observacao: "Grupo único, todos contra todos. Classificam-se para a final o 1º e o 2º lugar do grupo.",
      chaves: [
        {
          classificam: 2,
          equipes: [
            "Nossa Senhora Aparecida 1",
            "Nossa Senhora Aparecida 2",
            "Santo Expedito"
          ],
          jogos: [
            { num: 1, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 2", b: "Nossa Senhora Aparecida 1", placar: "" },
            { num: 4, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Nossa Senhora Aparecida 2", b: "Santo Expedito", placar: "" },
            { num: 7, data: "Sáb 21/11", hora: "8h", local: JJC_QUADRA, a: "Santo Expedito", b: "Nossa Senhora Aparecida 1", placar: "" }
          ]
        }
      ],
      fasesFinais: [
        { fase: "Final", jogos: [
          { num: 28, data: "Dom 22/11", hora: "13h", local: JJC_QUADRA, a: "1º colocado", b: "2º colocado", placar: "", penaltis: "" }
        ]}
      ]
    },

    /* ============ FUTSAL · ADULTO · FEMININO ============ */
    {
      faixa: "adulto",
      genero: "feminino",
      observacao: "Duas equipes: os Jogos 12 e 16 são as duas primeiras partidas. O Jogo 27, considerado partida final, só será realizado se necessário.",
      chaves: [
        {
          equipes: [
            "Santo Expedito 1",
            "Santo Expedito 2"
          ],
          jogos: [
            { num: 12, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "Santo Expedito 1", b: "Santo Expedito 2", placar: "" },
            { num: 16, data: "Sáb 21/11", hora: "13h", local: JJC_QUADRA, a: "Santo Expedito 1", b: "Santo Expedito 2", placar: "" }
          ]
        }
      ],
      fasesFinais: [
        { fase: "Final", jogos: [
          { num: 27, data: "Dom 22/11", hora: "13h", local: JJC_QUADRA, a: "Santo Expedito 1", b: "Santo Expedito 2", placar: "", penaltis: "", obs: "Só será realizado se necessário" }
        ]}
      ]
    }

  ],

  volei: [

    /* ============ VÔLEI · ADULTO · FEMININO ============
       Chave única, todos contra todos (3 jogos por equipe, 6 jogos no total).
       Origem: tabela_torneio_voleibol_chave_unica.pdf. Sem data/hora/local na tabela:
       acrescente em cada jogo quando a organização definir (data, hora, local).
       Placar em SETS: ex.  "2x1"  (no painel, lance os pontos de cada set). */
    {
      faixa: "adulto",
      genero: "feminino",
      observacao: "Chave única, todos contra todos: cada equipe disputa 3 partidas (6 jogos no total). A classificação final define as colocações.",
      chaves: [
        {
          equipes: [
            "Nossa Senhora Aparecida 1",
            "Nossa Senhora Aparecida 2",
            "São Bento",
            "São Vicente de Paulo"
          ],
          jogos: [
            { rodada: 1, num: 1, a: "Nossa Senhora Aparecida 1", b: "São Vicente de Paulo", placar: "" },
            { rodada: 1, num: 2, a: "Nossa Senhora Aparecida 2", b: "São Bento", placar: "" },
            { rodada: 2, num: 3, a: "Nossa Senhora Aparecida 1", b: "São Bento", placar: "" },
            { rodada: 2, num: 4, a: "São Vicente de Paulo", b: "Nossa Senhora Aparecida 2", placar: "" },
            { rodada: 3, num: 5, a: "Nossa Senhora Aparecida 1", b: "Nossa Senhora Aparecida 2", placar: "" },
            { rodada: 3, num: 6, a: "São Bento", b: "São Vicente de Paulo", placar: "" }
          ]
        }
      ]
    }

  ],

  queimada: [
    // cole aqui as categorias da Queimada
  ],

  mesa: [

    /* ============ TÊNIS DE MESA · ADULTO · MASCULINO ============
       Fase classificatória (todos contra todos, 5 rodadas) e mata-mata
       com os 4 primeiros. Origem: Torneio_Tenis_de_Mesa_Adulto_Todos_contra_Todos.xlsx
       Para lançar um resultado: preencha  placar: "3x1"  (jogos vencidos). */
    {
      jogo: "tenis-de-mesa",
      faixa: "adulto",
      genero: "masculino",
      observacao: "Fase classificatória em pontos corridos (todos contra todos): vitória vale 2 pontos. Os 4 primeiros colocados avançam para as semifinais (1º × 4º e 2º × 3º).",
      chaves: [
        {
          classificam: 4,
          equipes: [
            "Gabriel dos Reis",
            "Kauan Rodrigues da Silva",
            "Walbert Reinan",
            "Ismael Carmo de Olliveira",
            "Kleyson Nascimento",
            "Murilo Romualdo da Silva"
          ],
          jogos: [
              { rodada: 1, a: "Gabriel dos Reis", b: "Murilo Romualdo da Silva", placar: "" },
              { rodada: 1, a: "Kauan Rodrigues da Silva", b: "Kleyson Nascimento", placar: "" },
              { rodada: 1, a: "Walbert Reinan", b: "Ismael Carmo de Olliveira", placar: "" },
              { rodada: 2, a: "Kleyson Nascimento", b: "Gabriel dos Reis", placar: "" },
              { rodada: 2, a: "Ismael Carmo de Olliveira", b: "Murilo Romualdo da Silva", placar: "" },
              { rodada: 2, a: "Walbert Reinan", b: "Kauan Rodrigues da Silva", placar: "" },
              { rodada: 3, a: "Gabriel dos Reis", b: "Ismael Carmo de Olliveira", placar: "" },
              { rodada: 3, a: "Kleyson Nascimento", b: "Walbert Reinan", placar: "" },
              { rodada: 3, a: "Murilo Romualdo da Silva", b: "Kauan Rodrigues da Silva", placar: "" },
              { rodada: 4, a: "Walbert Reinan", b: "Gabriel dos Reis", placar: "" },
              { rodada: 4, a: "Kauan Rodrigues da Silva", b: "Ismael Carmo de Olliveira", placar: "" },
              { rodada: 4, a: "Murilo Romualdo da Silva", b: "Kleyson Nascimento", placar: "" },
              { rodada: 5, a: "Gabriel dos Reis", b: "Kauan Rodrigues da Silva", placar: "" },
              { rodada: 5, a: "Walbert Reinan", b: "Murilo Romualdo da Silva", placar: "" },
              { rodada: 5, a: "Ismael Carmo de Olliveira", b: "Kleyson Nascimento", placar: "" }
          ]
        }
      ],
      fasesFinais: [
        { fase: "Semifinais", jogos: [
          { a: "1º colocado", b: "4º colocado", placar: "" },
          { a: "2º colocado", b: "3º colocado", placar: "" }
        ]},
        { fase: "Final", jogos: [
          { a: "Vencedor da Semifinal 1", b: "Vencedor da Semifinal 2", placar: "" }
        ]}
      ]
    },

    /* ============ TÊNIS DE MESA · JUVENIL · MASCULINO ============
       Só há 1 atleta nesta categoria no chaveamento (Chaveamento_Juvenil.xlsx):
       ele avança por W.O. Se entrarem mais atletas, troque por semifinais/final. */
    {
      jogo: "tenis-de-mesa",
      faixa: "juvenil",
      genero: "masculino",
      observacao: "Apenas um atleta no chaveamento desta categoria: Arthur Schmidt (São Vicente de Paulo) avança por W.O.",
      // podio: { primeiro: "Arthur Schmidt", segundo: "", terceiro: "" },   // libere quando a organização confirmar
      fasesFinais: [
        { fase: "Final", jogos: [
          { a: "Arthur Schmidt", b: "Sem adversário", placar: "", obs: "W.O." }
        ]}
      ]
    },

    /* ============ TÊNIS DE MESA · JUVENIL · FEMININO ============
       2 atletas: disputam direto a final (Chaveamento_Feminino.xlsx). */
    {
      jogo: "tenis-de-mesa",
      faixa: "juvenil",
      genero: "feminino",
      observacao: "Duas atletas inscritas: a disputa é direta, em uma única final.",
      // podio: { primeiro: "", segundo: "", terceiro: "" },   // preencha ao final da partida
      fasesFinais: [
        { fase: "Final", jogos: [
          { a: "Maria Eduarda Nalin", b: "Maria Eduarda P. Costa", placar: "" }
        ]}
      ]
    },

    /* ============ PEBOLIM · ADULTO · MASCULINO ============
       Só há 1 dupla no chaveamento (Chaveamento_Pebolim.xlsx): avança por W.O. */
    {
      jogo: "pebolim",
      faixa: "adulto",
      genero: "masculino",
      observacao: "Apenas uma dupla no chaveamento desta categoria: Allan Henrique / Gabriel Alieve (São Vicente de Paulo) avança por W.O.",
      // podio: { primeiro: "Allan Henrique / Gabriel Alieve", segundo: "", terceiro: "" },   // libere quando a organização confirmar
      fasesFinais: [
        { fase: "Final", jogos: [
          { a: "Allan Henrique / Gabriel Alieve", b: "Sem adversário", placar: "", obs: "W.O." }
        ]}
      ]
    }

  ]

};
