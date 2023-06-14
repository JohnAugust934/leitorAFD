<?php
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

// Consulta para obter os dados dos usuários
$sql = "SELECT username, role FROM users";
$result = $conn->query($sql);

?>

<table>
    <tr>
        <th>Username</th>
        <th>Tipo</th>
        <th>Ação</th>
    </tr>
    <?php while ($row = $result->fetch_assoc()) : ?>
        <tr>
            <td><?php echo $row['username']; ?></td>
            <td><?php echo $row['role']; ?></td>
            <td><a href="excluir_usuario.php?username=<?php echo $row['username']; ?>">Excluir</a></td>
        </tr>
    <?php endwhile; ?>
</table>

<?php
// Fecha a conexão com o banco de dados
$conn->close();
?>