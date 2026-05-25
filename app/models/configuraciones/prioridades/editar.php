<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

$id     = intval($_POST['id']     ?? 0);
$nombre = trim($_POST['nombre']   ?? '');
$nivel  = intval($_POST['nivel']  ?? 0);

if (!$id || empty($nombre) || $nivel <= 0) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos para actualizar']);
    exit;
}

try {
    // Guardamos cómo estaba antes de editar
    $res_antes    = mysqli_query($conexion, "SELECT nombre, nivel FROM prioridades WHERE id=$id");
    $row_antes    = mysqli_fetch_assoc($res_antes);
    $nom_anterior = $row_antes['nombre'] ?? '';
    $niv_anterior = $row_antes['nivel']  ?? 0;

    $nombre_e = mysqli_real_escape_string($conexion, $nombre);

    $sql = "UPDATE prioridades SET nombre='$nombre_e', nivel=$nivel WHERE id=$id";

    if (mysqli_query($conexion, $sql)) {
        $id_admin   = $_SESSION['usuario_id'] ?? 'NULL';
        $admin_user = $_SESSION['usuario']    ?? 'sistema';
        $ip         = $_SERVER['REMOTE_ADDR'] ?? '';

        // Solo registra lo que realmente cambió
        if ($nom_anterior !== $nombre) {
            $antes_e = mysqli_real_escape_string($conexion, $nom_anterior);
            mysqli_query($conexion, "CALL sp_registrar_accion(
                $id_admin, '$admin_user', '$ip',
                'UPDATE', 'prioridades', 'nombre', '$antes_e', '$nombre_e'
            )");
        }

        if ($niv_anterior != $nivel) {
            mysqli_query($conexion, "CALL sp_registrar_accion(
                $id_admin, '$admin_user', '$ip',
                'UPDATE', 'prioridades', 'nivel', '$niv_anterior', '$nivel'
            )");
        }

        $response = ['success' => true, 'msg' => 'Prioridad actualizada correctamente'];
    } else {
        $response = ['success' => false, 'error' => 'Error al actualizar la prioridad'];
    }

} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response);