<?php
require_once '../../php/conexion.php';
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Sin conexión a la base de datos', 'data' => []]);
    exit;
}

// Consulta todos los estados ordenados por id
$res  = mysqli_query($conexion, "SELECT id, nombre, es_final FROM estados_ticket ORDER BY id ASC");
$data = [];

if (!$res) {
    echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    exit;
}
while ($row = mysqli_fetch_assoc($res)) {
    $row['es_final'] = (int) $row['es_final'];
    $data[] = $row;
}

echo json_encode(['success' => true, 'data' => $data]);
