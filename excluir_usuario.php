<?php
// Verifica se o parâmetro username foi enviado pela URL
if (isset($_GET['username'])) {
    // Obtém o valor do parâmetro username
    $username = $_GET['username'];

    // Conexão com o banco de dados
    $servername = "localhost";
    $dbname = "leitor_afd";
    $dbusername = "root";
    $dbpassword = "";

    $conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

    // Verifica se houve um erro na conexão
    if ($conn->connect_error) {
        die("Falha na conexão com o banco de dados: " . $conn->connect_error);
    }

    // Prepara e executa a consulta de exclusão
    $sql = "DELETE FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();

    // Verifica se a exclusão foi bem-sucedida
    if ($stmt->affected_rows > 0) {
        echo "Usuário excluído com sucesso.";
    } else {
        echo "Falha ao excluir o usuário.";
    }

    // Fecha a conexão com o banco de dados
    $conn->close();
} else {
    echo "Parâmetro username ausente.";
}
?>

<a href="lista_usuarios.php">Voltar para a lista de usuários</a>