<?php
header('Content-Type: application/json');
require("../php/conexion.php");

$params = $_POST;

try {
    $id = intval($params['id'] ?? 0);

    if (!$id) {
        echo json_encode(array('success'=>false, 'error'=>'ID inválido'));
        exit();
    }

    $sql = "UPDATE usuarios
            SET estado = IF(estado='activo','inactivo','activo')
            WHERE id=$id AND eliminado_en IS NULL";

    $resultado = mysqli_query($con, $sql);

    if($resultado){
        $response = array('success'=>true, 'msg'=>'Estado actualizado');
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo cambiar el estado');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error: " . $e->getMessage());
}

echo json_encode($response);
?>
