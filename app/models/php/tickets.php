<?php
include 'conexion.php';


    $sql = "SELECT 
            TK.id AS '#', 
            TK.titulo, 
            ET.nombre AS estado_id, 
            PR.nombre AS prioridad_id, 
            CA.nombre AS categoria_id, 
            TK.asignado_a AS asignado_id,  
            US.nombre AS asignado_nombre   
        FROM tickets TK 
        LEFT JOIN estados_ticket ET ON TK.estado_id = ET.id 
        LEFT JOIN prioridades PR ON TK.prioridad_id = PR.id 
        LEFT JOIN categorias CA ON TK.categoria_id = CA.id
        LEFT JOIN usuarios US ON TK.asignado_a = US.id";
    
    $resultado = $pdo->query($sql);

    //datos es donde guardaremos los resultados de la consulta, es un array vacio
    $datos = [];

    if ($resultado) {
        while ($row = $resultado->fetch(PDO::FETCH_ASSOC)) {
        
        $datos[] = $row;
        }
    }

    echo json_encode($datos);
    ?>