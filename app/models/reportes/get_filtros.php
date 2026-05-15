<?php
// Cabecera para que el JS reconozca la respuesta
header('Content-Type: application/json');

// Conexion a la base de datos
require_once(__DIR__ . "/../php/conexion.php");

// Validar conexion
if (!$conexion) {
    echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos']);
    exit;
}

// Arreglos para guardar los datos
$tecnicos = [];
$deptos = [];
$estados = [];

// 1. Cargar Tecnicos (Rol 2)
$res_tec = mysqli_query($conexion, "SELECT id, nombre FROM usuarios WHERE rol_id = 2");
if ($res_tec) {
    while ($row = mysqli_fetch_assoc($res_tec)) {
        $tecnicos[] = $row;
    }
}

// 2. Cargar Departamentos
$res_dep = mysqli_query($conexion, "SELECT id, nombre FROM departamentos");
if ($res_dep) {
    while ($row = mysqli_fetch_assoc($res_dep)) {
        $deptos[] = $row;
    }
}

// 3. Cargar Estados de ticket
$res_est = mysqli_query($conexion, "SELECT nombre FROM estados_ticket");
if ($res_est) {
    while ($row = mysqli_fetch_assoc($res_est)) {
        $estados[] = $row;
    }
}

// Mandar todo en un solo JSON
echo json_encode([
    'status' => 'success',
    'tecnicos' => $tecnicos,
    'departamentos' => $deptos,
    'estados' => $estados
]);

exit;