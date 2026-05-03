<?php
header('Content-Type: application/json');
error_reporting("E_ALL");

$servidor = "brb6t1smbpzguvmk73ch-mysql.services.clever-cloud.com";
$usuario  = "ubs3smfytw84xd9c";
$clave    = "6XytXkRqcFF7f3GiGXZw";
$base     = "brb6t1smbpzguvmk73ch";
$puerto   = 3306;

$con = mysqli_connect($servidor, $usuario, $clave, $base, $puerto);

if($con){
    $con->set_charset("utf8");
}else{
    echo json_encode(array('success'=>false, 'error'=>'No hay conexión a la base de datos'));
    exit();
}

$params = $_POST;
$accion = $params['accion'] ?? '';

switch ($accion) {
    case 'listar':         listar($con, $params);         break;
    case 'listar_roles':   listar_roles($con);            break;
    case 'crear':          crear($con, $params);          break;
    case 'editar':         editar($con, $params);         break;
    case 'cambiar_estado': cambiar_estado($con, $params); break;
    case 'eliminar':       eliminar($con, $params);       break;
    default:
        echo json_encode(array('success'=>false, 'error'=>'Acción no válida'));
}

function listar($con, $params) {
    try {
        $busqueda = mysqli_real_escape_string($con, trim($params['busqueda'] ?? ''));

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
            $response = array('success'=>false, 'error'=>'Error en la consulta');
        }
    } catch (Exception $e) {
        $response = array('success'=>false, 'error'=>"Error al listar usuarios: " . $e->getMessage());
    }

    echo json_encode($response);
}

function listar_roles($con) {
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
}

function crear($con, $params) {
    try {
        $nombre   = trim($params['nombre']   ?? '');
        $correo   = trim($params['correo']   ?? '');
        $usuario  = trim($params['usuario']  ?? '');
        $password = $params['password']      ?? '';
        $rol_id   = intval($params['rol_id'] ?? 0);

        if (!$nombre || !$correo || !$usuario || !$password || !$rol_id) {
            echo json_encode(array('success'=>false, 'error'=>'Todos los campos son requeridos'));
            return;
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(array('success'=>false, 'error'=>'El correo no es válido'));
            return;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $nombre_e   = mysqli_real_escape_string($con, $nombre);
        $correo_e   = mysqli_real_escape_string($con, $correo);
        $usuario_e  = mysqli_real_escape_string($con, $usuario);
        $hash_e     = mysqli_real_escape_string($con, $hash);

        $sql = "INSERT INTO usuarios (nombre, correo, usuario, contrasena_hash, rol_id, estado)
                VALUES ('$nombre_e', '$correo_e', '$usuario_e', '$hash_e', $rol_id, 'activo')";

        $resultado = mysqli_query($con, $sql);

        if($resultado){
            $response = array('success'=>true, 'message'=>'Usuario creado exitosamente');
        }else{
            $response = array('success'=>false, 'error'=>'No se pudo crear el usuario');
        }
    } catch (Exception $e) {
        $response = array('success'=>false, 'error'=>"Error al crear usuario: " . $e->getMessage());
    }

    echo json_encode($response);
}

function editar($con, $params) {
    try {
        $id       = intval($params['id']      ?? 0);
        $nombre   = trim($params['nombre']    ?? '');
        $correo   = trim($params['correo']    ?? '');
        $usuario  = trim($params['usuario']   ?? '');
        $rol_id   = intval($params['rol_id']  ?? 0);
        $password = $params['password']       ?? '';

        if (!$id || !$nombre || !$correo || !$usuario || !$rol_id) {
            echo json_encode(array('success'=>false, 'error'=>'Datos incompletos'));
            return;
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(array('success'=>false, 'error'=>'El correo no es válido'));
            return;
        }

        $nombre_e  = mysqli_real_escape_string($con, $nombre);
        $correo_e  = mysqli_real_escape_string($con, $correo);
        $usuario_e = mysqli_real_escape_string($con, $usuario);

        if ($password !== '') {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $hash_e = mysqli_real_escape_string($con, $hash);
            $sql = "UPDATE usuarios
                    SET nombre='$nombre_e', correo='$correo_e', usuario='$usuario_e',
                        contrasena_hash='$hash_e', rol_id=$rol_id
                    WHERE id=$id AND eliminado_en IS NULL";
        } else {
            $sql = "UPDATE usuarios
                    SET nombre='$nombre_e', correo='$correo_e', usuario='$usuario_e', rol_id=$rol_id
                    WHERE id=$id AND eliminado_en IS NULL";
        }

        $resultado = mysqli_query($con, $sql);

        if($resultado){
            $response = array('success'=>true, 'message'=>'Usuario actualizado exitosamente');
        }else{
            $response = array('success'=>false, 'error'=>'No se pudo actualizar el usuario');
        }
    } catch (Exception $e) {
        $response = array('success'=>false, 'error'=>"Error al editar usuario: " . $e->getMessage());
    }

    echo json_encode($response);
}

function cambiar_estado($con, $params) {
    try {
        $id = intval($params['id'] ?? 0);

        if (!$id) {
            echo json_encode(array('success'=>false, 'error'=>'ID inválido'));
            return;
        }

        $sql = "UPDATE usuarios
                SET estado = IF(estado='activo','inactivo','activo')
                WHERE id=$id AND eliminado_en IS NULL";

        $resultado = mysqli_query($con, $sql);

        if($resultado){
            $response = array('success'=>true, 'message'=>'Estado actualizado');
        }else{
            $response = array('success'=>false, 'error'=>'No se pudo cambiar el estado');
        }
    } catch (Exception $e) {
        $response = array('success'=>false, 'error'=>"Error: " . $e->getMessage());
    }

    echo json_encode($response);
}

function eliminar($con, $params) {
    try {
        $id = intval($params['id'] ?? 0);

        if (!$id) {
            echo json_encode(array('success'=>false, 'error'=>'ID inválido'));
            return;
        }

        $sql = "UPDATE usuarios SET eliminado_en = NOW() WHERE id=$id";
        $resultado = mysqli_query($con, $sql);

        if($resultado){
            $response = array('success'=>true, 'message'=>'Usuario eliminado');
        }else{
            $response = array('success'=>false, 'error'=>'No se pudo eliminar el usuario');
        }
    } catch (Exception $e) {
        $response = array('success'=>false, 'error'=>"Error al eliminar usuario: " . $e->getMessage());
    }

    echo json_encode($response);
}
