<?php
// Evita cualquier salida de texto antes del JSON
ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Asegúrate de que esta ruta sea la correcta para tu archivo de conexión
require_once(_DIR_ . "/../../php/conexion.php");

try {
    $conexion = new Conexion();
    $db = $conexion->getConnection();

    // Recibir parámetros
    $inicio = $_GET['inicio'] ?? '';
    $fin    = $_GET['fin'] ?? '';
    $tec    = $_GET['tecnico'] ?? '';
    $depto  = $_GET['departamento'] ?? '';
    $estado = $_GET['estado'] ?? '';

    // Consulta base: Ajustada a tus capturas (usuarios, tickets, departamentos, estados_ticket)
    $sql = "SELECT 
                t.id, 
                t.titulo,
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

    // Filtros
    if (!empty($inicio) && !empty($fin)) {
        $sql .= " AND t.fecha_creacion BETWEEN '$inicio 00:00:00' AND '$fin 23:59:59'";
    }
    if (!empty($tec))   $sql .= " AND a.tecnico_id = " . intval($tec);
    if (!empty($depto)) $sql .= " AND t.departamento_id = " . intval($depto);
    if (!empty($estado)) $sql .= " AND t.estado_id = " . intval($estado);

    $sql .= " ORDER BY t.id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Procesar cumplimiento básico
    $stats = ['total' => count($tickets), 'resueltos' => 0, 'pendientes' => 0, 'vencidos' => 0];
    foreach ($tickets as &$t) {
        if ($t['es_final'] == 1) {
            $stats['resueltos']++;
            $t['cumplimiento'] = 'Finalizado';
        } else {
            $stats['pendientes']++;
            $t['cumplimiento'] = 'En proceso';
        }
    }

    ob_clean(); // Limpia cualquier eco accidental
    echo json_encode(['status' => 'success', 'data' => $tickets, 'stats' => $stats]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
exit;