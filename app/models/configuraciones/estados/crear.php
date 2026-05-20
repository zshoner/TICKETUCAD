<?php
require_once '../../php/conexion.php';

$nombre   = trim($_POST['nombre']   ?? '');
$es_final = intval($_POST['es_final'] ?? 0);

if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'El nombre es requerido']);
    exit;
}

$nombre_e = mysqli_real_escape_string($conexion, $nombre);
$es_final = $es_final ? 1 : 0;

$sql = "INSERT INTO estados_ticket (nombre, es_final) VALUES ('$nombre_e', $es_final)";

if (mysqli_query($conexion, $sql)) {
    echo json_encode(['success' => true, 'msg' => 'Estado creado correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al crear el estado']);
}
