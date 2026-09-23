/* ==================================================================
   data.js
   ------------------------------------------------------------------
   Fonte única de dados do portal dos Jogos da Juventude Católica (JJC).

   Este arquivo concentra TODAS as informações editáveis do site:
   datas, locais, categorias, programação, regulamento, premiação,
   equipes e atletas de cada modalidade, além de informações gerais
   do evento (alojamento, café da manhã etc.).

   Para adicionar uma NOVA EQUIPE, basta inserir um novo objeto dentro
   do array "equipes" da modalidade correspondente — nenhuma alteração
   de HTML/CSS é necessária.

   As páginas (futsal.html, volei.html, queimada.html, mesa.html,
   equipe.html, regulamentos.html) leem este arquivo dinamicamente via
   JavaScript (ver script.js). As inscrições de equipes são feitas
   presencialmente, através do responsável de cada setor/comunidade —
   o site não tem mais formulário de inscrição online.

   Este arquivo também foi projetado para ser facilmente substituído
   futuramente por uma chamada de API/banco de dados: basta popular o
   objeto global JJC_DATA com a mesma estrutura vinda do backend.
   ================================================================== */

const JJC_DATA = {

  /* ================= FUTSAL ================= */
  futsal: {
    slug: "futsal",
    nome: "Futsal",
    slogan: "Velocidade, técnica e espírito de equipe dentro de quadra.",
    descricaoCurta:
      "Times das comunidades se enfrentam em partidas rápidas e eletrizantes de futsal.",

    imagem:
      "https://placehold.co/1200x800/0A3A40/EAF9FA?text=Futsal+JJC",

    imagemCard: "../img/futsal.jpg",
    regulamento: "Categorias, limite de atletas e critérios de disputa no JJC.",

    // Inscrição agora é feita direto no site, pré-selecionando a modalidade
    regulamentoPdf: "../pdf/regulamento_futsal.pdf",

    limiteAtletas: 8,

    sobre:
      "O Futsal é uma das modalidades mais tradicionais dos Jogos da Juventude Católica (JJC), reunindo equipes formadas pelas comunidades da Paróquia Nossa Senhora Aparecida. O JJC é um evento fechado, destinado exclusivamente à comunidade católica, e o Futsal reforça esse propósito por meio da convivência, da evangelização e do fortalecimento dos laços entre os jovens e adultos participantes. Cada equipe pode ter no máximo 8 atletas.",

    infoGerais: {
      data: "20 a 22 de novembro de 2026",
      horario: "A definir",
      local: "A definir"
    },

    categorias: [
      "Infantil Masculino (10 a 14 anos)",
      "Juvenil Masculino (15 a 17 anos)",
      "Adulto Masculino (Mais de 18 anos)",
      "Adulto Feminino (Mais de 17 anos)"
    ],

    programacao: [
      { hora: "A definir", evento: "Abertura oficial e oração inicial" },
      { hora: "A definir", evento: "Início dos jogos da fase de grupos" },
      { hora: "A definir", evento: "Semifinais" },
      { hora: "A definir", evento: "Final e premiação" }
    ],


    premiacao: {
      geral: [
        "1º Lugar - Troféu + Medalhas",
        "2º Lugar - Troféu + Medalhas"
      ],
      extras: []
    },

    faq: [
      {
        pergunta: "Quem pode se inscrever no Futsal?",
        resposta:
          "O JJC é um evento fechado, exclusivo para a comunidade católica da Paróquia Nossa Senhora Aparecida, respeitando as categorias e faixas etárias estabelecidas no regulamento."
      },
      {
        pergunta: "Quantos atletas por equipe?",
        resposta:
          "Cada equipe pode ter no máximo 8 atletas, entre titulares e reservas."
      },
      {
        pergunta: "Como faço a inscrição da minha equipe?",
        resposta:
          "As inscrições são feitas presencialmente. Procure o responsável do seu setor/comunidade para inscrever sua equipe."
      }
    ],
  },

  /* ================= VÔLEI ================= */
  volei: {
    slug: "volei",
    nome: "Vôlei",
    slogan: "Levante, ataque e defenda com fé e determinação.",
    descricaoCurta:
      "Vôlei feminino de quadra e masculino de areia, disputados com técnica e comunhão.",

    imagem:
      "https://placehold.co/1200x800/0A3A40/EAF9FA?text=V%C3%B4lei+JJC",

    imagemCard: "../img/volei.jpg",
    regulamento: "Categorias, limite de atletas e critérios de disputa no JJC.",

    regulamentoPdf: "../pdf/regulamento_volei.pdf",

    // O limite de atletas muda por categoria neste esporte — veja
    // "limitesPorCategoria" abaixo. O campo geral fica como referência.
    limiteAtletas: null,
    limitesPorCategoria: {
      "Feminino - Quadra": 8,
      "Masculino - Areia": 6
    },

    sobre:
      "O Vôlei nos Jogos da Juventude Católica (JJC) reúne equipes das comunidades da Paróquia Nossa Senhora Aparecida. A modalidade feminina será disputada em quadra (até 8 atletas por equipe) e a masculina em areia (até 6 atletas por equipe). Assim como as demais modalidades do JJC, a participação é exclusiva para a comunidade católica.",

    infoGerais: {
      data: "20 a 22 de novembro de 2026",
      horario: "A definir",
      local: "Jerris (local a confirmar)"
    },

    categorias: [
      "Feminino - Quadra",
      "Masculino - Areia"
    ],

    programacao: [
      { hora: "A definir", evento: "Abertura oficial e oração inicial" },
      { hora: "A definir", evento: "Fase de grupos" },
      { hora: "A definir", evento: "Semifinais" },
      { hora: "A definir", evento: "Final e premiação" }
    ],


    premiacao: {
      geral: [
        "1º Lugar - Troféu + Medalhas",
        "2º Lugar - Troféu + Medalhas"
      ],
      extras: []
    },

    faq: [
      {
        pergunta: "Por que o feminino é em quadra e o masculino em areia?",
        resposta: "Definição da organização para esta edição do JJC, conforme decisão da reunião geral."
      },
      {
        pergunta: "Quantos atletas por equipe?",
        resposta: "Feminino (quadra): até 8 atletas. Masculino (areia): até 6 atletas."
      }
    ],

  },

  /* ================= QUEIMADA ================= */
  queimada: {
    slug: "queimada",
    nome: "Queimada",
    slogan: "Agilidade, mira e muita diversão entre as comunidades.",
    descricaoCurta:
      "Equipes mistas se enfrentam em partidas animadas de queimada.",

    imagem:
      "https://placehold.co/1200x800/0A3A40/EAF9FA?text=Queimada+JJC",

    imagemCard: "../img/queimada.jpg",
    regulamento: "Categorias, limite de atletas e critérios de disputa no JJC.",

    regulamentoPdf: "../pdf/regulamento_queimada.pdf",

    limiteAtletas: 12,

    sobre:
      "A Queimada é uma das modalidades mais animadas dos Jogos da Juventude Católica (JJC), reunindo equipes mistas das comunidades da Paróquia Nossa Senhora Aparecida em partidas descontraídas, com no máximo 12 atletas por equipe. A divisão entre categorias Infantil e Adulto ainda está sendo confirmada pela organização.",

    infoGerais: {
      data: "20 a 22 de novembro de 2026",
      horario: "A definir",
      local: "A definir"
    },

    categorias: [
      "Misto"
    ],

    programacao: [
      { hora: "A definir", evento: "Abertura oficial e oração inicial" },
      { hora: "A definir", evento: "Fase de grupos" },
      { hora: "A definir", evento: "Semifinais" },
      { hora: "A definir", evento: "Final e premiação" }
    ],


    premiacao: {
      geral: [
        "1º Lugar - Troféu + Medalhas",
        "2º Lugar - Troféu + Medalhas"
      ],
      extras: []
    },

    faq: [
      {
        pergunta: "As equipes precisam ser mistas?",
        resposta: "Sim, a categoria da Queimada nos JJC é Misto."
      },
      {
        pergunta: "Quantos atletas por equipe?",
        resposta: "No máximo 12 atletas por equipe."
      },
      {
        pergunta: "Vai ter categoria Infantil e Adulto separadas?",
        resposta: "Ainda está sendo confirmado pela organização junto ao responsável da modalidade. Assim que definido, atualizaremos esta página."
      }
    ],
  },

  /* ================= JOGOS DE MESA ================= */
  mesa: {
    slug: "mesa",
    nome: "Jogos de Mesa",
    slogan: "Estratégia, concentração e diversão em cada partida.",
    descricaoCurta:
      "Tênis de Mesa e Pebolim reúnem os participantes em disputas rápidas, estratégicas e descontraídas.",

    imagem:
      "https://placehold.co/1200x800/0A3A40/EAF9FA?text=Jogos+de+Mesa+JJC",

    imagemCard: "../img/mesa.png",
    regulamento: "Categorias, limite de atletas e critérios de disputa no JJC.",

    regulamentoPdf: "../pdf/regulamento_jogos_mesa.pdf",

    limiteAtletas: null, // ainda não definido

    sobre:
      "Os Jogos de Mesa fazem parte dos Jogos da Juventude Católica (JJC), reunindo participantes em disputas de Tênis de Mesa e Pebolim. As categorias (Masculino, Feminino e Infantil) ainda estão sendo organizadas pela coordenação. A modalidade proporciona momentos de diversão, concentração, estratégia e convivência entre os jovens da comunidade católica da Paróquia Nossa Senhora Aparecida.",

    infoGerais: {
      data: "20 a 22 de novembro de 2026",
      horario: "A definir",
      local: "Paróquia Nossa Senhora Aparecida (local a divulgar)"
    },

    categorias: [
      "Tênis de Mesa",
      "Pebolim"
    ],

    programacao: [
      { hora: "A definir", evento: "Abertura oficial e oração inicial" },
      { hora: "A definir", evento: "Início das disputas de Tênis de Mesa" },
      { hora: "A definir", evento: "Início das disputas de Pebolim" },
      { hora: "A definir", evento: "Finais e premiação" }
    ],


    premiacao: {
      geral: [
        "1º Lugar - Troféu + Medalhas",
        "2º Lugar - Troféu + Medalhas"
      ],
      extras: []
    },

    faq: [
      {
        pergunta: "Quais modalidades fazem parte dos Jogos de Mesa?",
        resposta: "Tênis de Mesa e Pebolim."
      },
      {
        pergunta: "As categorias já estão definidas?",
        resposta: "A organização está trabalhando com a proposta de categorias Masculino, Feminino e Infantil, mas isso ainda será confirmado e atualizado aqui."
      },
      {
        pergunta: "Como faço minha inscrição?",
        resposta: "As inscrições são feitas presencialmente. Procure o responsável do seu setor/comunidade para inscrever sua equipe."
      }
    ],
  }
};

