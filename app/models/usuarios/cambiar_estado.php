<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../permiso_rol/verificacion_rol.php';
requerirAdmin();
require("../php/conexion.php");

$params = $_POST;

try {
    $id = intval($params['id'] ?? 0);

    if (!$id) {
        echo json_encode(array('success'=>false, 'error'=>'ID inválido'));
        exit();
    }
        // ── Capturar estado ANTES ──
    $sql_antes = "SELECT estado FROM usuarios WHERE id=$id";
    $res_antes = mysqli_query($conexion, $sql_antes);
    $row_antes = mysqli_fetch_assoc($res_antes);
    $estado_antes = $row_antes['estado'];
    $estado_despues = ($estado_antes == 'activo') ? 'inactivo' : 'activo';

    $sql = "UPDATE usuarios
            SET estado = IF(estado='activo','inactivo','activo')
            WHERE id=$id AND eliminado_en IS NULL";

    $resultado = mysqli_query($conexion, $sql);

   if($resultado){
    $id_admin    = $_SESSION['usuario_id'] ?? null;
    $admin_user  = $_SESSION['usuario']    ?? 'sistema';
    $ip          = $_SERVER['REMOTE_ADDR'] ?? '';

    mysqli_query($conexion, "CALL sp_registrar_accion(
        $id_admin,
        '$admin_user',
        '$ip',
        'UPDATE',
        'usuarios',
        'estado',
        '$estado_antes',
        '$estado_despues'
    )");

    $response = array('success'=>true, 'msg'=>'Estado actualizado');
}else{
    $response = array('success'=>false, 'error'=>'No se pudo cambiar el estado');
}
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error: " . $e->getMessage());
}

echo json_encode($response);
?>
