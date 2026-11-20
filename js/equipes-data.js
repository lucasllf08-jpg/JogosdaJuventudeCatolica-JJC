/* ==================================================================
   equipes-data.js
   ------------------------------------------------------------------
   Dados da aba "Equipes" de cada modalidade (ver script.js, seção 8).

   JJC_FAIXAS   -> define, por modalidade, quais faixas etárias existem
                   (na ordem de exibição) e quais grupos aparecem dentro
                   de cada faixa (masculino primeiro, depois feminino,
                   depois misto).

   JJC_EQUIPES  -> equipes/atletas inscritos, vindos da planilha
                   TIMES_JJC. Para ADICIONAR uma equipe, copie um bloco
                   abaixo e ajuste os campos:

                     modalidade : "futsal" | "volei" | "queimada" | "mesa"
                     jogo       : null  (ou "tenis-de-mesa" / "pebolim"
                                  quando modalidade for "mesa")
                     genero     : "masculino" | "feminino" | "misto"
                     faixa      : "infantil" | "juvenil" | "adulto"
                     comunidade : nome da comunidade
                     setor      : setor da comunidade
                     numero     : 1, 2, 3... quando a comunidade tem mais
                                  de um time no mesmo grupo (senão null)
                     atletas    : lista de nomes

   Por privacidade, CPF e data de nascimento NÃO são publicados aqui.
   ================================================================== */

const JJC_FAIXAS = {

  futsal: {
    contagem: "equipes",
    faixas: [
      {
        id: "infantil", nome: "Infantil", idade: "10 a 14 anos",
        grupos: [{ genero: "masculino" }]
      },
      {
        id: "juvenil", nome: "Juvenil", idade: "15 a 17 anos",
        grupos: [{ genero: "masculino" }]
      },
      {
        id: "adulto", nome: "Adulto", idade: "A partir de 18 anos",
        grupos: [{ genero: "masculino" }, { genero: "feminino", obs: "Mais de 17 anos" }]
      }
    ]
  },

  volei: {
    contagem: "equipes",
    faixas: [
      {
        id: "juvenil", nome: "Juvenil", idade: "13 a 17 anos",
        grupos: [{ genero: "masculino", obs: "Areia" }, { genero: "feminino", obs: "Quadra" }]
      },
      {
        id: "adulto", nome: "Adulto", idade: "A partir de 18 anos",
        grupos: [{ genero: "masculino", obs: "Areia" }, { genero: "feminino", obs: "Quadra" }]
      }
    ]
  },

  queimada: {
    contagem: "equipes",
    faixas: [
      {
        id: "infantil", nome: "Infantil", idade: "10 a 14 anos",
        grupos: [{ genero: "misto" }]
      },
      {
        id: "juvenil", nome: "Juvenil", idade: "15 a 17 anos",
        grupos: [{ genero: "misto" }]
      },
      {
        id: "adulto", nome: "Adulto", idade: "A partir de 18 anos",
        grupos: [{ genero: "misto" }]
      }
    ]
  },

  mesa: {
    contagem: "atletas",
    faixas: [
      {
        id: "infantil", nome: "Infantil", idade: "10 a 14 anos",
        grupos: [
          { jogo: "tenis-de-mesa", genero: "masculino" },
          { jogo: "tenis-de-mesa", genero: "feminino" },
          { jogo: "pebolim", genero: "masculino" }
        ]
      },
      {
        id: "juvenil", nome: "Juvenil", idade: "15 a 17 anos",
        grupos: [
          { jogo: "tenis-de-mesa", genero: "masculino" },
          { jogo: "tenis-de-mesa", genero: "feminino" },
          { jogo: "pebolim", genero: "masculino" }
        ]
      },
      {
        id: "adulto", nome: "Adulto", idade: "A partir de 18 anos",
        grupos: [
          { jogo: "tenis-de-mesa", genero: "masculino" },
          { jogo: "tenis-de-mesa", genero: "feminino" },
          { jogo: "pebolim", genero: "masculino" }
        ]
      }
    ]
  }

};

