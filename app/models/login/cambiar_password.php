<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../models/php/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Sesión no válida.']);
    exit;
}

$nueva_password = $_POST['nueva_password'] ?? '';

if (empty($nueva_password) || strlen($nueva_password) < 8) {
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener mínimo 8 caracteres.']);
    exit;
}

$hash = password_hash($nueva_password, PASSWORD_BCRYPT);
$id   = $_SESSION['usuario_id'];

$stmt = $pdo->prepare("UPDATE usuarios SET contrasena_hash = ?, cambiar_password = 0 WHERE id = ?");

if ($stmt->execute([$hash, $id])) {
    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar la contraseña.']);
}
?>