const JJC_REPRESENTANTES = [

  {
        setor: "Setor 1 — Matriz e São Francisco",
        pessoas: [
            {
                nome: "Bruno Basílio",
                telefone: "6984879224",
                foto: "../img/representantes/bruno-basilio.jpg"
            },
            {
                nome: "Felipe",
                telefone: "6992813728",
                foto: "../img/representantes/felipe.jpg"
            },
            {
                nome: "Aristeu",
                telefone: "6984663285",
                foto: "../img/representantes/aristeu.jpg"
            }
        ]
    },
    
    {
        setor: "Setor 2 — São Camilo e São Pedro",
        pessoas: [
            {
                nome: "Anadeise",
                telefone: "69984574824",
                foto: "../img/representantes/anadeise.jpg"
            },
            {
                nome: "Wanner",
                telefone: "69984214435",
                foto: "../img/representantes/wanner.jpg"
            }
        ]
    },
    
    {
        setor: "Setor 3 — São José, Sagrada e Nazaré",
        pessoas: [
            {
                nome: "Joares",
                telefone: "69984713318",
                foto: "../img/representantes/joares.jpg"
            },
            {
                nome: "Gislaine",
                telefone: "69999540559",
                foto: "../img/representantes/gislaine.jpg"
            },
            {
                nome: "Luiz",
                telefone: "69992093486",
                foto: "../img/representantes/luiz.jpg"
            }
        ]
    },

    {
        setor: "Rio Preto, PA e Seringal",
        pessoas: [
            {
                nome: "Marlon",
                telefone: "6992945547",
                foto: "../img/representantes/marlon.jpg"
            },
            {
                nome: "Hélio",
                telefone: "69992135146",
                foto: "../img/representantes/helio.jpg"
            },
            {
                nome: "Marciano",
                telefone: "6993408499",
                foto: "../img/representantes/marciano.jpg"
            }
        ]
    },

    {
        setor: "Bradesco, São Roque, Rei Davi e Linha 15",
        pessoas: [
            {
                nome: "Simone",
                telefone: "69992057798",
                foto: "../img/representantes/simone.jpg"
            },
            {
                nome: "Márcia Giroto",
                telefone: "69999599924",
                foto: "../img/representantes/marcia-giroto.jpg"
            },
            {
                nome: "Bruno",
                telefone: "6999926759",
                foto: "../img/representantes/bruno.jpg"
            }
        ]
    },

    {
        setor: "Linha São Paulo, Nova Esperança  e São Sebastião",
        pessoas: [
            {
                nome: "Gustavo Valle",
                telefone: "6999529913",
                foto: "../img/representantes/gustavo-valle.jpg"
            },
            {
                nome: "Lucas Gotardo",
                telefone: "6993582849",
                foto: "../img/representantes/lucas-gotardo.jpg"
            },
            {
                nome: "Irineu",
                telefone: "69984992889",
                foto: "../img/representantes/irineu.jpg"
            }
        ]
    },

    

    {
        setor: "Pacarana",
        pessoas: [
            {
                nome: "Rodrigo",
                telefone: "69992958122",
                foto: "../img/representantes/rodrigo.jpg"
            },
            {
                nome: "Carlos",
                telefone: "69992781330",
                foto: "../img/representantes/carlos.jpg"
            },
            {
                nome: "Deleon",
                telefone: "69993731666",
                foto: "../img/representantes/deleon.jpg"
            }
        ]
    },

    {
        setor: "14 de Abril e Canelinha",
        pessoas: [
            {
                nome: "Marcelo",
                telefone: "69993673498",
                foto: "../img/representantes/marcelo.jpg"
            },
            {
                nome: "Joel",
                telefone: "699928333223",
                foto: "../img/representantes/joel.jpg"
            }
        ]
    },

    {
        setor: "Ribeirão",
        pessoas: [
            {
                nome: "Gilmar",
                telefone: "69984586675",
                foto: "../img/representantes/gilmar.jpg"
            },
            {
                nome: "Elaine",
                telefone: "69984516621",
                foto: "../img/representantes/elaine.jpg"
            }
        ]
    }
];

