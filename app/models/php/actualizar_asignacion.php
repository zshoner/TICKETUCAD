<?php
require_once 'conexion.php';

// Verificamos que lleguen los datos que mandará Javascript
if (isset($_POST['ticket_id']) && isset($_POST['usuario_id'])) {
    
    $ticket_id = $_POST['ticket_id'];
    $nuevo_usuario_id = $_POST['usuario_id'];

    // Si seleccionan "Sin asignar", lo mandamos como NULL
    if($nuevo_usuario_id == "") {
        $nuevo_usuario_id = NULL;
    }

    // Actualizamos el agente asignado
    $sql = "UPDATE tickets SET asignado_a = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([$nuevo_usuario_id, $ticket_id])) {
        echo "Actualizado con éxito";
    } else {
        echo "Error al actualizar";
    }
} else {
    echo "Faltan datos";
}
?>