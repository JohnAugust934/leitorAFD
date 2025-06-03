#  leitorAFD - PWA

<p align="center">
  <img src="https://img.shields.io/badge/version-2.1.4-blue?style=for-the-badge" alt="Versão do Projeto">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="Licença MIT">
</p>

## 📖 Descrição

O **Leitor AFD PWA** é uma aplicação web progressiva (PWA) moderna e intuitiva, desenvolvida para rodar inteiramente no frontend (lado do cliente). Sua principal finalidade é permitir que usuários carreguem, visualizem e analisem o conteúdo de Arquivos Fonte de Dados (AFD), formato padrão utilizado por relógios de ponto eletrônicos no Brasil, conforme as especificações da Portaria 1510/2009 e Portaria 671/2021 do MTP.

A aplicação foi projetada com foco na experiência de desktop, oferecendo uma interface limpa, responsiva, com temas escuro e claro, e funcionalidades offline básicas através de Service Workers. Este projeto é uma refatoração completa de uma versão anterior que utilizava PHP no backend, agora reconstruído com tecnologias web modernas para maior portabilidade, performance e facilidade de implantação como um site estático ou PWA.

## ✨ Funcionalidades Principais

* **Upload e Parsing de Arquivos AFD:** Permite o upload de arquivos `.txt` ou `.afd`. O parsing é realizado de forma eficiente no lado do cliente usando Web Workers, garantindo que a interface do usuário permaneça responsiva mesmo com arquivos grandes.
* **Exibição Tabular dos Dados:** Os dados extraídos do AFD (NSR, Código do Evento, Data, Hora, PIS, CRC) são apresentados em uma tabela clara, organizada e de fácil leitura.
* **Busca Dinâmica por Coluna:** Facilidade de buscar e filtrar dados em tempo real diretamente nas colunas da tabela (exceto para a coluna CRC, que é apenas de exibição).
* **Gerenciamento de Arquivo:**
    * Opção para remover o arquivo carregado e limpar a visualização.
    * Botão para limpar todos os filtros de busca aplicados.
* **Temas Escuro e Claro:** Interface com tema escuro como padrão para conforto visual e um botão para alternar para o tema claro. A preferência de tema é salva no `localStorage` do navegador.
* **Botão de Rolagem Inteligente:** Um botão dinâmico aparece quando o conteúdo da tabela é extenso, permitindo rolar rapidamente para o final ou topo da página.
* **Progressive Web App (PWA):**
    * **Instalável:** Pode ser adicionado à área de trabalho (desktop) ou tela inicial (mobile) para acesso rápido como um aplicativo nativo.
    * **Funcionalidade Offline:** Cacheamento dos assets principais da aplicação via Service Worker, permitindo o uso básico mesmo sem conexão com a internet (após o primeiro carregamento).
* **Design Otimizado para Desktop:** Interface pensada para a melhor experiência em telas maiores.
* **Exibição do Nome do Arquivo:** Mostra o nome do arquivo AFD atualmente carregado.
* **Arquivo de Teste:** Link para download de um arquivo AFD de exemplo para facilitar testes e demonstração.
* **Exibição da Versão:** Versão atual da aplicação visível na interface.

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica da aplicação.
* **CSS3:** Estilização moderna, incluindo Variáveis CSS para gerenciamento de temas.
* **JavaScript (ES6+):** Lógica principal da aplicação, manipulação do DOM e interações.
* **Web Workers API:** Para processamento assíncrono de arquivos AFD, evitando bloqueio da thread principal.
* **Service Worker API & PWA Manifest:** Para funcionalidades de Progressive Web App, como cache offline e instalação.

## 🚀 Como Executar (Para Desenvolvimento/Teste Local)

1.  **Pré-requisitos:**
    * Um navegador moderno com suporte a Service Workers (Google Chrome, Mozilla Firefox, Microsoft Edge, etc.).
    * Git (opcional, para clonar o repositório).

2.  **Obtenha os arquivos:**
    * Clone este repositório:
        ```bash
        git clone https://github.com/JohnAugust934/leitorAFD.git
        ```
    * Navegue até a pasta do projeto:
        ```bash
        cd leitorAFD
        ```
    * Ou baixe os arquivos do projeto como ZIP e extraia-os em uma pasta local.

