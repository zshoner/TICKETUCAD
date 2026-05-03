<?php
ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Importamos tu archivo tal cual lo tienes
require_once(__DIR__ . "/../php/conexion.php");

try {
    // IMPORTANTE: Tu archivo usa la variable $pdo
    if (!isset($pdo)) {
        throw new Exception("La variable de conexión \$pdo no está definida.");
    }

    $db = $pdo; 

    $inicio = $_GET['inicio'] ?? '';
    $fin    = $_GET['fin'] ?? '';
    $tec    = $_GET['tecnico'] ?? '';

    // SQL con nombres corregidos (SINGULAR: asignaciones_ticket)
    $sql = "SELECT 
                t.id, 
                t.titulo,
                u.nombre AS tecnico_nombre, 
                d.nombre AS depto_nombre, 
                t.fecha_creacion, 
                est.nombre AS estado_nombre,
                est.es_final
            FROM tickets t
            LEFT JOIN asignaciones_ticket a ON t.id = a.ticket_id
            LEFT JOIN usuarios u ON a.tecnico_id = u.id
            LEFT JOIN departamentos d ON t.departamento_id = d.id
            LEFT JOIN estados_ticket est ON t.estado_id = est.id
            WHERE t.eliminado_en IS NULL";

    $params = [];
    if (!empty($inicio) && !empty($fin)) {
        $sql .= " AND t.fecha_creacion BETWEEN :inicio AND :fin";
        $params[':inicio'] = $inicio . " 00:00:00";
        $params[':fin'] = $fin . " 23:59:59";
    }
    if (!empty($tec)) {
        $sql .= " AND a.tecnico_id = :tec";
        $params[':tec'] = $tec;
    }

    $sql .= " ORDER BY t.id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

    ob_clean();
    echo json_encode(['status' => 'success', 'data' => $tickets, 'stats' => $stats]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
exit;