<?php
require_once '../php/conexion.php';
error_reporting(0);
header('Content-Type: application/json');

// Reintento de conexión
if (!$conexion) {
    $conexion = @mysqli_connect($host, $username, $password, $dbname, $port);
    if ($conexion) $conexion->set_charset("utf8");
}

if (!$conexion) {
    echo json_encode(['success' => false, 'data' => [], 'connection_error' => true]);
    exit;
}

try {
    $query  = $_POST["query"]  ?? '';
    $estado = $_POST["estado"] ?? 'activo';

    // Seguridad: validar estado
    if (!in_array($estado, ['activo', 'inactivo'])) {
        $estado = 'activo';
    }

    $query_e = mysqli_real_escape_string($conexion, $query);

    $sql = "SELECT id, CONCAT(nombre, ' (', usuario, ')') AS text
            FROM usuarios
            WHERE eliminado_en IS NULL
              AND estado = '$estado'
              AND (nombre LIKE '%$query_e%'
                   OR usuario LIKE '%$query_e%'
                   OR correo LIKE '%$query_e%')
            ORDER BY nombre ASC
            LIMIT 50";

    $resultado = mysqli_query($conexion, $sql);

    if ($resultado) {
        $items = [];
        while ($row = mysqli_fetch_assoc($resultado)) {
            $items[] = $row;
        }
        $response = [
            'success' => true,
            'data'    => $items,
            'total'   => count($items)
        ];
    } else {
        $response = [
            'success' => false,
            'error'   => 'Error en la consulta'
        ];
    }
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error'   => $e->getMessage()
    ];
}

echo json_encode($response);
?>