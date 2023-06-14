<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitor AFD - Relógios Henry</title>
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/styleIndex.css">
    <link rel="shortcut icon" href="notepad.png" type="image/x-icon">
    <script>
        // Função para exibir o alerta
        function showAlert() {
            var loginError = '<?php echo $loginError; ?>';
            if (loginError) {
                alert(loginError);
            }
        }
    </script>
</head>

<body onload="showAlert()">
    <h1>Login</h1>
    <form id="loginForm" action="login.php" method="POST">
        <div>
            <label for="username">Usuário:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div>
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div>
            <button type="submit">Entrar</button>
        </div>
    </form>
</body>

</html>