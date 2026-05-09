<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../models/php/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$usuario    = trim($_POST['usuario'] ?? '');
$contrasena = $_POST['password'] ?? '';

if (empty($usuario) || empty($contrasena)) {
    echo json_encode(['success' => false, 'message' => 'Completa todos los campos.']);
    exit;
}

try {
 
    $stmt = $pdo->prepare("
        SELECT u.id, u.nombre, u.usuario, u.contrasena_hash, u.estado, u.eliminado_en,u.cambiar_password,r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.rol_id
        WHERE u.usuario = :usuario
          AND u.estado = 'activo'
          AND u.eliminado_en IS NULL
        LIMIT 1
    ");
    $stmt->execute([':usuario' => $usuario]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Actualizamos la variable aquí también

    $contrasenaCorrecta = ($contrasena === $user['contrasena_hash']) || password_verify($contrasena, $user['contrasena_hash']);

    if (!$user || !$contrasenaCorrecta) {
        echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos.']);
        exit;
    }


    // Guardar sesión
    $_SESSION['usuario_id'] = $user['id'];
    $_SESSION['nombre']     = $user['nombre'];
    $_SESSION['usuario']    = $user['usuario'];
    $_SESSION['rol']        = $user['rol'];

    echo json_encode([
        'success' => true,
        'nombre'  => $user['nombre'],
        'rol'     => $user['rol'],
        'cambiar_password' => $user['cambiar_password']
        
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
}
