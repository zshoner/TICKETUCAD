<?php
require_once 'conexion.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT id, nombre FROM estados_ticket"); 
$estados = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($estados);
?>