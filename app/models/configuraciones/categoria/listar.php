<?php
require_once '../../php/conexion.php';

// Consulta todas las categorías ordenadas por nombre
$res  = mysqli_query($con, "SELECT id, nombre FROM categorias ORDER BY nombre");
$data = [];

// Recorre los resultados y los guarda en el array
while ($row = mysqli_fetch_assoc($res)) $data[] = $row;

// Devuelve los datos en JSON al JS
echo json_encode(['success' => true, 'data' => $data]);