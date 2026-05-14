<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . "/../php/conexion.php";

$inicio = $_POST['h_inicio'] ?? '';
$fin    = $_POST['h_fin'] ?? '';
$tec    = $_POST['h_tecnico'] ?? '';
$depto  = $_POST['h_depto'] ?? '';
$estado = $_POST['h_estado'] ?? '';

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
    $sql .= " AND t.fecha_creacion BETWEEN '$inicio 00:00:00' AND '$fin 23:59:59'";
}
if (!empty($tec)) {
    $sql .= " AND t.asignado_a = '$tec'";
}
if (!empty($depto)) {
    $sql .= " AND t.departamento_id = '$depto'";
}
if (!empty($estado)) {
    $sql .= " AND est.nombre = '$estado'";
}

$sql .= " ORDER BY t.id DESC";

$resultado = mysqli_query($conexion, $sql);

if (!$resultado) {
    die("Error: " . mysqli_error($conexion));
}

$mpdf = new \Mpdf\Mpdf([
    'mode' => 'utf-8', 
    'format' => 'A4-L',
    'margin_top' => 15,
    'margin_bottom' => 15,
    'margin_left' => 15,
    'margin_right' => 15
]);

$html = '
<style>
    body { font-family: "Helvetica", Arial, sans-serif; color: #1e293b; }
    .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px; }
    .titulo { font-size: 22px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; }
    .subtitulo { font-size: 14px; color: #64748b; margin-top: 5px; }
    .rango { background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-top: 10px; display: inline-block; }
    
    table { width: 100%; border-collapse: collapse; }
    th { background-color: #1e40af; color: #ffffff; padding: 12px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 10px; }
    tr:nth-child(even) { background-color: #f8fafc; }
    
    .vencido { color: #dc2626; font-weight: bold; }
    .atiempo { color: #16a34a; font-weight: bold; }
    .badge-estado { border: 1px solid #cbd5e1; padding: 2px 5px; border-radius: 3px; background: #fff; font-size: 9px; }
    .footer { text-align: right; font-size: 9px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 5px; }
</style>

<div class="header">
    <div class="titulo">Universidad Cristiana de las Asambleas de Dios</div>
    <div class="subtitulo">Facultad de Ciencias Económicas · Soporte IT</div>
    <div class="rango">PERIODO: ' . ($inicio ?: 'HISTÓRICO') . ' AL ' . ($fin ?: date('d/m/Y')) . '</div>
</div>

<table>
    <thead>
        <tr>
            <th width="7%">ID</th>
            <th width="22%">Técnico</th>
            <th width="18%">Departamento</th>
            <th width="23%">Fecha y Hora</th>
            <th width="15%">Estado</th>
            <th width="15%">SLA</th>
        </tr>
    </thead>
    <tbody>';

while ($t = mysqli_fetch_assoc($resultado)) {
    $timestamp = strtotime($t['fecha_creacion']);
    $meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    $fechaFormateada = date("d ", $timestamp) . $meses[date("n", $timestamp)-1] . date(" Y, h:i A", $timestamp);

    $classSLA = ($t['sla_status'] === 'VENCIDO') ? 'vencido' : 'atiempo';
    
    $html .= '<tr>
                <td style="font-weight: bold;">#' . $t['id_ticket'] . '</td>
                <td>' . ($t['tecnico_nombre'] ?? 'Sin asignar') . '</td>
                <td>' . $t['departamento'] . '</td>
                <td style="color: #475569;">' . $fechaFormateada . '</td>
                <td><span class="badge-estado">' . strtoupper($t['estado']) . '</span></td>
                <td class="'.$classSLA.'">' . $t['sla_status'] . '</td>
              </tr>';
}

$html .= '</tbody></table>
<div class="footer">Generado por Ticket UCAD el ' . date('d/m/Y h:i A') . '</div>';

$mpdf->WriteHTML($html);
$mpdf->Output('Reporte_Ticket_UCAD.pdf', 'D');
exit;