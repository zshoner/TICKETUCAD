<?php
session_start();
header('Content-Type: application/json');
require_once 'conexion.php';

$ticketId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($ticketId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de ticket inválido.']);
    exit;
}

try {
    $sql = "SELECT
                TK.id,
                TK.titulo,
                TK.descripcion,
                TK.fecha_creacion,
                ET.nombre AS estado_nombre,
                PR.nombre AS prioridad_nombre,
                CA.nombre AS categoria_nombre,
                UC.nombre AS creador_nombre,
                UA.nombre AS asignado_nombre
            FROM tickets TK
            LEFT JOIN estados_ticket ET ON TK.estado_id = ET.id
            LEFT JOIN prioridades PR ON TK.prioridad_id = PR.id
            LEFT JOIN categorias CA ON TK.categoria_id = CA.id
            LEFT JOIN usuarios UC ON TK.usuario_id = UC.id
            LEFT JOIN usuarios UA ON TK.asignado_a = UA.id
            WHERE TK.id = :ticket_id
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':ticket_id' => $ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        echo json_encode(['success' => false, 'message' => 'Ticket no encontrado.']);
        exit;
    }

    echo json_encode(['success' => true, 'ticket' => $ticket]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al cargar ticket.']);
}
?>
