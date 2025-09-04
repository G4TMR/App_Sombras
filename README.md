# Sombras do Abismo

### Um sistema de RPG de mesa digital focado em terror, investigação e evolução de personagem.

[![Licença: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

Bem-vindo ao Sombras do Abismo, um universo de RPG de terror onde narrativas intensas e mistérios sombrios aguardam. Este projeto oferece uma plataforma web completa para criar e gerenciar personagens (Agentes) para o sistema, com uma interface interativa e persistência de dados local.

 
*(Sugestão: Substitua o link acima por uma captura de tela do seu projeto)*

---

## 🚀 Sobre o Projeto

# Link do Projeto: https://app-sombras.vercel.app/Home.html

O Sombras do Abismo é uma aplicação web front-end que serve como uma ferramenta de suporte para um sistema de RPG de mesa. Ele guia o usuário através de um assistente de criação de personagem, salva os "Agentes" criados no armazenamento local do navegador e permite a visualização de suas fichas a qualquer momento.

### ✨ Funcionalidades Principais

*   **Wizard de Criação de Agentes**: Um guia passo a passo para criar seu personagem, desde a escolha da classe até a personalização de sua história.
*   **Fichas de Personagem Dinâmicas**: Visualize e gerencie as fichas completas de seus agentes, com todos os atributos, perícias e detalhes.
*   **Persistência Local**: Seus agentes são salvos diretamente no seu navegador usando `localStorage`, garantindo que eles estejam sempre disponíveis no mesmo dispositivo.
*   **Sistema de RPG Rico**: Baseado em classes (Artilheiro, Colosso, Arcanista, Laminante), atributos (Vigor, Agilidade, Intelecto, Presença) e perícias.
*   **Design Responsivo e Temático**: Uma interface sombria e imersiva que se adapta a desktops e dispositivos móveis.
*   **Estrutura Expansível**: Seções prontas para futuras implementações de Campanhas, Bestiário (Ameaças) e conteúdo da comunidade (Homebrew).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando tecnologias web padrão, sem a necessidade de frameworks complexos.

*   !HTML5
*   !CSS3
*   !JavaScript

---

## ⚙️ Como Executar o Projeto

Para visualizar e interagir com o projeto corretamente, é necessário executá-lo a partir de um servidor local. Abrir os arquivos `HTML` diretamente no navegador causará erros no carregamento do menu, pois o projeto utiliza a API `fetch()` para carregar componentes dinamicamente, o que é bloqueado por razões de segurança (CORS) em arquivos locais.

### Pré-requisitos

*   Um navegador web moderno (Chrome, Firefox, Edge, etc.).
*   Git instalado.
*   Visual Studio Code (recomendado).
*   Extensão **Live Server** para o VS Code.

### Passos para Instalação e Execução

1.  **Clone o repositório:**
    ```sh
    git clone https://github.com/G4TMR/App_Sombras.git
    ```

2.  **Abra a pasta do projeto no VS Code:**
    ```sh
    cd App_Sombras
    code .
    ```

3.  **Inicie com o Live Server:**
    *   Com a extensão Live Server instalada, clique com o botão direito no arquivo `index.html`.
    *   Selecione a opção **"Open with Live Server"**.
    *   Seu navegador abrirá automaticamente na página `Home.html`, e o projeto estará totalmente funcional.

---

## 🕹️ Como Usar

1.  Na página inicial, clique em **"Começar Criando um Agente"**.
2.  **Etapa 1**: Escolha uma das classes disponíveis para seu agente.
3.  **Etapa 2**: Distribua seus pontos de atributo e selecione as perícias treinadas. O número de perícias que você pode escolher é definido pelo seu atributo de Intelecto.
4.  **Etapa 3**: Preencha os detalhes do seu personagem, como nome, história e motivação.
5.  Clique em **"Finalizar"** para salvar seu agente.
6.  Você será redirecionado para a página **"Agentes"**, onde poderá ver todos os seus personagens criados.
7.  Clique em **"Acessar Ficha"** em qualquer card de agente para ver a ficha completa.

---

## 📂 Estrutura do Projeto

```
/
├── _header.html        # Componente do cabeçalho, carregado dinamicamente
├── agentes.html        # Página para listar os agentes criados
├── ameacas.html        # Página para o bestiário (WIP)
├── campanhas.html      # Página para gerenciamento de campanhas (WIP)
├── criar-agente.html   # Página do assistente de criação de personagem
├── ficha-agente.html   # Modelo da página de ficha de personagem
├── Home.html           # Página inicial do projeto
├── homebrew.html       # Página para conteúdo da comunidade (WIP)
├── index.html          # Redireciona para a Home.html
├── patente.html        # Página de apoio ao projeto
├── script.js           # Lógica principal da aplicação (criação, exibição, etc.)
├── style.css           # Folha de estilos principal
└── README.md           # Este arquivo
```

---

## 📄 Licença

Este projeto está sob a licença GNU General Public License v3.0. Veja o arquivo LICENSE para mais detalhes.

---

## ❤️ Apoio

Gostou do projeto e quer ajudar? Visite a seção **"Patente"** no site para ver as opções de apoio recorrente ou a página **"Home"** para informações sobre doações pontuais. Todo apoio é muito bem-vindo!