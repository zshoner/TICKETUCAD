<?php
require_once 'conexion.php';
header('Content-Type: application/json');

$ticket_id = $_POST['ticket_id'] ?? null;
$estado_id = $_POST['estado_id'] ?? null;

if (!$ticket_id || !$estado_id) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

try {
    // nombre del estado que seleccionó el usuario
    $stmtEstado = $pdo->prepare("SELECT nombre FROM estados_ticket WHERE id = ?");
    $stmtEstado->execute([$estado_id]);
    $nombreEstado = strtolower($stmtEstado->fetchColumn() ?: '');

    //Evaluamos si es un estado de finalización (Resuelto, Cerrado, Finalizado)
    $esFinalizado = (
        strpos($nombreEstado, 'resuel') !== false || 
        strpos($nombreEstado, 'cerrad') !== false || 
        strpos($nombreEstado, 'finaliz') !== false
    );

    // 
    if ($esFinalizado) {
        // Si cambió a Resuelto/Cerrado, guardamos la fecha y hora actual con NOW()
        $sql = "UPDATE tickets 
                SET estado_id = ?, 
                    fecha_actualizacion = NOW(), 
                    fecha_finalizado = NOW() 
                WHERE id = ?";
    } else {
        // Si lo reabrió o lo pasó a otro estado, limpiamos la fecha dejándola en NULL
        $sql = "UPDATE tickets 
                SET estado_id = ?, 
                    fecha_actualizacion = NOW(), 
                    fecha_finalizado = NULL 
                WHERE id = ?";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$estado_id, $ticket_id]);

    echo json_encode(["success" => true, "message" => "Estado actualizado correctamente."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>