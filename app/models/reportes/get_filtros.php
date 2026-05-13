<?php
header('Content-Type: application/json');
require_once(__DIR__ . "/../php/conexion.php");

try {
    $tecnicos = $pdo->query("SELECT id, nombre FROM usuarios WHERE rol_id = 2")->fetchAll(PDO::FETCH_ASSOC);
    $deptos = $pdo->query("SELECT id, nombre FROM departamentos")->fetchAll(PDO::FETCH_ASSOC);
    $estados = $pdo->query("SELECT nombre FROM estados_ticket")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'tecnicos' => $tecnicos,
        'departamentos' => $deptos,
        'estados' => $estados
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}