<?php
session_start();
header('Content-Type: application/json');
require_once 'conexion.php';

$ticketId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($ticketId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de ticket inválido.', 'respuestas' => []]);
    exit;
}

try {
    $sql = "SELECT
                C.id,
                C.mensaje,
                C.fecha_creacion,
                U.nombre AS usuario_nombre
            FROM comentarios C
            LEFT JOIN usuarios U ON C.usuario_id = U.id
            WHERE C.ticket_id = :ticket_id
            ORDER BY C.fecha_creacion ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':ticket_id' => $ticketId]);
    $respuestas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'respuestas' => $respuestas]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al cargar respuestas.', 'respuestas' => []]);
}
?>
