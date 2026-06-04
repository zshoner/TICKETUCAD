<?php
require_once 'conexion.php';
header('Content-Type: application/json');

$ticket_id = $_POST['ticket_id'] ?? null;
// Cambia a estado de cerrado
$estado_cerrado_id = 3; 

if (!$ticket_id) {
    echo json_encode(["success" => false, "message" => "ID de ticket no proporcionado."]);
    exit;
}

try {
    // Actualizamos el estado, la fecha de actualización Y la fecha de finalizado
    $sql = "UPDATE tickets 
            SET estado_id = :estado_id, 
                fecha_actualizacion = NOW(), 
                fecha_finalizado = NOW() 
            WHERE id = :ticket_id";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':estado_id' => $estado_cerrado_id,
        ':ticket_id' => $ticket_id
    ]);

    echo json_encode([
        "success" => true, 
        "message" => "Ticket cerrado con éxito.",
        "estado_nombre" => "Cerrado"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>