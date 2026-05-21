<?php
require_once '../../php/conexion.php';
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Sin conexión a la base de datos', 'data' => []]);
    exit;
}

// Es vital ordenar por el nivel (ej: 1 = Urgente, 2 = Alta, etc.)
$res  = mysqli_query($conexion, "SELECT id, nombre, nivel FROM prioridades ORDER BY nivel ASC");
$data = [];

if (!$res) {
    echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    exit;
}

while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;

}

echo json_encode(['success' => true, 'data' => $data]);