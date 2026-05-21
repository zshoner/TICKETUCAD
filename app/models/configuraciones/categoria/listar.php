<?php
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Sin conexión a la base de datos', 'data' => []]);
    exit;
}
// Consulta todas las categorías ordenadas por nombre
$res  = mysqli_query($conexion, "SELECT id, nombre FROM categorias ORDER BY nombre");
$data = [];
if (!$res) {
    echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    exit;
}

// Recorre los resultados y los guarda en el array
while ($row = mysqli_fetch_assoc($res)) $data[] = $row;

// Devuelve los datos en JSON al JS
echo json_encode(['success' => true, 'data' => $data]);