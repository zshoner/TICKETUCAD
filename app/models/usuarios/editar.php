<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../permiso_rol/verificacion_rol.php';
requerirAdmin();
require("../php/conexion.php");

$params = $_POST;

try {
    $id       = intval($params['id']      ?? 0);
    $nombre   = trim($params['nombre']    ?? '');
    $correo   = trim($params['correo']    ?? '');
    $usuario  = trim($params['usuario']   ?? '');
    $rol_id   = intval($params['rol_id']  ?? 0);
    $password = $params['password']       ?? '';

    if (!$id || !$nombre || !$correo || !$usuario || !$rol_id) {
        echo json_encode(array('success'=>false, 'error'=>'Datos incompletos'));
        exit();
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    
        echo json_encode(array('success'=>false, 'error'=>'El correo no es válido'));
        exit();
    }
        // ── Capturar valores ANTES del UPDATE ──
    $sql_antes = "SELECT nombre, correo, usuario, rol_id FROM usuarios WHERE id=$id";
    $res_antes = mysqli_query($conexion, $sql_antes);
    $row_antes = mysqli_fetch_assoc($res_antes);
    $nombre_e  = mysqli_real_escape_string($conexion, $nombre);
    $correo_e  = mysqli_real_escape_string($conexion, $correo);
    $usuario_e = mysqli_real_escape_string($conexion, $usuario);

    if ($password !== '') {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $hash_e = mysqli_real_escape_string($conexion, $hash);
        $sql = "UPDATE usuarios
                SET nombre='$nombre_e', correo='$correo_e', usuario='$usuario_e',
                    contrasena_hash='$hash_e', rol_id=$rol_id
                WHERE id=$id AND eliminado_en IS NULL";
    } else {
        $sql = "UPDATE usuarios
                SET nombre='$nombre_e', correo='$correo_e', usuario='$usuario_e', rol_id=$rol_id
                WHERE id=$id AND eliminado_en IS NULL";
    }

    $resultado = mysqli_query($conexion, $sql);

    if($resultado){
        // ── Registrar en bitácora (solo campos que cambiaron) ──
        $id_admin    = $_SESSION['usuario_id'] ?? null;
        $admin_user  = $_SESSION['usuario']    ?? 'sistema';
        $ip          = $_SERVER['REMOTE_ADDR'] ?? '';

        $cambios = [
            'nombre'  => [$row_antes['nombre'],  $nombre],
            'correo'  => [$row_antes['correo'],  $correo],
            'usuario' => [$row_antes['usuario'], $usuario],
            'rol_id'  => [$row_antes['rol_id'],  $rol_id]
        ];

        foreach ($cambios as $campo => $valores) {
            $antes   = $valores[0];
            $despues = $valores[1];
            if ($antes != $despues) {
                $antes_e   = mysqli_real_escape_string($conexion, $antes);
                $despues_e = mysqli_real_escape_string($conexion, $despues);
                mysqli_query($conexion, "CALL sp_registrar_accion(
                    $id_admin,
                    '$admin_user',
                    '$ip',
                    'UPDATE',
                    'usuarios',
                    '$campo',
                    '$antes_e',
                    '$despues_e'
                )");
            }
        }

        $response = array('success'=>true, 'msg'=>'Usuario actualizado exitosamente');
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo actualizar el usuario');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al editar usuario: " . $e->getMessage());
}

echo json_encode($response);
?>
