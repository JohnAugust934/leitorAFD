<?php
// Capturar dados do formulário
$username = $_POST['username'];
$password = $_POST['password'];
$role = $_POST['role'];

// Conectar ao banco de dados (mesmo código utilizado anteriormente)
$servername = "localhost";
$dbname = "leitor_afd";
$dbusername = "root";
$dbpassword = "";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dbusername, $dbpassword);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar se o nome de usuário já existe no banco de dados
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        // Nome de usuário já existe, exibir mensagem de erro
        echo "Nome de usuário já está em uso. Por favor, escolha outro nome de usuário.";
    } else {
        // Nome de usuário é único, salvar no banco de dados
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':role', $role);
        $stmt->execute();

        // Gerar o log de evento
        $timezone = new DateTimeZone('America/Sao_Paulo');
        $dateTime = new DateTime('now', $timezone);
        $formattedDateTime = $dateTime->format('d/m/Y H:i:s');

        $logMessage = "Novo usuário criado\n";
        $logMessage .= "Nome do usuário criado: $username\n";
        $logMessage .= "Tipo de usuário criado: $role\n";
        $logMessage .= "Data e hora: $formattedDateTime\n";

        $logFile = 'logs/usuarios_criados.log';
        file_put_contents($logFile, $logMessage, FILE_APPEND);

        // Redirecionar para a página de login após criar o usuário
        header('Location: index.php');
        exit();
    }
} catch(PDOException $e) {
    echo "Erro na conexão com o banco de dados: " . $e->getMessage();
}
?>