const JJC_EQUIPES = [
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "São Vicente de Paulo",
    setor: "Setor 2 — São Camilo e São Pedro",
    numero: 1,
    atletas: [
      "Carlos Daniel de Oliveira",
      "Cássio David Vieira",
      "Fabricio Guimarães",
      "Gelson Linhares",
      "Gustavo de Souza",
      "Jhonatas Gabryel",
      "Túlio Wenio",
      "Vitor Lucas"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "São Vicente de Paulo",
    setor: "Setor 2 — São Camilo e São Pedro",
    numero: 2,
    atletas: [
      "Allan Henrique",
      "Anderson Ferreira",
      "Esdra Vinnicius",
      "Gabriel Alieve",
      "Henrique Vinicius",
      "João Pedro",
      "Juliano Cézar",
      "Julio Cézar"
    ]
  },
  {
    modalidade: "mesa", jogo: "pebolim", genero: "masculino", faixa: "adulto",
    comunidade: "São Vicente de Paulo",
    setor: "Setor 2 — São Camilo e São Pedro",
    numero: null,
    atletas: [
      "Allan Henrique",
      "Gabriel Alieve"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "feminino", faixa: "juvenil",
    comunidade: "São Vicente de Paulo",
    setor: "Setor 2 — São Camilo e São Pedro",
    numero: null,
    atletas: [
      "Maria Eduarda Nalin"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "masculino", faixa: "juvenil",
    comunidade: "São Vicente de Paulo",
    setor: "Setor 2 — São Camilo e São Pedro",
    numero: null,
    atletas: [
      "Arthur Schmidt"
    ]
  },
  {
    modalidade: "volei", jogo: null, genero: "feminino", faixa: "adulto",
    comunidade: "São Vicente de Paulo",
    setor: "Setor 2 — São Camilo e São Pedro",
    numero: null,
    atletas: [
      "Ana Deise",
      "Marcia Andreia",
      "Juliana Peruzzo",
      "Rosimere Aparecida",
      "Viviane Waterkemper",
      "Iris Cibelle",
      "Aline Schmidt",
      "Valquíria Ferreira"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "juvenil",
    comunidade: "São Bento",
    setor: "Setor 3 — São José, Sagrada e Nazaré",
    numero: null,
    atletas: [
      "Bruno Fonseca",
      "João Pedro Fonseca",
      "Victor Vial",
      "Guilherme Rocha",
      "Carlos Eduardo",
      "Pedro Emanuel",
      "Thalisson Santos",
      "Mateus Rocha",
      "Henrique Coelho"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "São Bento",
    setor: "Setor 3 — São José, Sagrada e Nazaré",
    numero: null,
    atletas: [
      "Jean de Souza",
      "Miguel Earthal",
      "Eduardo Reis",
      "Gabriel Reis",
      "Valdeci Lara",
      "Henrique Nogueira",
      "Luiz Henrique",
      "Antonio Fernando",
      "Kauan Seconeli"
    ]
  },
  {
    modalidade: "queimada", jogo: null, genero: "misto", faixa: "juvenil",
    comunidade: "São Bento",
    setor: "Setor 3 — São José, Sagrada e Nazaré",
    numero: null,
    atletas: [
      "Bruno Fonseca",
      "João Pedro",
      "Vitor Vial",
      "Carlos Eduardo",
      "Gabriel Posmozer",
      "Laisa Cristiny",
      "Cecilia Castilhos",
      "Julia Nycole",
      "Thyfany Souza",
      "Tatiany Cardoso"
    ]
  },
  {
    modalidade: "volei", jogo: null, genero: "feminino", faixa: "adulto",
    comunidade: "São Bento",
    setor: "Setor 3 — São José, Sagrada e Nazaré",
    numero: null,
    atletas: [
      "Inês",
      "Luzia",
      "Irani",
      "Simone",
      "Joana",
      "Danielly",
      "Vânia",
      "Ana Paula"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "masculino", faixa: "adulto",
    comunidade: "São Bento",
    setor: "Setor 3 — São José, Sagrada e Nazaré",
    numero: null,
    atletas: [
      "Gabriel dos Reis",
      "Walbert Reinan"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "São Miguel",
    setor: "Rio Preto, PA e Seringal",
    numero: 1,
    atletas: [
      "Marcelo Souza Inacio",
      "Flavio Alves Quiuqui",
      "Gabriel Pacheco Sanadria",
      "Vitor Jeovane Freitas Campos",
      "Kaue Souza Wutke",
      "Bruno Julião Roque",
      "Diego Ramos"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "masculino", faixa: "adulto",
    comunidade: "São Miguel",
    setor: "Rio Preto, PA e Seringal",
    numero: null,
    atletas: [
      "Kauan Rodrigues da Silva"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "infantil",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 1,
    atletas: [
      "Pedro Jorge de Souza Conradi",
      "Gabriel Felix Souza",
      "Vitor Daniel Oliveira da Costa",
      "Pablo Henrique Gomes da Silva",
      "Rhuan Kruger do Carmo",
      "Heitor Senhorinha Costa"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "infantil",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 2,
    atletas: [
      "Mateus Polisel Gonçalves",
      "Davi Queiroz de Souza",
      "Miguel Queiroz da Silva",
      "Arthur Erthal Carvalho",
      "Oliver Barbosa Puhal",
      "Mateus Campos Barbosa",
      "Marcos Vinicius Guedes Pereira",
      "Willian Fernando M. dos Santos",
      "Maria Rita M. Salvatico"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "juvenil",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 1,
    atletas: [
      "Arthur Brandt Queiroz",
      "Pietro Queiroz da Silva",
      "Yuri Marcelino Ferreira",
      "Antônio Brandt Queiroz",
      "Gustavo Santos"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "juvenil",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 2,
    atletas: [
      "Thalys Davie Cavalcante",
      "Marcos Antonio Cezar",
      "Carlos Eduardo Feitosa",
      "Miguel Meireles Coelho",
      "Matheus Humberto Diehl",
      "Matheus Freitas Ulkowski",
      "Lucas Eduardo Baldres",
      "Arthur Nunes Nascimento"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 1,
    atletas: [
      "Ruan Victor Caetano",
      "Maxwell Nunes dos Santos",
      "Fernando de Araújo Rocha",
      "Alan Carlos da Silva Nascimento",
      "Marcos Roberto Santos de Moura",
      "Carlos A. Almeida Campos",
      "Rafael Trivilin",
      "Alvaro Clistenes da F. Coelho",
      "Sérgio dos Santos",
      "Gabriel Alves Rodrigues"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 2,
    atletas: [
      "Bruno Basilio Davel",
      "Luiz Felipe Guedes da Silva",
      "Leandro Alves Ferreira",
      "Dione Padilha",
      "Flabson dos Santos Luz",
      "João Filipe G. Melhorança",
      "David Alex Souza da Veiga",
      "Jorge Luiz Barbosa Habitzreuter"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 3,
    atletas: [
      "Aquiles Gonçalves Moreira",
      "Hadryan Anarias dos S. Camargo",
      "João Victor Gonçalves Fonseca",
      "Gustavo Teixeira de Souza",
      "Handrey Lucas S. Camargo",
      "Eduardo Roberto dos Santos"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 4,
    atletas: [
      "Daniel Ferreira dos Santos",
      "Paulo Sergio Rocha",
      "Geovane Paulo do Nascimento",
      "Isaac Sales Ferreira",
      "Walteone Rocha",
      "Alex Soares da Silva",
      "Igor Maneiro Inacio"
    ]
  },
  {
    modalidade: "queimada", jogo: null, genero: "misto", faixa: "infantil",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: null,
    atletas: [
      "Mateus Correia Santos",
      "Deriki Serafini",
      "Melissa Victoria Meneses",
      "Leticia Luza da Silva",
      "Nicollas Henrique Hoese",
      "Lucas Polisel Gonsalves",
      "Mateus Polisel Gonsalves",
      "Tayná Ferreira de Souza",
      "Maria Rita Machado Salvatico",
      "Jorge Duval Machado Salvatico"
    ]
  },
  {
    modalidade: "queimada", jogo: null, genero: "misto", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: null,
    atletas: [
      "Jaqueline Pimentel Sampaio",
      "Samuel Rodrigues da Silva",
      "Jheiny Lorena N. Santana",
      "Ana Paula Correia Santos",
      "Ryan Barbosa de Lima",
      "Rodrigo da Silva Schareiler",
      "Roberta Correia Santos"
    ]
  },
  {
    modalidade: "volei", jogo: null, genero: "feminino", faixa: "juvenil",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: null,
    atletas: [
      "Milena Clarindo dos Santos",
      "Yasmin Lamberti Dezan",
      "Sophia Gallo Mendes",
      "Ariane Souza Gonçalves",
      "Nay Larrissa Mendonça Costa",
      "Alice Soares de Matos",
      "Beatriz Coutinho M dos Santos",
      "Daniely Marques da Mota"
    ]
  },
  {
    modalidade: "volei", jogo: null, genero: "feminino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 1,
    atletas: [
      "Samantha Candido M. da Silva",
      "Maria Eduarda S. Miranda",
      "Kamilly Guarnier da Silva",
      "Ana Carolina Marinho da Cruz",
      "Pyetra Panaro",
      "Emilly Mayara Rodrigues Raasch"
    ]
  },
  {
    modalidade: "volei", jogo: null, genero: "feminino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: 2,
    atletas: [
      "Luciene Santana dos Santos",
      "Ariane de Almeida Landim",
      "Samili dos Santos Soares",
      "Tamila Ribeiro Cavalcante",
      "Maria Aparecida Mendes Soares",
      "Aline Lara da Cruz",
      "Marluce Santana dos Santos"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "masculino", faixa: "adulto",
    comunidade: "Nossa Senhora Aparecida",
    setor: "Setor 1 — Matriz e São Francisco",
    numero: null,
    atletas: [
      "Kleyson Nascimento",
      "Murilo Romualdo da Silva"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "São Paulo",
    setor: "Linha São Paulo, Nova Esperança e São Sebastião",
    numero: 1,
    atletas: [
      "Lucas Gotardo do Valle",
      "Rodrigo da Silva Schreiber",
      "Wilson Rando Borratto",
      "Edson Barbosa do Nascimento",
      "Bruno Gotardo do Valle",
      "Rubson Ribeiro Roro",
      "Marcelo dias da Silva",
      "Gustavo Sena Valle"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "infantil",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: 1,
    atletas: [
      "Rual Kézio Ferreira Soares",
      "Victor Eduardo C. Neizel",
      "Ruan Kaio Ferreira",
      "Theo Nunes da Silva",
      "Gabriel Meireles Coelho",
      "Gabriel Lara",
      "Erik Kauan G. da Costa"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "juvenil",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: 1,
    atletas: [
      "Renan Gabrete de Carvalho",
      "Thalysson Diego Borges Gonçalves",
      "Rhian Lucas Sartor Guedes",
      "José Henrique Mota Aragão",
      "Lucas Lara Fonseca",
      "Victor Miguel Luz Seconelli",
      "Luan Michelin Duarte"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: 1,
    atletas: [
      "Adriano Aragão de Souza",
      "Odair Queiroz Lara",
      "Ronaldo Barbosa de Carvalho",
      "Tiago Juvêncio Waiandt",
      "Marcelo Lara Rodrigues",
      "Rubens Lara Rodrigues",
      "Héliton Goldner Miranda",
      "Ivanildo Lima de Almeida"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "masculino", faixa: "adulto",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: 2,
    atletas: [
      "Davi Motta Costa",
      "Lucas Motta Costa",
      "Pedro Henrique Ferreira Peres",
      "Elismar José da Costa",
      "Felipe de Amorim de OLiveira",
      "Davi Rodrigues de Oliveira",
      "Agnaldo Campos Moura"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "feminino", faixa: "adulto",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: 1,
    atletas: [
      "Valéria Oliveira Silva",
      "Juselma Ferreira Motta",
      "Rosivania Aparecida Motta",
      "Ana Carolina Schlillo F.",
      "Iloci Pires",
      "Pamela Schliwe Ferreira",
      "Jéssicaline Moura Campos",
      "Camily V. Soares Bezerra",
      "Aline Raasch"
    ]
  },
  {
    modalidade: "futsal", jogo: null, genero: "feminino", faixa: "adulto",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: 2,
    atletas: [
      "Adriely Naine Mota Aragão",
      "Edivânia Mota",
      "Erika Santos Sartor da Silva",
      "Rafaela Krofke MIranda",
      "Thajaiane Queiros Aguiar",
      "Andrieli Jacobsen Jacob",
      "Janaina Ferreira da Costa"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "masculino", faixa: "adulto",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: null,
    atletas: [
      "Ismael Carmo de Olliveira"
    ]
  },
  {
    modalidade: "mesa", jogo: "tenis-de-mesa", genero: "feminino", faixa: "juvenil",
    comunidade: "Santo Expedito",
    setor: "Nossa Senhora da Abadia",
    numero: null,
    atletas: [
      "Maria Eduarda P. Costa"
    ]
  }
];
