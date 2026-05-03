<?php
// 1. Incluir el archivo de conexión
require '../../models/php/conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Capturamos el ID del ticket que enviamos desde el simulador
    $ticket_id = $_POST['ticket_id'];

    // Asumimos que el estado "Cerrado" tiene el ID 3 en tu tabla 'estados_ticket'
    // (Si en tu BD el estado cerrado es otro número, cámbialo aquí)
    $estado_cerrado_id = 3; 

    try {
        // LA LÓGICA CLAVE PARA TU COLEGA:
        // Hacemos un UPDATE al ticket: cambiamos su estado y registramos NOW() en fecha_cierre
        $sql = "UPDATE tickets 
                SET estado_id = :estado_id, 
                    fecha_cierre = NOW(), 
                    fecha_actualizacion = NOW() 
                WHERE id = :ticket_id";
        
        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':estado_id' => $estado_cerrado_id,
            ':ticket_id' => $ticket_id
        ]);

        // Redirigir con éxito (Patrón PRG)
        header("Location: cerrar_ticket.php?status=success&id=" . $ticket_id);
        exit();

    } catch(PDOException $e) {
        header("Location: cerrar_ticket.php?status=error&msg=" . urlencode($e->getMessage()));
        exit();
    }
} 
// Mostrar mensajes después de la redirección GET
else if (isset($_GET['status'])) {
    echo "<body style='background-color: #152036; font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;'>";
    echo "<div style='background: white; padding: 30px; border-radius: 8px; text-align: center; max-width: 400px;'>";
    
    if ($_GET['status'] == 'success') {
        echo "<h2 style='color: #28a745;'>¡Ticket CERRADO!</h2>";
        echo "<p>El ticket #" . htmlspecialchars($_GET['id']) . " ha sido marcado como cerrado y se ha registrado la fecha de cierre.</p>";
    } else {
        echo "<h2 style='color: #dc3545;'>Error</h2>";
        echo "<p>" . htmlspecialchars($_GET['msg']) . "</p>";
    }
    
    echo "<br><a href='simulador_cierre.html' style='color: #0056b3; text-decoration: none; font-weight: bold;'>Cerrar otro ticket</a>";
    echo "</div></body>";
} else {
    echo "Acceso no autorizado.";
}
?>