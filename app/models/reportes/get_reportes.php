<?php
// Evitar que salgan errores raros en el json
ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Incluimos la conexion normal
require_once(__DIR__ . "/../php/conexion.php");

// Validar si la conexion existe (usando la variable de conexion.php)
if (!$conexion) {
    echo json_encode(['status' => 'error', 'message' => 'No hay conexion a la base']);
    exit;
}

// Capturar los filtros de la URL
$inicio = isset($_GET['inicio']) ? $_GET['inicio'] : '';
$fin    = isset($_GET['fin']) ? $_GET['fin'] : '';
$tec    = isset($_GET['tecnico']) ? $_GET['tecnico'] : '';
$depto  = isset($_GET['departamento']) ? $_GET['departamento'] : '';
$estado_filtro = isset($_GET['estado']) ? $_GET['estado'] : '';

// Consulta para unir las tablas y sacar los nombres
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

// Aplicar filtros segun lo que venga por GET
if ($inicio != '' && $fin != '') {
    $sql .= " AND t.fecha_creacion BETWEEN '$inicio 00:00:00' AND '$fin 23:59:59'";
}

if ($tec != '') { 
    $sql .= " AND t.asignado_a = '$tec'"; 
}

if ($depto != '') { 
    $sql .= " AND t.departamento_id = '$depto'"; 
}

if ($estado_filtro != '') { 
    $sql .= " AND est.nombre = '$estado_filtro'"; 
}

$sql .= " ORDER BY t.id DESC";

// Ejecutar con mysqli
$query = mysqli_query($conexion, $sql);

if (!$query) {
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conexion)]);
    exit;
}

$tickets = [];
$stats = ['total' => 0, 'resueltos' => 0, 'pendientes' => 0, 'vencidos' => 0];

// Sacar los datos y armar las estadisticas
while ($row = mysqli_fetch_assoc($query)) {
    if ($row['es_final'] == 1) {
        $stats['resueltos']++;
    } else {
        $stats['pendientes']++;
    }
    
    if ($row['sla_status'] === 'VENCIDO') {
        $stats['vencidos']++;
    }
    
    $tickets[] = $row;
}

$stats['total'] = count($tickets);

// Mandar todo a la vista
ob_clean();
echo json_encode([
    'status' => 'success', 
    'data' => $tickets, 
    'stats' => $stats
]);
exit;