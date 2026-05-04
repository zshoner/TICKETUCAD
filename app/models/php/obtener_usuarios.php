<?php
require_once 'conexion.php';
header('Content-Type: application/json');

// Ajusta "usuarios" si tu tabla se llama distinto
$stmt = $pdo->query("SELECT id, nombre FROM usuarios"); 
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($usuarios);
?>