3.  **Sirva os arquivos:**
    * Como esta é uma aplicação puramente frontend, você pode abrir o arquivo `index.html` diretamente no seu navegador.
    * No entanto, para que o Service Worker (e, consequentemente, as funcionalidades PWA como offline) funcione corretamente devido a restrições de segurança e escopo, é **altamente recomendável** servir os arquivos através de um servidor HTTP local. Algumas opções:
        * **VS Code com Live Server:** Se você usa o Visual Studio Code, instale a extensão "Live Server" de Ritwick Dey. Clique com o botão direito no arquivo `index.html` e escolha "Open with Live Server".
        * **Node.js (se instalado):** Navegue até a pasta raiz do projeto no terminal e execute:
            ```bash
            npx serve .
            ```
            Se não tiver o `serve` instalado globalmente, ele será baixado e executado temporariamente.
        * Qualquer outro servidor web estático simples (Python HTTP server, Apache, Nginx, etc.) também funcionará.

4.  **Acesse no Navegador:**
    * Abra o endereço fornecido pelo seu servidor local (ex: `http://127.0.0.1:5500` para Live Server, `http://localhost:3000` para `npx serve`, ou o endereço configurado).

## 📋 Como Usar

1.  **Abra a aplicação** no seu navegador.
2.  **Carregue um Arquivo:** Clique no botão "Selecionar Arquivo" para escolher um arquivo AFD (`.txt` ou `.afd`) do seu computador.
3.  **Nome do Arquivo:** O nome do arquivo selecionado será exibido logo abaixo do botão de seleção.
4.  **Visualização:** O conteúdo do arquivo será processado e exibido na tabela.
5.  **Busca:** Utilize os campos de texto no cabeçalho de cada coluna (exceto "CRC") para filtrar os registros da tabela em tempo real.
6.  **Limpar Busca:** Clique em "Limpar Busca" para remover todos os filtros e reexibir todos os dados do arquivo carregado.
7.  **Remover Arquivo:** Clique em "Remover Arquivo" para limpar a tabela, o nome do arquivo exibido e preparar para um novo upload.
8.  **Alternar Tema:** Use o botão com ícone de lua (🌙) / sol (☀️) no canto superior direito para alternar entre os temas escuro e claro. Sua preferência será lembrada.
9.  **Rolagem Rápida:** Se a tabela contiver muitos registros, um botão (⬇️ / ⬆️) aparecerá no canto inferior direito para rolar rapidamente para o final ou topo da visualização dos dados.

## 📂 Estrutura do Projeto

```
leitorAFD/
├── css/                  # Estilos CSS
│   ├── reset.css         # Normaliza estilos padrão do navegador
│   └── style.css         # Estilos principais da aplicação
├── icons/                # Ícones da aplicação para PWA e favicons
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── favicon.ico
├── js/                   # Scripts JavaScript
│   ├── app.js            # Registra o Service Worker
│   ├── fileWorker.js     # Lógica de parsing do arquivo AFD em background
│   └── script.js         # Lógica principal da interface e interações do usuário
├── AFD00004004330144881.txt # Arquivo AFD de exemplo para testes
├── index.html            # Estrutura principal da página da aplicação
├── manifest.json         # Arquivo de manifesto do Progressive Web App
└── service-worker.js     # Script do Service Worker para cache e funcionalidades offline
```

## ✍️ Autor

* **João Augusto**
* Website: [johnaugust934.com.br](http://johnaugust934.com.br)
* GitHub: [@JohnAugust934](https://github.com/JohnAugust934)

## 📜 Licença

Este projeto é licenciado sob a **Licença MIT**.

Copyright (c) 2024 João Augusto ([johnaugust934.com.br](http://johnaugust934.com.br))

É concedida permissão, gratuitamente, a qualquer pessoa que obtenha uma cópia
deste software e dos arquivos de documentação associados (o "Software"), para negociar
no Software sem restrições, incluindo, sem limitação, os direitos
de usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender
cópias do Software, e permitir que as pessoas a quem o Software é
fornecido o façam, sujeito às seguintes condições:

O aviso de copyright acima e este aviso de permissão devem ser incluídos em todas as
cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU
IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO,
ADEQUAÇÃO A UM PROPÓSITO ESPECÍFICO E NÃO VIOLAÇÃO. EM NENHUM CASO OS
AUTORES OU DETENTORES DOS DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO, DANOS OU OUTRA
RESPONSABILIDADE, SEJA EM UMA AÇÃO DE CONTRATO, DELITO OU DE OUTRA FORMA, DECORRENTE DE,
OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES NO
SOFTWARE.
