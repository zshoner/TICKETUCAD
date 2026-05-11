<?php
require_once '../../php/conexion.php';

// Recibe el nombre del formulario
$nombre = trim($_POST['nombre'] ?? '');

// Valida que no esté vacío
if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'El nombre es requerido']);
    exit;
}

// Inserta la nueva categoría
$sql = "INSERT INTO categorias (nombre) VALUES ('$nombre')";

if (mysqli_query($con, $sql)) {
    echo json_encode(['success' => true, 'msg' => 'Categoría creada correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al crear la categoría']);
}