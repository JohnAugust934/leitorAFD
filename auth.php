<?php
session_start();

// Verifica se o usuário está autenticado, redireciona para a página de login se não estiver
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Location: index.php');
    exit();
}
?>