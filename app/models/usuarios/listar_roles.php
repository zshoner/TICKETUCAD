<?php
header('Content-Type: application/json');
require("../php/conexion.php");

try {
    $sql = "SELECT id, nombre FROM roles ORDER BY nombre";
    $resultado = mysqli_query($con, $sql);

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
