<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

$nombre = trim($_POST['nombre'] ?? '');
$nivel  = intval($_POST['nivel'] ?? 0);

if (empty($nombre) || $nivel <= 0) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

try {
    $nombre_e = mysqli_real_escape_string($conexion, $nombre);

    // Verifica si el nombre o nivel ya existen
    $check = mysqli_query($conexion, "SELECT id FROM prioridades WHERE nombre='$nombre_e' OR nivel=$nivel");

    if (mysqli_num_rows($check) > 0) {
        $response = ['success' => false, 'error' => 'El nombre o el nivel ya existen'];
    } else {
        $sql = "INSERT INTO prioridades (nombre, nivel) VALUES ('$nombre_e', $nivel)";

        if (mysqli_query($conexion, $sql)) {
            $id_admin   = $_SESSION['usuario_id'] ?? 'NULL';
            $admin_user = $_SESSION['usuario']    ?? 'sistema';
            $ip         = $_SERVER['REMOTE_ADDR'] ?? '';

            // Registra la acción en bitácora
            mysqli_query($conexion, "CALL sp_registrar_accion(
                $id_admin, '$admin_user', '$ip',
                'INSERT', 'prioridades', 'nombre', NULL, '$nombre_e'
            )");

            $response = ['success' => true, 'msg' => 'Prioridad creada'];
        } else {
            $response = ['success' => false, 'error' => 'Error al guardar'];
        }
    }

} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response);