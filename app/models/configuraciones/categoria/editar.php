<?php
require_once '../../php/conexion.php';

// Recibe id y nombre del formulario
$id     = intval($_POST['id'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');

// Valida que los datos estén completos
if (!$id || empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

// Actualiza la categoría en la base de datos
$sql = "UPDATE categorias SET nombre='$nombre' WHERE id=$id";

if (mysqli_query($con, $sql)) {
    echo json_encode(['success' => true, 'msg' => 'Categoría actualizada correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al actualizar la categoría']);
}