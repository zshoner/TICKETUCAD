<?php
require_once 'conexion.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT id, nombre FROM prioridades ORDER BY id");
$prioridades = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($prioridades);
?>
