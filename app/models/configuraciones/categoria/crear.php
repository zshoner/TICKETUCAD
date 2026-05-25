<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

// Recibe el nombre del formulario
$nombre = trim($_POST['nombre'] ?? '');


// Valida que no esté vacío
if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'El nombre es requerido']);
    exit;
}

try {

    $nombre_e = mysqli_real_escape_string($conexion, $nombre);
    $sql      = "INSERT INTO categorias (nombre) VALUES ('$nombre_e')";

    if (mysqli_query($conexion, $sql)) {
        // Bitácora
        $id_admin   = $_SESSION['usuario_id'] ?? 'NULL';
        $admin_user = $_SESSION['usuario']    ?? 'sistema';
        $ip         = $_SERVER['REMOTE_ADDR'] ?? '';

        mysqli_query($conexion, "CALL sp_registrar_accion(
            $id_admin, '$admin_user', '$ip',
            'INSERT', 'categorias', 'nombre', NULL, '$nombre_e'
        )");

        $response = ['success' => true, 'msg' => 'Categoría creada correctamente'];
    } else {
        $response = ['success' => false, 'error' => 'Error al crear la categoría'];
    }

} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response);