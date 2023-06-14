<?php
require_once 'auth.php';
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitor AFD</title>
    <link rel="shortcut icon" href="notepad.png" type="image/x-icon">
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/style.css">

    <!--AUTENTICAÇÃO-->
    <script>
        window.addEventListener('beforeunload', function() {
            // Remover a autenticação ao fechar a página
            fetch('logout.php', {
                method: 'POST',
                credentials: 'same-origin'
            });
        });
    </script>
</head>

<body>
    <!--TITULO-->
    <h1>Leitor AFD</h1>
    <span>Design by:<a href="http://johnaugust934.com.br" target="_blank" rel="noopener noreferrer">João Augusto</a></span>

    <div class="administrador">
        <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') { ?>
            <h2>Administrador</h2>

            <div>
                <h2>Lista de usuários:</h2>
                <button onclick="window.location.href = 'lista_usuarios.php';">Lista</button>
            </div>

            <div>
                <h2>Crie um usuário</h2>
                <button id="createUserButton">+</button>
            </div>
        <?php } ?>
    </div>

    <!--TOPO-->
    <div class="topo">
        <div>
            <h2>Insira seu arquivo AFD:</h2>
            <input class="escolherArquivo" type="file" id="fileInput">
            <button id="removeButton" disabled>Remover Arquivo</button>
        </div>
        <div>
            <h2>Limpar campos de busca:</h2>
            <button id="clearButton">Limpar Busca</button>
        </div>
        <div>
            <h2>Arquivo para teste:</h2>
            <a id="downloadButton" href="" download>Download Arquivo</a>
        </div>
        <div>
            <button id="logoutButton">Sair</button>
        </div>
    </div>

    <!--TABELA-->
    <table id="fileTable">
        <thead>
            <tr>
                <th>
                    LINHAS:
                </th>
                <th>
                    NSR:
                    <div>
                        <input class="search-input" type="text" placeholder="Buscar NSR">
                        <button class="search-button">Pesquisar</button>
                    </div>
                </th>
                <th>
                    CÓDIGO DO EVENTO:
                    <div>
                        <input class="search-input" type="text" placeholder="Buscar Código do Evento">
                        <button class="search-button">Pesquisar</button>
                    </div>
                </th>
                <th>
                    DATA:
                    <div>
                        <input class="search-input" type="text" placeholder="Buscar Data">
                        <button class="search-button">Pesquisar</button>
                    </div>
                </th>
                <th>
                    HORA:
                    <div>
                        <input class="search-input" type="text" placeholder="Buscar Hora">
                        <button class="search-button">Pesquisar</button>
                    </div>
                </th>
                <th>
                    PIS:
                    <div>
                        <input class="search-input" type="text" placeholder="Buscar PIS">
                        <button class="search-button">Pesquisar</button>
                    </div>
                </th>
                <th>
                    CRC:
                    <div>
                        <input class="search-input" type="text" placeholder="Buscar CRC">
                        <button class="search-button">Pesquisar</button>
                    </div>
                </th>
            </tr>
        </thead>
        <tbody>
            <!-- Os dados da tabela serão adicionados dinamicamente -->
        </tbody>
    </table>

    <script>
        document.getElementById('createUserButton').addEventListener('click', function() {
            // Redirecionar o administrador para a página de criar usuário
            window.location.href = 'criar_usuario.php';
        });

        document.getElementById('logoutButton').addEventListener('click', function() {
            // Remover a autenticação ao clicar no botão de sair
            fetch('logout.php', {
                method: 'POST',
                credentials: 'same-origin'
            });
        });

        // Após ler o arquivo e processar os dados, atualize a altura do body
        function updateBodyHeight() {
            var fileTable = document.getElementById('fileTable');
            var fileTableHeight = fileTable.offsetHeight;
            var body = document.body;

            body.style.minHeight = fileTableHeight + 'px';
        }

        // Exemplo de chamada para atualizar a altura do body após ler o arquivo
        // updateBodyHeight();

        // Atualizar a altura do body quando a janela for redimensionada
        window.addEventListener('resize', function() {
            updateBodyHeight();
        });

        // Defina a URL do arquivo no servidor
        var fileURL = 'AFD00004004330144881.txt';

        // Obtenha a referência do botão de download
        var downloadButton = document.getElementById('downloadButton');

        // Defina o atributo href do botão de download
        downloadButton.href = fileURL;
    </script>

    <script src="fileWorker.js"></script>
    <script src="script.js"></script>
</body>

</html>