# Leitor AFD PWA

## Descrição

O Leitor AFD PWA é uma aplicação web progressiva (PWA) moderna, desenvolvida para rodar inteiramente no frontend. Ela permite aos usuários carregar, visualizar e analisar o conteúdo de Arquivos Fonte de Dados (AFD), comumente utilizados por relógios de ponto eletrônicos no Brasil. A aplicação foi projetada com foco na experiência de desktop, oferecendo uma interface limpa, tema escuro/claro e funcionalidades offline básicas.

Este projeto é uma refatoração de uma versão anterior que utilizava PHP no backend, agora reconstruído com tecnologias web modernas para maior portabilidade e facilidade de implantação como um site estático ou PWA.

## Funcionalidades Principais

* **Upload e Parsing de Arquivos AFD:** Permite o upload de arquivos `.txt` ou `.afd`. O parsing é feito no lado do cliente usando Web Workers para não bloquear a interface.
* **Exibição Tabular dos Dados:** Os dados do AFD (NSR, Código do Evento, Data, Hora, PIS, CRC) são apresentados em uma tabela clara e organizada.
* **Busca por Coluna:** Facilidade de buscar e filtrar dados diretamente nas colunas da tabela (exceto CRC).
* **Gerenciamento de Arquivo:** Opções para remover o arquivo carregado e limpar os filtros de busca.
* **Temas Escuro e Claro:** Interface com tema escuro como padrão e um botão para alternar para o tema claro, com a preferência salva no `localStorage`.
* **Botão de Rolagem:** Botão dinâmico para rolar rapidamente para o final ou topo da página quando há conteúdo extenso.
* **Progressive Web App (PWA):**
    * Instalável na área de trabalho ou tela inicial.
    * Funcionalidade offline básica através de cache de Service Worker para os assets principais da aplicação.
* **Design Responsivo para Desktop:** Interface otimizada para uso em desktops.
* **Exibição do Nome do Arquivo:** Mostra o nome do arquivo AFD atualmente carregado.
* **Arquivo de Teste:** Link para download de um arquivo AFD de exemplo para testes.

## Tecnologias Utilizadas

* HTML5
* CSS3 (com Variáveis CSS para temas)
* JavaScript (ES6+)
* Web Workers API
* Service Worker API (para PWA e cache)
* PWA Manifest

## Como Executar (Para Desenvolvimento/Teste Local)

1.  **Pré-requisitos:** Um navegador moderno com suporte a Service Workers (Chrome, Firefox, Edge, etc.).
2.  **Obtenha os arquivos:**
    * Clone este repositório: `git clone https://github.com/JohnAugust934/leitorAFD`
    * Ou baixe os arquivos do projeto e extraia-os em uma pasta local.
3.  **Sirva os arquivos:**
    * Como esta é uma aplicação puramente frontend (após a refatoração), você pode simplesmente abrir o arquivo `index.html` diretamente no seu navegador.
    * No entanto, para que o Service Worker funcione corretamente (especialmente em relação ao escopo e segurança), é **altamente recomendável** servir os arquivos através de um servidor HTTP local.
        * Se você tem o Node.js instalado, pode usar `npx serve .` na pasta raiz do projeto.
        * Usuários do VS Code podem usar a extensão "Live Server" (clique com o botão direito no `index.html` e escolha "Open with Live Server").
        * Qualquer outro servidor web estático simples também funcionará.
4.  **Acesse no Navegador:** Abra o endereço fornecido pelo seu servidor local (ex: `http://localhost:8080` ou `http://127.0.0.1:5500`).

## Como Usar

1.  Abra a aplicação no seu navegador.
2.  Clique no botão "Selecionar Arquivo" para carregar um arquivo AFD do seu computador.
3.  O nome do arquivo selecionado será exibido.
4.  O conteúdo do arquivo será processado e exibido na tabela.
5.  Utilize os campos de busca no cabeçalho de cada coluna para filtrar os resultados.
6.  Use o botão "Limpar Busca" para remover os filtros.
7.  Use o botão "Remover Arquivo" para limpar a tabela e selecionar um novo arquivo.
8.  Use o botão com ícone de lua/sol no canto superior direito para alternar entre os temas escuro e claro.
9.  Quando a tabela tiver conteúdo extenso, um botão de rolagem (⬇️/⬆️) aparecerá no canto inferior direito para navegar rapidamente.

## Estrutura do Projeto

```
leitorAFD/
├── css/                  # Estilos CSS
│   ├── reset.css
│   └── style.css
├── icons/                # Ícones da aplicação para PWA
├── js/                   # Scripts JavaScript
│   ├── app.js            # Registra o Service Worker
│   ├── fileWorker.js     # Processa o arquivo AFD
│   └── script.js         # Lógica principal da interface
├── AFD00004004330144881.txt # Arquivo AFD de exemplo
├── index.html            # Página principal da aplicação
├── manifest.json         # Manifesto do PWA
└── service-worker.js     # Lógica de cache e offline do PWA
```

## Licença

(Opcional: Adicione uma licença aqui, como MIT, Apache 2.0, etc. Se não especificado, geralmente é proprietário.)
Exemplo: Este projeto é licenciado sob a Licença MIT - veja o arquivo `LICENSE.md` para detalhes.

---