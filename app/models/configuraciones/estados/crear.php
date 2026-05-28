<?php
session_start(); // Inicia la sesión para acceder a los datos del usuario logueado
header('Content-Type: application/json'); // Indica que la respuesta será en formato JSON
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php'; // Carga las funciones de verificación de roles
requerirAdmin(); // Verifica que el usuario tenga rol de administrador
require_once '../../php/conexion.php'; // Establece la conexión con la base de datos

// Recibe y sanitiza los datos del formulario
$nombre = trim($_POST['nombre'] ?? ''); // Elimina espacios en blanco

// Valida que el nombre no esté vacío
if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'El nombre es requerido']);
    exit;
}

try {
    // Escapa el valor para prevenir inyección SQL
    $nombre_e = mysqli_real_escape_string($conexion, $nombre);

    // Inserta el estado (es_final queda en su default = 0)
    $sql = "INSERT INTO estados_ticket (nombre) VALUES ('$nombre_e')";

    if (mysqli_query($conexion, $sql)) {
        // Datos del administrador para registrar en bitácora
        $id_admin   = $_SESSION['usuario_id'] ?? 'NULL'; // ID del admin logueado
        $admin_user = $_SESSION['usuario']    ?? 'sistema'; // Nombre del admin
        $ip         = $_SERVER['REMOTE_ADDR'] ?? ''; // IP del cliente

        // Registra la acción en la bitácora
        mysqli_query($conexion, "CALL sp_registrar_accion(
            $id_admin, '$admin_user', '$ip',
            'INSERT', 'estados_ticket', 'nombre', NULL, '$nombre_e'
        )");

        $response = ['success' => true, 'msg' => 'Estado creado correctamente'];
    } else {
        $response = ['success' => false, 'error' => 'Error al crear el estado'];
    }

} catch (Exception $e) {
    // Captura cualquier error inesperado y lo devuelve como respuesta JSON
    $response = ['success' => false, 'error' => $e->getMessage()];
}

// Devuelve la respuesta final en formato JSON
echo json_encode($response);