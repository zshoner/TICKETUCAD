<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../php/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['ok' => false, 'autenticado' => false]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$id        = (int) ($input['id'] ?? 0);
$usuarioId = (int) $_SESSION['usuario_id'];

if ($id <= 0) {
    echo json_encode(['ok' => false, 'message' => 'ID de notificación inválido.']);
    exit;
}

try {
    $stmt = $pdo->prepare('
        UPDATE notificaciones
        SET leido = 1
        WHERE id = :id
          AND usuario_id = :usuario_id
    ');
    $stmt->execute([
        ':id'         => $id,
        ':usuario_id' => $usuarioId,
    ]);

    echo json_encode([
        'ok'      => true,
        'updated' => $stmt->rowCount() > 0,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error al marcar la notificación.']);
}
