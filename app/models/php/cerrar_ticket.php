<?php
require_once 'conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['ticket_id'])) {
    echo json_encode(['success' => false, 'message' => 'Solicitud inválida']);
    exit;
}

$ticketId = (int) $_POST['ticket_id'];
if ($ticketId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de ticket inválido']);
    exit;
}

try {
    $sql = "SELECT id, nombre FROM estados_ticket 
            WHERE LOWER(nombre) LIKE '%cerrad%' 
               OR LOWER(nombre) LIKE '%finaliz%'
               OR LOWER(nombre) LIKE '%resuel%'
            ORDER BY id ASC 
            LIMIT 1";
    $row = $pdo->query($sql)->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['success' => false, 'message' => 'No hay un estado de cierre en la base (ej. Cerrado).']);
        exit;
    }

    $upd = $pdo->prepare("UPDATE tickets SET estado_id = ? WHERE id = ?");
    $upd->execute([(int) $row['id'], $ticketId]);

    echo json_encode([
        'success' => true,
        'estado_id' => (int) $row['id'],
        'estado_nombre' => $row['nombre'],
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al cerrar el ticket']);
}
?>
