<?php

    require_once __DIR__ . "/../php/conexion.php"; 
    
    define('_URL_SYSTEM_', 'C:/xampp/htdocs/TICKETUCAD/');
    
    require_once(_URL_SYSTEM_ . 'vendor/autoload.php');

    date_default_timezone_set('America/El_Salvador');
    setlocale(LC_TIME, 'spanish');

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    

    $usuario = 'Usuario del Sistema';
    if (isset($_SESSION['ucad_user'])) {
        $usuario = $_SESSION['ucad_user'];
    } elseif (isset($_SESSION['nombre'])) {
        $usuario = $_SESSION['nombre'];
    }

    $inicio = $_POST['h_inicio'] ?? '';
    $fin    = $_POST['h_fin'] ?? '';

    $sql = "SELECT 
                t.id AS id_ticket, 
                u.nombre AS tecnico_nombre, 
                d.nombre AS departamento, 
                t.fecha_creacion, 
                est.nombre AS estado,
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

    if (!empty($inicio) && !empty($fin)) {
        $sql .= " AND t.fecha_creacion BETWEEN '{$inicio} 00:00:00' AND '{$fin} 23:59:59'";
    }

    $resultado = mysqli_query($conexion, $sql);

    if($resultado && mysqli_num_rows($resultado) > 0){
        
        $contenido = '
            <style>
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background-color: #1e40af; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; }
                td { border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; }
            </style>
            <table>
                <thead>
                    <tr><th>ID</th><th>Técnico</th><th>Departamento</th><th>Fecha</th><th>Estado</th><th>SLA</th></tr>
                </thead>
                <tbody>';

        $totalFilas = 0;
        while($fila = mysqli_fetch_assoc($resultado)){
            $totalFilas++;
            $contenido .= '<tr>
                <td>#'.$fila['id_ticket'].'</td>
                <td>'.htmlspecialchars($fila['tecnico_nombre'] ?? 'Sin asignar').'</td>
                <td>'.htmlspecialchars($fila['departamento']).'</td>
                <td>'.$fila['fecha_creacion'].'</td>
                <td>'.$fila['estado'].'</td>
                <td>'.$fila['sla_status'].'</td>
            </tr>';
        }
        $contenido .= '</tbody></table>';

        $texto_encabezado = '<div style="text-align:center; font-weight:bold; font-size: 16px;">Reporte de Tickets UCAD</div>';
        
        // Aquí se incluye la fecha, hora y usuario solicitados
        $fecha_impresion = date('d/m/Y h:i A');
        $texto_pie = '
            <table width="100%" style="font-size: 9px; border-top: 1px solid #ccc; padding-top: 5px;">
                <tr>
                    <td width="33%">Impreso el: '.$fecha_impresion.'</td>
                    <td width="33%" style="text-align:center;">Pág. {PAGENO} de {nbpg}</td>
                    <td width="33%" style="text-align:right;">Usuario: '.$usuario.' | Total: '.$totalFilas.'</td>
                </tr>
            </table>';

        $mpdfConfig = array(
            'mode' => 'utf-8',
            'format' => 'letter',
            'orientation' => 'L'
        );

        $mpdf = new \Mpdf\Mpdf($mpdfConfig);
        $mpdf->SetHTMLHeader($texto_encabezado);
        $mpdf->SetHTMLFooter($texto_pie);
        $mpdf->writeHTML($contenido);

        $mpdf->Output('Reporte_Tickets.pdf', 'D');
        exit;

    } else {
        echo "No se encontraron registros para generar el reporte.";
    }
?>