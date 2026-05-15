<?php
// 1. Incluir el archivo de conexión
require 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Capturar los datos del formulario
    $titulo = $_POST['titulo'];
    $categoria_id = $_POST['categoria_id'];
    $prioridad_id = $_POST['prioridad_id'];
    $descripcion = $_POST['descripcion'];
    $correo = $_POST['correo'];

    // Valores por defecto para la BD
    $usuario_id = 1;      
    $estado_id = 1;       
    $departamento_id = 1; 

    try {
        // --- INICIO LÓGICA DE ASIGNACIÓN AUTOMÁTICA (ROUND-ROBIN) ---
        
        // 1. Obtener el ID del último usuario que recibió un ticket
        // Filtramos con IS NOT NULL por si hay tickets viejos sin asignar
        $stmt_ultimo = $pdo->query("SELECT asignado_a FROM tickets WHERE asignado_a IS NOT NULL ORDER BY id DESC LIMIT 1");
        $ultimo_id = $stmt_ultimo->fetchColumn();

        // Si la base de datos es nueva y no hay ningún ticket previo, empezamos desde el 0
        if (!$ultimo_id) {
            $ultimo_id = 0;
        }

        // 2. Buscar el siguiente usuario disponible (ID mayor al último)
        // OJO: Asumo que tu tabla de usuarios se llama 'usuarios'. Si se llama diferente, cámbialo aquí.
        $stmt_siguiente = $pdo->prepare("SELECT id FROM usuarios WHERE id > ? ORDER BY id ASC LIMIT 1");
        $stmt_siguiente->execute([$ultimo_id]);
        $siguiente_agente = $stmt_siguiente->fetchColumn();

        // 3. Si no hay siguiente (porque era el último de la lista), volvemos al primero
        if (!$siguiente_agente) {
            $stmt_primero = $pdo->query("SELECT id FROM usuarios ORDER BY id ASC LIMIT 1");
            $siguiente_agente = $stmt_primero->fetchColumn();
        }
        
        // --- FIN LÓGICA DE ASIGNACIÓN AUTOMÁTICA ---


        // Preparar la consulta SQL (Agregamos 'asignado_a')
        $sql = "INSERT INTO tickets (titulo, descripcion, usuario_id, estado_id, prioridad_id, categoria_id, departamento_id, asignado_a, fecha_creacion, fecha_actualizacion, correo) 
                VALUES (:titulo, :descripcion, :usuario_id, :estado_id, :prioridad_id, :categoria_id, :departamento_id, :asignado_a, NOW(), NOW(), :correo)";
        
        $stmt = $pdo->prepare($sql);

        // Ejecutar la consulta inyectando los valores capturados + EL NUEVO AGENTE
        $stmt->execute([
            ':titulo' => $titulo,
            ':descripcion' => $descripcion,
            ':usuario_id' => $usuario_id,
            ':estado_id' => $estado_id,
            ':prioridad_id' => $prioridad_id,
            ':categoria_id' => $categoria_id,
            ':departamento_id' => $departamento_id,
            ':asignado_a' => $siguiente_agente,  // <--- Aquí guardamos el agente que calculamos arriba
            ':correo' => $correo
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