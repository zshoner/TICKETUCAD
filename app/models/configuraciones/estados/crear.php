<?php
session_start(); // Inicia la sesión para acceder a los datos del usuario logueado
header('Content-Type: application/json'); // Indica que la respuesta será en formato JSON
require_once __DIR__ . '/../../permiso_rol/verificacion_rol.php'; // Carga las funciones de verificación de roles
requerirAdmin(); // Verifica que el usuario tenga rol de administrador
require_once '../../php/conexion.php'; // Establece la conexión con la base de datos

// Recibe y sanitiza los datos del formulario
$nombre   = trim($_POST['nombre']    ?? ''); // Elimina espacios en blanco
$es_final = intval($_POST['es_final'] ?? 0); // Convierte a entero (0 o 1)

// Valida que el nombre no esté vacío
if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'El nombre es requerido']);
    exit;
}

try {
    // Escapa los valores para prevenir inyección SQL
    $nombre_e = mysqli_real_escape_string($conexion, $nombre);
    $es_final = $es_final ? 1 : 0; // Garantiza que sea 0 o 1

    // Construye y ejecuta la consulta de inserción
    $sql = "INSERT INTO estados_ticket (nombre, es_final) VALUES ('$nombre_e', $es_final)";

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