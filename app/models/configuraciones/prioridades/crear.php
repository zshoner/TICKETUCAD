<?php
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

$nombre = trim($_POST['nombre'] ?? '');
$nivel  = intval($_POST['nivel'] ?? 0);

// Validación básica para no guardar basura
if (empty($nombre) || $nivel <= 0) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

// Comprobamos si el nombre o el nivel ya están ocupados
$check = mysqli_query($conexion, "SELECT id FROM prioridades WHERE nombre = '$nombre' OR nivel = $nivel");

if (mysqli_num_rows($check) > 0) {
    echo json_encode(['success' => false, 'error' => 'El nombre o el nivel ya existen']);
} else {
    // Insertamos directamente
    $sql = "INSERT INTO prioridades (nombre, nivel) VALUES ('$nombre', $nivel)";
    
    if (mysqli_query($conexion, $sql)) {
        echo json_encode(['success' => true, 'msg' => 'Prioridad creada']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al guardar']);
    }
}