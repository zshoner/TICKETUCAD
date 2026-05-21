<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../permiso_rol/verificacion_rol.php';
requerirAdmin();
require("../php/conexion.php");

$params = $_POST;

try {
    $busqueda = mysqli_real_escape_string($conexion, trim($params['busqueda'] ?? ''));

    $sql = "SELECT u.id, u.nombre, u.correo, u.usuario,
                   r.nombre AS rol, r.id AS rol_id,
                   u.estado, u.fecha_creacion
            FROM usuarios u
            LEFT JOIN roles r ON r.id = u.rol_id
            WHERE u.eliminado_en IS NULL";

    if ($busqueda !== '') {
        $sql .= " AND (u.nombre LIKE '%$busqueda%' OR u.correo LIKE '%$busqueda%' OR u.usuario LIKE '%$busqueda%')";
    }
    $sql .= " ORDER BY u.fecha_creacion DESC";

    $resultado = mysqli_query($conexion, $sql);

    if($resultado){
        $items = array();
        while ($row = mysqli_fetch_assoc($resultado)) {
            $items[] = $row;
        }
        $response = array(
            'success' => true,
            'data'    => $items,
            'total'   => mysqli_num_rows($resultado)
        );
    }else{
        $response = array('success'=>false, 'error'=>'Error en la consulta');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al listar usuarios: " . $e->getMessage());
}

echo json_encode($response);
?>
