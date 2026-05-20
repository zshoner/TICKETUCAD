<?php
require_once '../../php/conexion.php';

$id       = intval($_POST['id']       ?? 0);
$nombre   = trim($_POST['nombre']     ?? '');
$es_final = intval($_POST['es_final'] ?? 0);

if (!$id || empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$nombre_e = mysqli_real_escape_string($conexion, $nombre);
$es_final = $es_final ? 1 : 0;

$sql = "UPDATE estados_ticket SET nombre='$nombre_e', es_final=$es_final WHERE id=$id";

if (mysqli_query($conexion, $sql)) {
    echo json_encode(['success' => true, 'msg' => 'Estado actualizado correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al actualizar el estado']);
}
