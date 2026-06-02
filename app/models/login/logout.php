<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../models/php/conexion.php';

$id_usuario  = $_SESSION['usuario_id'] ?? null;
$admin_user  = $_SESSION['usuario']    ?? 'sistema';
$ip          = $_SERVER['REMOTE_ADDR'] ?? '';

if ($id_usuario) {
    $admin_user_e = mysqli_real_escape_string($conexion, $admin_user);
    mysqli_query($conexion, "CALL sp_registrar_accion(
        $id_usuario,
        '$admin_user_e',
        '$ip',
        'LOGOUT',
        'usuarios',
        'sesion',
        'sesion_activa',
        'cierre_sesion'
    )");
}

session_unset();
session_destroy();

echo json_encode(['success' => true]);
