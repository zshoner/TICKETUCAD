<?php
session_start();

ob_start();
header('Content-Type: application/json');


if (!isset($_SESSION['id_rol']) || $_SESSION['id_rol'] != 1) {
    echo json_encode([
        'status' => 'error', 
        'message' => 'No tiene permisos de administrador para consultar estos datos.'
    ]);
    exit;
}

require_once("../../php/conexion.php");

try {
    $conexion = new Conexion();
    $db = $conexion->getConnection();


    $inicio = $_GET['inicio'] ?? '';
    $fin    = $_GET['fin'] ?? '';
    $tec    = isset($_GET['tecnico']) ? intval($_GET['tecnico']) : 0;
    $depto  = isset($_GET['departamento']) ? intval($_GET['departamento']) : 0;
    $estado = isset($_GET['estado']) ? intval($_GET['estado']) : 0;


    $sql = "SELECT 
                t.id, 
                u.nombre AS tecnico_nombre, 
                d.nombre AS depto_nombre, 
                t.fecha_creacion, 
                est.nombre AS estado_nombre,
                est.es_final
            FROM tickets t
            LEFT JOIN asignaciones_tickets a ON t.id = a.ticket_id AND a.activo = 1
            LEFT JOIN usuarios u ON a.tecnico_id = u.id
            LEFT JOIN departamentos d ON t.departamento_id = d.id
            LEFT JOIN estados_ticket est ON t.estado_id = est.id
            WHERE t.eliminado_en IS NULL";

    
    if (!empty($inicio) && !empty($fin)) {
        $sql .= " AND t.fecha_creacion BETWEEN '$inicio 00:00:00' AND '$fin 23:59:59'";
    }
    if ($tec > 0)    $sql .= " AND a.tecnico_id = $tec";
    if ($depto > 0)  $sql .= " AND t.departamento_id = $depto";
    if ($estado > 0) $sql .= " AND t.estado_id = $estado";

    $sql .= " ORDER BY t.id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    
    $stats = [
        'total'      => count($tickets),
        'resueltos'  => 0,
        'pendientes' => 0,
        'vencidos'   => 0
    ];

    foreach ($tickets as &$t) {
        if ($t['es_final'] == 1) {
            $stats['resueltos']++;
            $t['cumplimiento'] = 'Finalizado';
        } else {
            $stats['pendientes']++;
            $t['cumplimiento'] = 'En proceso';
        }
    }

    
    ob_clean(); 
    echo json_encode([
        'status' => 'success', 
        'data'   => $tickets, 
        'stats'  => $stats
    ]);

} catch (Exception $e) {
    
    ob_clean();
    echo json_encode([
        'status'  => 'error', 
        'message' => 'Error interno: ' . $e->getMessage()
    ]);
}
exit;