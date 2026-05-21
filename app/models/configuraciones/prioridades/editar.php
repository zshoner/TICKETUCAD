<?php
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

$id     = intval($_POST['id'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');
$nivel  = intval($_POST['nivel'] ?? 0);

if (!$id || empty($nombre) || $nivel <= 0) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos para actualizar']);
    exit;
}

// Actualizamos nombre y nivel de forma segura
$stmt = mysqli_prepare($conexion, "UPDATE prioridades SET nombre=?, nivel=? WHERE id=?");
mysqli_stmt_bind_param($stmt, "sii", $nombre, $nivel, $id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'msg' => 'Prioridad actualizada correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al actualizar la prioridad']);
}
mysqli_stmt_close($stmt);