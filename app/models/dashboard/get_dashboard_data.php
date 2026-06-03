<?php

require_once __DIR__ . '/../../models/php/conexion.php';

header('Content-Type: application/json');

$periodo = isset($_GET['periodo']) ? $_GET['periodo'] : '24h';

// Intervalos de tiempoo
switch ($periodo) {
    case '24h': $intervalo = "INTERVAL 1 DAY"; break;
    case '7d':  $intervalo = "INTERVAL 7 DAY"; break;
    case '30d': $intervalo = "INTERVAL 30 DAY"; break;
    default:    $intervalo = "INTERVAL 1 DAY";
}

try {
    // Variable $pdo que viene directamente de conexion.php
    $db = $pdo; 

    // CONTEO DE TICKETS (KPIs) - Usando 'estado_id'
    $stmt = $db->query("SELECT 
        SUM(CASE WHEN estado_id = 1 THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN estado_id = 2 THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END) as cerrados
        FROM tickets WHERE fecha_creacion >= NOW() - $intervalo");
    $kpis = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. PROMEDIOS DE TIEMPO
    $stmtTiempos = $db->query("SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, fecha_creacion, fecha_primera_respuesta)) / 60 as avg_respuesta,
        AVG(TIMESTAMPDIFF(MINUTE, fecha_creacion, fecha_finalizado)) / 60 as avg_resolucion
        FROM tickets 
        WHERE fecha_creacion >= NOW() - $intervalo");
    $tiempos = $stmtTiempos->fetch(PDO::FETCH_ASSOC);

    // ── CAMBIO AQUÍ: DATOS PARA LA GRÁFICA DINÁMICA (HORAS VS DÍAS) ──
    if ($periodo === '24h') {
        // Si son 24 horas, formateamos como "08:00" y agrupamos por hora exacta
        $sqlGrafica = "SELECT 
            DATE_FORMAT(fecha_creacion, '%H:00') as fecha,
            COUNT(*) as nuevos,
            SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END) as cerrados
            FROM tickets 
            WHERE fecha_creacion >= NOW() - $intervalo
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H')
            ORDER BY fecha_creacion ASC";
    } else {
        // Si son 7d o 30d, mantenemos el formato por días ("03 Jun")
        $sqlGrafica = "SELECT 
            DATE_FORMAT(fecha_creacion, '%d %b') as fecha,
            COUNT(*) as nuevos,
            SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END) as cerrados
            FROM tickets 
            WHERE fecha_creacion >= NOW() - $intervalo
            GROUP BY DATE(fecha_creacion)
            ORDER BY DATE(fecha_creacion) ASC";
    }

    $stmtGrafica = $db->query($sqlGrafica);
    $grafica = $stmtGrafica->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status'  => 'success',
        'kpis'    => [
            'abiertos'    => (int)($kpis['abiertos'] ?? 0),
            'en_progreso' => (int)($kpis['en_progreso'] ?? 0),
            'cerrados'    => (int)($kpis['cerrados'] ?? 0)
        ],
        'tiempos' => [
            'respuesta'  => round($tiempos['avg_respuesta'] ?? 0, 1),
            'resolucion' => round($tiempos['avg_resolucion'] ?? 0, 1)
        ],
        'grafica' => $grafica
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>