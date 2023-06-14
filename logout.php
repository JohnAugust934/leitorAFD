<?php
session_start();

// Verifica se o usuário está autenticado
if (isset($_SESSION['authenticated'])) {
    // Remove a autenticação
    unset($_SESSION['authenticated']);
    unset($_SESSION['username']);
}

// Redireciona para a página de login
header('Location: index.php');
exit();
?>