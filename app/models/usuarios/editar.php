<?php
header('Content-Type: application/json');
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

    $nombre_e  = mysqli_real_escape_string($con, $nombre);
    $correo_e  = mysqli_real_escape_string($con, $correo);
    $usuario_e = mysqli_real_escape_string($con, $usuario);

    if ($password !== '') {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $hash_e = mysqli_real_escape_string($con, $hash);
        $sql = "UPDATE usuarios
                SET nombre='$nombre_e', correo='$correo_e', usuario='$usuario_e',
                    contrasena_hash='$hash_e', rol_id=$rol_id
                WHERE id=$id AND eliminado_en IS NULL";
    } else {
        $sql = "UPDATE usuarios
                SET nombre='$nombre_e', correo='$correo_e', usuario='$usuario_e', rol_id=$rol_id
                WHERE id=$id AND eliminado_en IS NULL";
    }

    $resultado = mysqli_query($con, $sql);

    if($resultado){
        $response = array('success'=>true, 'msg'=>'Usuario actualizado exitosamente');
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo actualizar el usuario');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al editar usuario: " . $e->getMessage());
}

echo json_encode($response);
?>
