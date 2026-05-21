<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../permiso_rol/verificacion_rol.php';
requerirAdmin();
require("../php/conexion.php");

$params = $_POST;

try {
    $nombre   = trim($params['nombre']   ?? '');
    $correo   = trim($params['correo']   ?? '');
    $usuario  = trim($params['usuario']  ?? '');
    $rol_id   = intval($params['rol_id'] ?? 0);

    if (!$nombre || !$correo || !$usuario || !$rol_id) {
        echo json_encode(array('success'=>false, 'error'=>'Todos los campos son requeridos'));
        exit();
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array('success'=>false, 'error'=>'El correo no es válido'));
        exit();
    }

    $password_temporal = 'UCAD' . rand(1000, 9999);
    $hash = password_hash($password_temporal, PASSWORD_BCRYPT);

    $nombre_e   = mysqli_real_escape_string($conexion, $nombre);
    $correo_e   = mysqli_real_escape_string($conexion, $correo);
    $usuario_e  = mysqli_real_escape_string($conexion, $usuario);
    $hash_e     = mysqli_real_escape_string($conexion, $hash);

    $sql = "INSERT INTO usuarios (nombre, correo, usuario, contrasena_hash, rol_id, estado, cambiar_password)
    VALUES ('$nombre_e', '$correo_e', '$usuario_e', '$hash_e', $rol_id, 'activo', 1)";

$resultado = mysqli_query($conexion, $sql);

if ($resultado) {
    // ── Registrar en bitácora ──
    $nuevo_id    = mysqli_insert_id($conexion);
    $id_admin    = $_SESSION['usuario_id'] ?? null;
    $admin_user  = $_SESSION['usuario']    ?? 'sistema';
    $ip          = $_SERVER['REMOTE_ADDR'] ?? '';

    mysqli_query($conexion, "CALL sp_registrar_accion(
        $id_admin,
        '$admin_user',
        '$ip',
        'INSERT',
        'usuarios',
        'usuario',
        NULL,
        '$usuario_e'
    )");

        $response = array('success'=>true, 'msg'=>'Usuario creado exitosamente', 'password_temporal'=>$password_temporal);
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo crear el usuario');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al crear usuario: " . $e->getMessage());
}

echo json_encode($response);
?>
