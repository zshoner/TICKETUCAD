<?php

    session_start();
    header('Content-Type: application/json');

    require("../php/conexion.php");
    define('_URL_SYSTEM_', 'C:/xampp/htdocs/TICKETUCAD/');

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    require _URL_SYSTEM_ . "recursos/PHPMailer/Exception.php";
    require _URL_SYSTEM_ . "recursos/PHPMailer/PHPMailer.php";
    require _URL_SYSTEM_ . "recursos/PHPMailer/SMTP.php";

    require_once _URL_SYSTEM_ . 'vendor/autoload.php';

    try {
        $email_destino = trim($_POST['email_destino'] ?? '');
        $mensaje_extra = trim($_POST['mensaje']       ?? '');
        $inicio        = $_POST['h_inicio']           ?? '';
        $fin           = $_POST['h_fin']              ?? '';

        if (empty($email_destino)) {
            echo json_encode(['success' => false, 'error' => 'El correo destinatario es requerido']);
            exit;
        }

        $id_usuario       = $_SESSION['usuario_id'] ?? 0;
        $res_user         = mysqli_query($conexion, "SELECT nombre, correo FROM usuarios WHERE id=$id_usuario");
        $row_user         = mysqli_fetch_assoc($res_user);
        $remitente_nombre = $row_user['nombre'] ?? 'Sistema UCAD';

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

        if (!$resultado || mysqli_num_rows($resultado) === 0) {
            echo json_encode(['success' => false, 'error' => 'No hay registros en el periodo seleccionado']);
            exit;
        }

        $filas = '';
        $totalFilas = 0;
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $totalFilas++;
            $filas .= '<tr>
                <td>#' . $fila['id_ticket'] . '</td>
                <td>' . htmlspecialchars($fila['tecnico_nombre'] ?? 'Sin asignar') . '</td>
                <td>' . htmlspecialchars($fila['departamento']) . '</td>
                <td>' . $fila['fecha_creacion'] . '</td>
                <td>' . $fila['estado'] . '</td>
                <td>' . $fila['sla_status'] . '</td>
            </tr>';
        }

        $contenido = '
            <style>
                table { width:100%; border-collapse:collapse; margin-top:10px; }
                th { background-color:#1e40af; color:#ffffff; padding:10px; text-align:left; font-size:11px; }
                td { border:1px solid #cbd5e1; padding:8px; font-size:11px; }
            </style>
            <table>
                <thead>
                    <tr><th>ID</th><th>Técnico</th><th>Departamento</th><th>Fecha</th><th>Estado</th><th>SLA</th></tr>
                </thead>
                <tbody>' . $filas . '</tbody>
            </table>';

        $encabezado      = '<div style="text-align:center;font-weight:bold;font-size:16px;">Reporte de Tickets UCAD</div>';
        $fecha_impresion = date('d/m/Y h:i A');
        $pie = '
            <table width="100%" style="font-size:9px;border-top:1px solid #ccc;padding-top:5px;">
                <tr>
                    <td width="33%">Impreso el: ' . $fecha_impresion . '</td>
                    <td width="33%" style="text-align:center;">Pág. {PAGENO} de {nbpg}</td>
                    <td width="33%" style="text-align:right;">Usuario: ' . $remitente_nombre . ' | Total: ' . $totalFilas . '</td>
                </tr>
            </table>';

        $mpdf = new \Mpdf\Mpdf(['mode' => 'utf-8', 'format' => 'letter', 'orientation' => 'L']);
        $mpdf->SetHTMLHeader($encabezado);
        $mpdf->SetHTMLFooter($pie);
        $mpdf->writeHTML($contenido);

        $pdf_temp = tempnam(sys_get_temp_dir(), 'reporte_') . '.pdf';
        $mpdf->Output($pdf_temp, 'F');

        $mensaje_bloque = !empty($mensaje_extra)
            ? "<p style='font-size:14px;'><b>Mensaje:</b> " . htmlspecialchars($mensaje_extra) . "</p>"
            : '';

        $html_correo  = "<div style='font-family:Arial,sans-serif;'>";
        $html_correo .= "<div style='background:#1e40af;padding:20px;border-radius:8px 8px 0 0;'>";
        $html_correo .= "<h2 style='color:#fff;margin:0;'>Reporte de Tickets - UCAD</h2>";
        $html_correo .= "<p style='color:#bfdbfe;margin:4px 0 0;font-size:13px;'>Período: {$inicio} al {$fin}</p>";
        $html_correo .= "</div>";
        $html_correo .= "<div style='background:#f8fafc;padding:20px;border:1px solid #e2e8f0;'>";
        $html_correo .= $mensaje_bloque;
        $html_correo .= "<p style='font-size:13px;color:#374151;'>Se adjunta el reporte en formato PDF.</p>";
        $html_correo .= "</div>";
        $html_correo .= "<div style='background:#f1f5f9;padding:12px 20px;border-radius:0 0 8px 8px;font-size:12px;color:#64748b;'>";
        $html_correo .= "Enviado por: {$remitente_nombre} | Sistema TICKET UCAD";
        $html_correo .= "</div></div>";

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'Aleman.uchiha21@gmail.com';
        $mail->Password   = 'iiyf vlsl jqqh otuj';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom('Aleman.uchiha21@gmail.com', 'TICKET UCAD');
        $mail->addAddress($email_destino);

        $mail->isHTML(true);
        $mail->Subject = 'Reporte de Tickets UCAD - ' . $inicio . ' al ' . $fin;
        $mail->Body    = $html_correo;
        $mail->addAttachment($pdf_temp, 'Reporte_Tickets_UCAD.pdf');

        $mail->send();
        unlink($pdf_temp);

        $response = array(
            'success' => true,
            'msg'     => 'Correo enviado correctamente a ' . $email_destino
        );

    } catch (Exception $e) {
        $response = array(
            'success' => false,
            'error'   => 'Error al enviar: ' . $e->getMessage()
        );
    }

    echo json_encode($response);
