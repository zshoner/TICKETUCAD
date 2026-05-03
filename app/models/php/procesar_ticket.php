<?php
// 1. Incluir el archivo de conexión
require 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Capturar los datos del formulario
    $titulo = $_POST['titulo'];
    $categoria_id = $_POST['categoria_id'];
    $prioridad_id = $_POST['prioridad_id'];
    $descripcion = $_POST['descripcion'];

    // Valores por defecto para la BD
    $usuario_id = 1;      
    $estado_id = 1;       
    $departamento_id = 1; 

    try {
        // Preparar la consulta SQL (¡Solo con fecha_creacion y fecha_actualizacion!)
        $sql = "INSERT INTO tickets (titulo, descripcion, usuario_id, estado_id, prioridad_id, categoria_id, departamento_id, fecha_creacion, fecha_actualizacion) 
                VALUES (:titulo, :descripcion, :usuario_id, :estado_id, :prioridad_id, :categoria_id, :departamento_id, NOW(), NOW())";
        
        $stmt = $pdo->prepare($sql);

        // Ejecutar la consulta inyectando los valores capturados
        $stmt->execute([
            ':titulo' => $titulo,
            ':descripcion' => $descripcion,
            ':usuario_id' => $usuario_id,
            ':estado_id' => $estado_id,
            ':prioridad_id' => $prioridad_id,
            ':categoria_id' => $categoria_id,
            ':departamento_id' => $departamento_id
        ]);

        // Mostrar mensaje de éxito
        echo "<body style='background-color: #152036; margin: 0; padding: 20px; justify-content: center; align-items: center;'>";
        echo "<div style='font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; background: #e6ffed; border: 1px solid #28a745; border-radius: 8px; text-align: center;'>";
        echo "<img src='../../../media/img/logo.png' alt='Éxito' style='width: 80px; margin-bottom: 20px;'>";
        echo "<h2 style='color: #455fd4;'>¡Ticket creado exitosamente!</h2>";
        echo "<p>El problema ha sido registrado en el sistema. Nos pondremos en contacto pronto.</p>";
        echo "<br><a href='/TICKETUCAD/formulario-usuario' style='display: inline-block; background-color: #455fd4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin-top: 10px; transition: 0.3s;'>Regresar al formulario</a>";
        echo "</div>";

    } catch(PDOException $e) {
        // En caso de error
        echo "<div style='font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; background: #ffe6e6; border: 1px solid #dc3545; border-radius: 8px;'>";
        echo "<h2 style='color: #dc3545;'>Error al crear el ticket</h2>";
        echo "<p>" . $e->getMessage() . "</p>";
        echo "<br><a href='crear_ticket.html'>Volver al formulario</a>";
        echo "</div>";
    }
} else {
    echo "Acceso no autorizado.";
}
?>