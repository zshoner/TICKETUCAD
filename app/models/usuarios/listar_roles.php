<?php
header('Content-Type: application/json');
error_reporting(0);
require_once __DIR__ . '/../permiso_rol/verificacion_rol.php';
requerirAdmin();
require("../php/conexion.php");

// Si la conexión falló, reintenta una vez
if (!$conexion) {
    $conexion = @mysqli_connect($host, $username, $password, $dbname, $port);
    if ($conexion) $conexion->set_charset("utf8");
}

try {
    $sql = "SELECT id, nombre FROM roles ORDER BY nombre";
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
        $response = array('success'=>false, 'error'=>'Error al cargar roles');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error: " . $e->getMessage());
}

echo json_encode($response);
?>
