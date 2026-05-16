<?php
// Cargar mPDF y la conexion
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . "/../php/conexion.php";
require_once __DIR__ . "/auth_admin.php";

// Filtros que vienen por GET
$inicio = isset($_GET['inicio']) ? $_GET['inicio'] : '';
$fin    = isset($_GET['fin']) ? $_GET['fin'] : '';
$tec    = isset($_GET['tecnico']) ? $_GET['tecnico'] : '';
$depto  = isset($_GET['departamento']) ? $_GET['departamento'] : '';

// Consulta principal para el PDF
$sql = "SELECT t.id, u.nombre AS tecnico, d.nombre AS depto, t.fecha_creacion, est.nombre AS estado,
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

// Agregar filtros si el usuario los puso
if (!empty($inicio) && !empty($fin)) {
    $sql .= " AND t.fecha_creacion BETWEEN '$inicio 00:00:00' AND '$fin 23:59:59'";
}

if (!empty($tec)) {
    $sql .= " AND t.asignado_a = '$tec'";
}

if (!empty($depto)) {
    $sql .= " AND t.departamento_id = '$depto'";
}

// Ejecutar con mysqli
$resultado = mysqli_query($conexion, $sql);

if (!$resultado) {
    die("Error en la consulta: " . mysqli_error($conexion));
}

// Configurar la libreria mPDF
$mpdf = new \Mpdf\Mpdf([
    'mode' => 'utf-8', 
    'format' => 'A4-L', // Horizontal
    'margin_top' => 20
]);

// Estilos y HTML del reporte
$html = '
<style>
    body { font-family: sans-serif; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .titulo { font-size: 18px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background-color: #f2f2f2; border: 1px solid #ccc; padding: 8px; font-size: 12px; }
    td { border: 1px solid #ccc; padding: 7px; font-size: 11px; }
    .vencido { color: red; font-weight: bold; }
    .atiempo { color: green; font-weight: bold; }
    .footer { text-align: right; font-size: 10px; margin-top: 15px; }
</style>

<div class="header">
    <div class="titulo">UNIVERSIDAD CRISTIANA DE LAS ASAMBLEAS DE DIOS</div>
    <div style="font-size: 14px;">Reporte de Help Desk - Ticket UCAD</div>
    <p>Rango: ' . ($inicio ?: 'Inicio') . ' - ' . ($fin ?: date('d/m/Y')) . '</p>
</div>

<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>TÉCNICO</th>
            <th>DEPARTAMENTO</th>
            <th>FECHA</th>
            <th>ESTADO</th>
            <th>SLA</th>
        </tr>
    </thead>
    <tbody>';

// Llenar la tabla con los datos
while ($t = mysqli_fetch_assoc($resultado)) {
    $colorSLA = ($t['sla_status'] === 'VENCIDO') ? 'vencido' : 'atiempo';
    
    $html .= '<tr>
                <td>#' . $t['id'] . '</td>
                <td>' . ($t['tecnico'] ?? 'Pendiente') . '</td>
                <td>' . $t['depto'] . '</td>
                <td>' . date("d/m/Y", strtotime($t['fecha_creacion'])) . '</td>
                <td>' . $t['estado'] . '</td>
                <td class="'.$colorSLA.'">' . $t['sla_status'] . '</td>
              </tr>';
}

$html .= '</tbody></table>
<div class="footer">Generado el: ' . date('d/m/Y H:i') . '</div>';

// Escribir y descargar
$mpdf->WriteHTML($html);
$mpdf->Output('Reporte_Tickets_UCAD.pdf', 'D');
?>