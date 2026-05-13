<?php
ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once(__DIR__ . "/../php/conexion.php");

try {
    if (!isset($pdo)) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión a BD']);
        exit;
    }

    // Captura de filtros desde la URL
    $inicio = $_GET['inicio'] ?? '';
    $fin    = $_GET['fin'] ?? '';
    $tec    = $_GET['tecnico'] ?? '';
    $depto  = $_GET['departamento'] ?? '';
    $estado_filtro = $_GET['estado'] ?? '';

    // Consulta corregida: Se une 'usuarios' directamente con 'tickets.asignado_a'
    $sql = "SELECT 
                t.id AS id_ticket, 
                u.nombre AS tecnico_nombre, 
                d.nombre AS departamento, 
                t.fecha_creacion, 
                est.nombre AS estado,
                est.es_final,
                CASE 
                    WHEN sla.fecha_limite_resolucion < NOW() AND est.es_final = 0 THEN 'VENCIDO'
                    ELSE 'A TIEMPO'
                END AS sla_status
            FROM tickets t
            LEFT JOIN usuarios u ON t.asignado_a = u.id 
            LEFT JOIN departamentos d ON t.departamento_id = d.id
            LEFT JOIN estados_ticket est ON t.estado_id = est.id
            LEFT JOIN sla_ticket sla ON t.id = sla.ticket_id
            WHERE t.eliminado_en IS NULL";

    $params = [];

    // Filtro por rango de fechas
    if (!empty($inicio) && !empty($fin)) {
        $sql .= " AND t.fecha_creacion BETWEEN :inicio AND :fin";
        $params[':inicio'] = $inicio . " 00:00:00";
        $params[':fin'] = $fin . " 23:59:59";
    }

    // Filtro por técnico (corregido para usar la columna de la tabla tickets)
    if (!empty($tec)) { 
        $sql .= " AND t.asignado_a = :tec"; 
        $params[':tec'] = $tec; 
    }

    // Filtro por departamento
    if (!empty($depto)) { 
        $sql .= " AND t.departamento_id = :depto"; 
        $params[':depto'] = $depto; 
    }

    // Filtro por nombre de estado
    if (!empty($estado_filtro)) { 
        $sql .= " AND est.nombre = :est"; 
        $params[':est'] = $estado_filtro; 
    }

    $sql .= " ORDER BY t.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cálculo de estadísticas para los cuadros superiores del Dashboard
    $stats = ['total' => count($tickets), 'resueltos' => 0, 'pendientes' => 0, 'vencidos' => 0];
    foreach ($tickets as $t) {
        if ($t['es_final'] == 1) {
            $stats['resueltos']++;
        } else {
            $stats['pendientes']++;
        }
        
        if ($t['sla_status'] === 'VENCIDO') {
            $stats['vencidos']++;
        }
    }

    ob_clean();
    echo json_encode([
        'status' => 'success', 
        'data' => $tickets, 
        'stats' => $stats
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'status' => 'error', 
        'message' => $e->getMessage()
    ]);
}