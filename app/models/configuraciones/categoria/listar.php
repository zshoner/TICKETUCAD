<?php
require_once '../../php/conexion.php';
$res  = mysqli_query($con, "SELECT id, nombre FROM categorias ORDER BY nombre");
$data = [];
while ($row = mysqli_fetch_assoc($res)) $data[] = $row;
echo json_encode(['success' => true, 'data' => $data, 'total' => count($data)]);