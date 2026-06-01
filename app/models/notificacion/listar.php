<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../php/conexion.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'ok'             => false,
        'autenticado'    => false,
        'notificaciones' => [],
        'total'          => 0,
    ]);
    exit;
}

$usuarioId = (int) $_SESSION['usuario_id'];

try {
    $stmt = $pdo->prepare("
        SELECT id, mensaje, fecha
        FROM notificaciones
        WHERE usuario_id = :usuario_id
          AND leido = 0
        ORDER BY fecha DESC, id DESC
        LIMIT 20
    ");
    $stmt->execute([':usuario_id' => $usuarioId]);
    $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok'             => true,
        'autenticado'    => true,
        'notificaciones' => $notificaciones,
        'total'          => count($notificaciones),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok'      => false,
        'message' => 'Error al obtener notificaciones.',
    ]);
}
