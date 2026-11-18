# ⚽ Jogos da Juventude Católica (JJC)

> **Evangelizar pelo esporte, unir pela fé.**

Site oficial dos **Jogos da Juventude Católica (JJC)**, evento esportivo e comunitário promovido pela **Paróquia Nossa Senhora Aparecida**, em **Espigão do Oeste – RO**.

🔗 **Acesse o site:** [jogos-da-juventude-catolica-jjc.vercel.app](https://jogos-da-juventude-catolica-jjc.vercel.app)

---

## 📖 Sobre o projeto

O JJC é mais do que uma competição: é um espaço de evangelização por meio do esporte, que une as comunidades paroquiais e incentiva a participação da juventude em um ambiente de fé, superação e convivência fraterna.

O site reúne todas as informações do evento: modalidades, regulamentos, tabelas de jogos, inscrições e a equipe organizadora.

📅 **Data do evento:** 20 a 22 de novembro de 2026

## 🏐 Modalidades

- Futsal
- Vôlei
- Queimada
- Jogos de Mesa

## ✨ Funcionalidades

- Página inicial com apresentação do evento e **contagem regressiva** para o início dos jogos
- Página dedicada para cada modalidade
- Tabelas de jogos
- Página de inscrição / representantes
- Regulamento Geral e regulamentos específicos de cada modalidade
- Página da equipe organizadora
- Layout responsivo, com menu adaptado para celular

## 🛠️ Tecnologias

- **HTML5**
- **CSS3**
- **JavaScript** (vanilla)
- Fonte [Poppins](https://fonts.google.com/specimen/Poppins) (Google Fonts)
- Hospedagem na [Vercel](https://vercel.com)

## 📁 Estrutura do projeto

```
.
├── index.html            # Página inicial
├── regulamentos.html     # Regulamentos do evento
├── html/                 # Páginas internas (modalidades, tabelas, inscrição, equipe)
├── css/                  # Estilos
├── js/                   # Scripts (data.js e script.js)
├── img/                  # Imagens e logos
├── pdf/                  # Documentos em PDF
└── .vscode/              # Configurações do editor
```

## 🚀 Como rodar localmente

Não precisa instalar nada, é um site estático.

1. Clone o repositório:
   ```bash
   git clone https://github.com/lucasllf08-jpg/JogosdaJuventudeCatolica-JJC.git
   ```
2. Entre na pasta:
   ```bash
   cd JogosdaJuventudeCatolica-JJC
   ```
3. Abra o `index.html` no navegador, ou use a extensão **Live Server** do VS Code.

## ✏️ Como atualizar o conteúdo

As modalidades exibidas na página inicial são carregadas dinamicamente pelo `js/script.js` a partir dos dados em `js/data.js`. Para alterar informações do evento, comece por esse arquivo.

A data da contagem regressiva fica no atributo `data-alvo` da div `#contador`, no `index.html`.

## 📬 Contato

Dúvidas? Fale com a gente pelo Instagram:

📸 [@juventudecatolicaeoe](https://instagram.com/juventudecatolicaeoe)

**Paróquia Nossa Senhora Aparecida**
Espigão do Oeste – Rondônia

---

© 2026 – Jogos da Juventude Católica (JJC)