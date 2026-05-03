<?php
header('Content-Type: application/json');
require("../php/conexion.php");

$params = $_POST;

try {
    $nombre   = trim($params['nombre']   ?? '');
    $correo   = trim($params['correo']   ?? '');
    $usuario  = trim($params['usuario']  ?? '');
    $password = $params['password']      ?? '';
    $rol_id   = intval($params['rol_id'] ?? 0);

    if (!$nombre || !$correo || !$usuario || !$password || !$rol_id) {
        echo json_encode(array('success'=>false, 'error'=>'Todos los campos son requeridos'));
        exit();
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array('success'=>false, 'error'=>'El correo no es válido'));
        exit();
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $nombre_e   = mysqli_real_escape_string($con, $nombre);
    $correo_e   = mysqli_real_escape_string($con, $correo);
    $usuario_e  = mysqli_real_escape_string($con, $usuario);
    $hash_e     = mysqli_real_escape_string($con, $hash);

    $sql = "INSERT INTO usuarios (nombre, correo, usuario, contrasena_hash, rol_id, estado)
            VALUES ('$nombre_e', '$correo_e', '$usuario_e', '$hash_e', $rol_id, 'activo')";

    $resultado = mysqli_query($con, $sql);

    if($resultado){
        $response = array('success'=>true, 'msg'=>'Usuario creado exitosamente');
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo crear el usuario');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al crear usuario: " . $e->getMessage());
}

echo json_encode($response);
?>
