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
    // ── Capturar estado ANTES de eliminar ──
    $sql_antes = "SELECT estado FROM usuarios WHERE id=$id";
    $res_antes = mysqli_query($conexion, $sql_antes);
    $row_antes = mysqli_fetch_assoc($res_antes);
    $estado_antes = $row_antes['estado'];

    $sql = "UPDATE usuarios SET eliminado_en = NOW(), estado = 'inactivo' WHERE id=$id";
    $resultado = mysqli_query($conexion, $sql);
    if($resultado){
        // ── Registrar en bitácora ──
        $id_admin    = $_SESSION['usuario_id'] ?? null;
        $admin_user  = $_SESSION['usuario']    ?? 'sistema';
        $ip          = $_SERVER['REMOTE_ADDR'] ?? '';

        mysqli_query($conexion, "CALL sp_registrar_accion(
            $id_admin,
            '$admin_user',
            '$ip',
            'DELETE',
            'usuarios',
            'estado',
            '$estado_antes',
            'inactivo'
        )");

        $response = array('success'=>true, 'msg'=>'Usuario eliminado');
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo eliminar el usuario');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al eliminar usuario: " . $e->getMessage());
}

echo json_encode($response);
?>