const JJC_EQUIPE = [
    {
        area: "Coordenação Geral",
        nome: "Ludymila",
        telefone: "6992977522",
        foto: "../img/equipe/ludmila.jpg",
        descricao:
            "Responsável pela coordenação geral dos Jogos da Juventude Católica, acompanhando o planejamento e a organização do evento."
    },

    {
        area: "Coordenação Geral",
        nome: "Arthur Teodoro",
        telefone: "6993404617",
        foto: "../img/equipe/arthur.jpg",
        descricao:
            "Atua na organização e no acompanhamento das atividades do JJC, auxiliando na realização do evento."
    },

    {
        area: "Coordenação Geral",
        nome: "Carlos Eduardo",
        telefone: "6992579103",
        foto: "../img/equipe/carlos-eduardo.jpg",
        descricao:
            "Participa da coordenação e organização geral do JJC, contribuindo para o planejamento e mídia do evento."
    }
];

/* ==================================================================
   INFORMAÇÕES GERAIS DO EVENTO
   ------------------------------------------------------------------
   Dados que não pertencem a nenhuma modalidade específica (alojamento,
   café da manhã, participação/identidade do evento). Usado pela home
   (index.html) através de script.js.
   ================================================================== */
const JJC_INFO = {

  identidade: {
    titulo: "Um evento católico, para a comunidade católica",
    texto:
      "O JJC é um evento fechado e exclusivamente católico. Ele faz parte da nossa comunidade e tem como um dos principais objetivos a evangelização por meio do esporte, fortalecendo a fé, a união e a convivência entre os membros da Igreja. A participação é destinada à comunidade católica da Paróquia Nossa Senhora Aparecida, respeitando a proposta e a identidade do JJC."
  },

  regulamentoGeral: {
    titulo: "Regulamento Geral do JJC",
    texto:
      "O Regulamento Geral reúne as normas que valem para todas as modalidades dos Jogos da Juventude Católica: critérios de participação, identidade do evento, conduta esportiva, uso de imagem e demais disposições comuns. Cada modalidade também possui um regulamento específico, com suas próprias categorias, limites de atletas e regras de disputa.",
    pdf: "docs/regulamento-geral.pdf"
  },

};


/* ==================================================================
   Torna os dados acessíveis para os demais scripts do site.
   Também permite utilizar este arquivo em projetos Node.js.
   ================================================================== */

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    JJC_DATA,
    JJC_INFO,
    JJC_REPRESENTANTES,
    JJC_EQUIPE
};
}
