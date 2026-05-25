<?php
header('Content-Type: application/json');
error_reporting(0);
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

// Si la conexión falló, reintenta una vez
if (!$conexion) {
    $conexion = @mysqli_connect($host, $username, $password, $dbname, $port);
    if ($conexion) $conexion->set_charset("utf8");
}

// Si sigue sin conexión, avisa al JS para que reintente
if (!$conexion) {
    echo json_encode(['success' => false, 'data' => [], 'connection_error' => true]);
    exit;
}

try {
    $res  = mysqli_query($conexion, "SELECT id, nombre FROM categorias ORDER BY nombre");
    $data = [];

    while ($row = mysqli_fetch_assoc($res)) $data[] = $row;

    $response = ['success' => true, 'data' => $data];

} catch (Exception $e) {
    $response = ['success' => false, 'data' => [], 'error' => $e->getMessage()];
}

echo json_encode($response);
