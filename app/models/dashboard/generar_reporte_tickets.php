<?php
require_once __DIR__ . '/../../models/php/conexion.php';
header('Content-Type: application/json'); // Devolver JSON

$periodo = isset($_GET['periodo']) ? $_GET['periodo'] : '30d';

switch ($periodo) {
    case '24h': $intervalo = "INTERVAL 1 DAY"; $txtPeriodo = "Últimas 24 Horas"; break;
    case '7d':  $intervalo = "INTERVAL 7 DAY"; $txtPeriodo = "Últimos 7 Días"; break;
    case '30d': $intervalo = "INTERVAL 30 DAY"; $txtPeriodo = "Últimos 30 Días"; break;
    default:    $intervalo = "INTERVAL 30 DAY"; $txtPeriodo = "Últimos 30 Días";
}

try {
    $db = $pdo; 
    $sql = "SELECT 
                t.id, 
                t.titulo, 
                t.descripcion, 
                e.nombre AS estado, 
                p.nombre AS prioridad, 
                c.nombre AS categoria, 
                t.correo, 
                u.nombre AS asignado_a, 
                t.fecha_creacion
            FROM tickets t
            LEFT JOIN estados_ticket e ON t.estado_id = e.id
            LEFT JOIN prioridades p ON t.prioridad_id = p.id
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN usuarios u ON t.asignado_a = u.id
            WHERE t.fecha_creacion >= NOW() - $intervalo
            ORDER BY t.fecha_creacion DESC";

    $stmt = $db->query($sql);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'periodo' => $txtPeriodo,
        'data' => $tickets
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>