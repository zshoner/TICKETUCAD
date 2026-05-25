<?php
session_start(); // Inicia la sesión para acceder a los datos del usuario logueado
header('Content-Type: application/json'); // Indica que la respuesta será en formato JSON
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php'; // Carga las funciones de verificación de roles
requerirAdmin(); // Verifica que el usuario tenga rol de administrador, si no, bloquea el acceso
require_once '../../php/conexion.php'; // Establece la conexión con la base de datos

// Recibe y sanitiza los datos del formulario
$id     = intval($_POST['id']   ?? 0);  // Convierte el id a entero para evitar inyección SQL
$nombre = trim($_POST['nombre'] ?? ''); // Elimina espacios en blanco al inicio y al final

// Valida que los datos estén completos antes de continuar
if (!$id || empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

try {
    // Captura el valor actual ANTES de hacer el UPDATE para registrarlo en bitácora
    $res_antes       = mysqli_query($conexion, "SELECT nombre FROM categorias WHERE id=$id");
    $row_antes       = mysqli_fetch_assoc($res_antes);
    $nombre_anterior = $row_antes['nombre'] ?? ''; // Guarda el nombre que tenía antes del cambio

    // Escapa el nuevo nombre para prevenir inyección SQL
    $nombre_e = mysqli_real_escape_string($conexion, $nombre);

    // Construye y ejecuta la consulta de actualización
    $sql = "UPDATE categorias SET nombre='$nombre_e' WHERE id=$id";

    if (mysqli_query($conexion, $sql)) {

        // Solo registra en bitácora si el nombre realmente cambió
        if ($nombre_anterior !== $nombre) {
            $id_admin   = $_SESSION['usuario_id'] ?? 'NULL'; // ID del administrador logueado
            $admin_user = $_SESSION['usuario']    ?? 'sistema'; // Nombre de usuario del admin
            $ip         = $_SERVER['REMOTE_ADDR'] ?? ''; // IP desde donde se hizo el cambio
            $antes_e    = mysqli_real_escape_string($conexion, $nombre_anterior); // Escapa el valor anterior

            // Llama al procedimiento almacenado que registra la acción en la bitácora
            mysqli_query($conexion, "CALL sp_registrar_accion(
                $id_admin, '$admin_user', '$ip',
                'UPDATE', 'categorias', 'nombre', '$antes_e', '$nombre_e'
            )");
        }

        $response = ['success' => true, 'msg' => 'Categoría actualizada correctamente'];
    } else {
        $response = ['success' => false, 'error' => 'Error al actualizar la categoría'];
    }

} catch (Exception $e) {
    // Captura cualquier error inesperado y lo devuelve como respuesta JSON
    $response = ['success' => false, 'error' => $e->getMessage()];
}

// Devuelve la respuesta final en formato JSON
echo json_encode($response);