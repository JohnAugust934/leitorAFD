<?php
session_start();

// Capturar dados de acesso
$username = $_POST['username'];
$password = $_POST['password'];
$ip = $_SERVER['REMOTE_ADDR'];

// Configurar fuso horário para o Brasil
date_default_timezone_set('America/Sao_Paulo');
$timestamp = date('d-m-Y H:i:s');

// Conectar ao banco de dados
$servername = "localhost";
$dbname = "leitor_afd";
$dbusername = "root";
$dbpassword = "";

$loginError = ""; // Variável para armazenar a mensagem de erro de login

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dbusername, $dbpassword);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar se o nome de usuário e senha são válidos
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Autenticação bem-sucedida, definir variáveis de sessão
        $_SESSION['authenticated'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $user['role']; // Armazenar o papel do usuário na sessão

        // Registrar no log de eventos - login bem-sucedido
        $logMessage = "Login bem-sucedido: Usuário: $username, IP: $ip, Horário: $timestamp";
        file_put_contents('logs/login.log', $logMessage . PHP_EOL, FILE_APPEND);

        // Redirecionar para a página principal
        header('Location: leitorafd.php');
        exit();
    } else {
        // Credenciais inválidas, registrar no log de eventos - falha no login
        $logMessage = "Falha no login: Usuário: $username, IP: $ip, Horário: $timestamp";
        file_put_contents('logs/login.log', $logMessage . PHP_EOL, FILE_APPEND);

        // Mensagem de erro de login
        $loginError = "Usuário ou senha incorretos. Por favor, tente novamente.";
    }
} catch (PDOException $e) {
    echo "Erro na conexão com o banco de dados: " . $e->getMessage();
}
?>

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
        // Função para exibir o alerta de erro
        function showErrorAlert() {
            var loginError = '<?php echo $loginError; ?>';
            if (loginError) {
                alert(loginError);
            }
        }

        // Chamando a função para exibir o alerta ao carregar a página
        window.onload = showErrorAlert;
    </script>
</head>

<body>
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