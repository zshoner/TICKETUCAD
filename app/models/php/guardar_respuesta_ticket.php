<?php
session_start();
header('Content-Type: application/json');
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$ticketId = isset($_POST['ticket_id']) ? (int) $_POST['ticket_id'] : 0;
$mensaje = trim($_POST['mensaje'] ?? '');
$usuarioId = isset($_SESSION['usuario_id']) ? (int) $_SESSION['usuario_id'] : 0;

if ($ticketId <= 0 || $mensaje === '') {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos para guardar respuesta.']);
    exit;
}

if ($usuarioId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Sesión no válida. Inicia sesión nuevamente.']);
    exit;
}

try {
    $verifica = $pdo->prepare("SELECT id FROM tickets WHERE id = :ticket_id LIMIT 1");
    $verifica->execute([':ticket_id' => $ticketId]);
    if (!$verifica->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode(['success' => false, 'message' => 'El ticket no existe.']);
        exit;
    }

    $sql = "INSERT INTO comentarios (ticket_id, usuario_id, mensaje) VALUES (:ticket_id, :usuario_id, :mensaje)";
    $stmt = $pdo->prepare($sql);
    $ok = $stmt->execute([
        ':ticket_id' => $ticketId,
        ':usuario_id' => $usuarioId,
        ':mensaje' => $mensaje
    ]);

    if (!$ok) {
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar la respuesta.']);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Respuesta guardada.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error del servidor al guardar respuesta.']);
}
?>
