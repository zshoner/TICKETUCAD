<?php
require_once 'conexion.php';
header('Content-Type: application/json');

// Verificar que se reciba el ID del ticket
$ticket_id = $_GET['id'] ?? null;

if (!$ticket_id) {
    echo json_encode(["success" => false, "message" => "ID de ticket no proporcionado."]);
    exit;
}

try {
    // 1. OBTENER EL DETALLE DEL TICKET
    // Nota: Reutilizo los campos que tu JS espera (prioridad_nombre, creador_nombre, etc.)
    // Asegúrate de adaptar los JOINs si los nombres de tus tablas o columnas varían.
    $sqlTicket = "SELECT t.*, 
                         e.nombre AS estado_nombre,
                         p.nombre AS prioridad_nombre,
                         c.nombre AS categoria_nombre,
                         u.nombre AS creador_nombre
                  FROM tickets t
                  LEFT JOIN estados_ticket e ON t.estado_id = e.id
                  LEFT JOIN prioridades p ON t.prioridad_id = p.id
                  LEFT JOIN categorias c ON t.categoria_id = c.id
                  LEFT JOIN usuarios u ON t.usuario_id = u.id
                  WHERE t.id = ?";
                  
    $stmtT = $pdo->prepare($sqlTicket);
    $stmtT->execute([$ticket_id]);
    $ticket = $stmtT->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        echo json_encode(["success" => false, "message" => "No se encontró el ticket solicitado."]);
        exit;
    }

    // 2. OBTENER LOS CATÁLOGOS (Estados, Usuarios y Categorías)
    $estados = $pdo->query("SELECT id, nombre FROM estados_ticket")->fetchAll(PDO::FETCH_ASSOC);
    $usuarios = $pdo->query("SELECT id, nombre FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);
    $categorias = $pdo->query("SELECT id, nombre FROM categorias ORDER BY nombre")->fetchAll(PDO::FETCH_ASSOC);

    // 3. RESPUESTA UNIFICADA
    echo json_encode([
        "success" => true,
        "ticket" => $ticket,
        "estados" => $estados,
        "usuarios" => $usuarios,
        "categorias" => $categorias
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>