<?php
require_once 'conexion.php';

if (isset($_POST['ticket_id']) && isset($_POST['estado_id'])) {
    
    $ticket_id = $_POST['ticket_id'];
    $estado_id = $_POST['estado_id'];

    $sql = "UPDATE tickets SET estado_id = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([$estado_id, $ticket_id])) {
        echo "Estado actualizado";
    } else {
        echo "Error al actualizar estado";
    }
} else {
    echo "Faltan datos";
}
?>