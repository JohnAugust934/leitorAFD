<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Usuário</title>
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/styleCriarUsuario.css">
    <link rel="shortcut icon" href="notepad.png" type="image/x-icon">
</head>

<body>
    <h1>Criar Usuário</h1>
    <form id="criarUsuarioForm" action="salvar_usuario.php" method="POST">
        <div>
            <label for="username">Usuário:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div>
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div>
            <label for="role">Tipo de Usuário:</label>
            <select id="role" name="role">
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
            </select>
        </div>
        <div>
            <button type="submit">Criar Usuário</button>
        </div>
    </form>
    <div>
        <button id="backButton">Voltar</button>
    </div>

    <script>
        document.getElementById('backButton').addEventListener('click', function() {
            // Redirecionar o usuário para a página principal com autenticação preservada
            window.location.href = 'leitorafd.php';
        });
    </script>
</body>

</html>