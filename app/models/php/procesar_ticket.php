<?php
// 1. Incluir el archivo de conexión
require 'conexion.php';
require_once __DIR__ . '/../notificacion/procesar.php';

// Indicar que la respuesta será en formato JSON
header('Content-Type: application/json');

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
        $stmt_ultimo = $pdo->query("SELECT asignado_a FROM tickets WHERE asignado_a IS NOT NULL ORDER BY id DESC LIMIT 1");
        $ultimo_id = $stmt_ultimo->fetchColumn();

        if (!$ultimo_id) {
            $ultimo_id = 0;
        }

        $stmt_siguiente = $pdo->prepare("SELECT id FROM usuarios WHERE id > ? ORDER BY id ASC LIMIT 1");
        $stmt_siguiente->execute([$ultimo_id]);
        $siguiente_agente = $stmt_siguiente->fetchColumn();

        if (!$siguiente_agente) {
            $stmt_primero = $pdo->query("SELECT id FROM usuarios ORDER BY id ASC LIMIT 1");
            $siguiente_agente = $stmt_primero->fetchColumn();
        }
        // --- FIN LÓGICA DE ASIGNACIÓN AUTOMÁTICA ---

        // Preparar la consulta SQL
        $sql = "INSERT INTO tickets (titulo, descripcion, usuario_id, estado_id, prioridad_id, categoria_id, departamento_id, asignado_a, fecha_creacion, fecha_actualizacion, correo) 
                VALUES (:titulo, :descripcion, :usuario_id, :estado_id, :prioridad_id, :categoria_id, :departamento_id, :asignado_a, NOW(), NOW(), :correo)";
        
        $stmt = $pdo->prepare($sql);

        // Ejecutar la consulta
        $stmt->execute([
            ':titulo' => $titulo,
            ':descripcion' => $descripcion,
            ':usuario_id' => $usuario_id,
            ':estado_id' => $estado_id,
            ':prioridad_id' => $prioridad_id,
            ':categoria_id' => $categoria_id,
            ':departamento_id' => $departamento_id,
            ':asignado_a' => $siguiente_agente,
            ':correo' => $correo
        ]);

        $ticket_id = (int) $pdo->lastInsertId();
        crearNotificacionesNuevoTicket($pdo, $ticket_id, $titulo, (int) $siguiente_agente);

        // Responder con éxito en formato JSON
        echo json_encode([
            "status" => "success", 
            "message" => "El problema ha sido registrado en el sistema. Nos pondremos en contacto pronto."
        ]);

    } catch(PDOException $e) {
        // Responder con error en formato JSON
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Error de base de datos: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(403);
    echo json_encode([
        "status" => "error", 
        "message" => "Acceso no autorizado."
    ]);
}
?>