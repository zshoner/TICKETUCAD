<?php

    require_once __DIR__ . "/../php/conexion.php";

    try {
        if (!$conexion) {
            throw new Exception("Error crítico: No se pudo establecer conexión con el servidor de base de datos.");
        }

        $inicio = $_GET['inicio'] ?? '';
        $fin    = $_GET['fin'] ?? '';
        $tec    = $_GET['tecnico'] ?? '';
        $depto  = $_GET['departamento'] ?? '';
        $estado = $_GET['estado'] ?? '';

        $inicioEscaped = mysqli_real_escape_string($conexion, trim($inicio));
        $finEscaped    = mysqli_real_escape_string($conexion, trim($fin));
        $tecEscaped    = mysqli_real_escape_string($conexion, trim($tec));
        $deptoEscaped  = mysqli_real_escape_string($conexion, trim($depto));
        $estEscaped    = mysqli_real_escape_string($conexion, trim($estado));

        $sql = "SELECT 
                    t.id AS id_ticket, 
                    u.nombre AS tecnico_nombre, 
                    d.nombre AS departamento, 
                    t.fecha_creacion, 
                    est.nombre AS estado,
                    est.es_final,
                    CASE 
                        WHEN sla.fecha_limite_resolucion < NOW() AND est.es_final = 0 THEN 'VENCIDO'
                        ELSE 'A TIEMPO'
                    END AS sla_status
                FROM tickets t
                LEFT JOIN usuarios u ON t.asignado_a = u.id 
                LEFT JOIN departamentos d ON t.departamento_id = d.id
                LEFT JOIN estados_ticket est ON t.estado_id = est.id
                LEFT JOIN sla_ticket sla ON t.id = sla.ticket_id
                WHERE t.eliminado_en IS NULL";

        if ($inicioEscaped != '' && $finEscaped != '') {
            $sql .= " AND t.fecha_creacion BETWEEN '{$inicioEscaped} 00:00:00' AND '{$finEscaped} 23:59:59'";
        }
        if ($tecEscaped != '') { $sql .= " AND t.asignado_a = '{$tecEscaped}'"; }
        if ($deptoEscaped != '') { $sql .= " AND t.departamento_id = '{$deptoEscaped}'"; }
        if ($estEscaped != '') { $sql .= " AND est.nombre = '{$estEscaped}'"; }

        $sql .= " ORDER BY t.id DESC";

        $query = mysqli_query($conexion, $sql);
        if (!$query) {
            throw new Exception("Falla en la consulta: " . mysqli_error($conexion));
        }

        $tickets = [];
        $stats = ['total' => 0, 'resueltos' => 0, 'pendientes' => 0, 'vencidos' => 0];

        while ($row = mysqli_fetch_assoc($query)) {
            if ($row['es_final'] == 1) {
                $stats['resueltos']++;
            } else {
                $stats['pendientes']++;
            }
            
            if ($row['sla_status'] === 'VENCIDO') {
                $stats['vencidos']++;
            }
            
            $tickets[] = $row;
        }

        $stats['total'] = count($tickets);

        ob_clean();
        echo json_encode([
            'status' => 'success', 
            'data' => $tickets, 
            'stats' => $stats
        ]);

    } catch (Exception $e) {
        ob_clean();
        echo json_encode([
            'status' => 'error', 
            'message' => $e->getMessage()
        ]);
    }
    exit;
?>