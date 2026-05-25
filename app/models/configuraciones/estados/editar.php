<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php';
requerirAdmin();
require_once '../../php/conexion.php';

$id       = intval($_POST['id']       ?? 0);
$nombre   = trim($_POST['nombre']     ?? '');
$es_final = intval($_POST['es_final'] ?? 0);

if (!$id || empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

try {
    // Guardamos cómo estaba antes de editar
    $res_antes    = mysqli_query($conexion, "SELECT nombre, es_final FROM estados_ticket WHERE id=$id");
    $row_antes    = mysqli_fetch_assoc($res_antes);
    $nom_anterior = $row_antes['nombre']   ?? '';
    $fin_anterior = $row_antes['es_final'] ?? 0;

    $nombre_e = mysqli_real_escape_string($conexion, $nombre);
    $es_final = $es_final ? 1 : 0;

    $sql = "UPDATE estados_ticket SET nombre='$nombre_e', es_final=$es_final WHERE id=$id";

    if (mysqli_query($conexion, $sql)) {
        $id_admin   = $_SESSION['usuario_id'] ?? 'NULL';
        $admin_user = $_SESSION['usuario']    ?? 'sistema';
        $ip         = $_SERVER['REMOTE_ADDR'] ?? '';

        // Solo registra lo que realmente cambió
        if ($nom_anterior !== $nombre) {
            $antes_e = mysqli_real_escape_string($conexion, $nom_anterior);
            mysqli_query($conexion, "CALL sp_registrar_accion(
                $id_admin, '$admin_user', '$ip',
                'UPDATE', 'estados_ticket', 'nombre', '$antes_e', '$nombre_e'
            )");
        }

        if ($fin_anterior != $es_final) {
            mysqli_query($conexion, "CALL sp_registrar_accion(
                $id_admin, '$admin_user', '$ip',
                'UPDATE', 'estados_ticket', 'es_final', '$fin_anterior', '$es_final'
            )");
        }

        $response = ['success' => true, 'msg' => 'Estado actualizado correctamente'];
    } else {
        $response = ['success' => false, 'error' => 'Error al actualizar el estado'];
    }

} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response);
