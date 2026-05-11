<?php
require_once 'conexion.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT id, nombre FROM categorias ORDER BY nombre");
$categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($categorias);
?>
