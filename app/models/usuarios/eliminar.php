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

    $sql = "UPDATE usuarios SET eliminado_en = NOW(), estado = 'inactivo' WHERE id=$id";
    $resultado = mysqli_query($con, $sql);

    if($resultado){
        $response = array('success'=>true, 'msg'=>'Usuario eliminado');
    }else{
        $response = array('success'=>false, 'error'=>'No se pudo eliminar el usuario');
    }
} catch (Exception $e) {
    $response = array('success'=>false, 'error'=>"Error al eliminar usuario: " . $e->getMessage());
}

echo json_encode($response);
?>
