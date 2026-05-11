<?php
require_once 'conexion.php';
header('Content-Type: application/json');

if (!isset($_POST['ticket_id']) || !array_key_exists('categoria_id', $_POST)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

$ticketId = (int) $_POST['ticket_id'];
$catRaw = $_POST['categoria_id'];
$categoriaId = ($catRaw === '' || $catRaw === null) ? null : (int) $catRaw;

try {
    $sql = "UPDATE tickets SET categoria_id = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $ok = $stmt->execute([$categoriaId, $ticketId]);
    echo json_encode(['success' => (bool) $ok]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar categoría']);
}
?>
