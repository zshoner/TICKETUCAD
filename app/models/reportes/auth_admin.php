<?php
require_once __DIR__ . '/../permiso_rol/verificacion_rol.php';

// Validar si el usuario no ha iniciado sesion o si no es administrador
if (!usuarioAutenticado() || !esAdmin($_SESSION['rol'])) {
    
    // Obtener la ruta del archivo actual que se esta ejecutando
    $scriptActual = $_SERVER['SCRIPT_NAME'] ?? '';
    
    // CASO A: Si la peticion viene por AJAX o es un archivo de datos, devolvemos una respuesta controlada
    if (
        (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') || 
        strpos($scriptActual, 'get_') !== false || 
        strpos($scriptActual, 'reporte_') !== false ||
        (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    ) {
        ob_clean();
        
        // Si se intentaba entrar directo a reportes.php por fuera, se inyecta la alerta de SweetAlert
        if (strpos($scriptActual, 'reportes.php') !== false) {
            echo "<script>
                Swal.fire({
                    icon: 'error',
                    title: '<span style=\"color: #ffffff;\">Acceso Restringido</span>',
                    html: '<p style=\"color: #94a3b8; font-size: 14.5px; margin-bottom: 0;\">No tienes los permisos necesarios para tener acceso a los reportes del sistema.</p>',
                    confirmButtonColor: '#2563eb',
                    confirmButtonText: 'Entendido',
                    background: '#111827',
                    color: '#fff',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    window.location.href = '/TICKETUCAD/app/views/pages/padmin.html';
                });
            </script>";
            exit;
        }

        // Si son archivos que devuelven datos (consultas), enviamos la respuesta en formato JSON
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'status' => 'restricted', 
            'message' => 'Acceso denegado: Privilegios de administrador insuficientes.'
        ]);
        exit;
    }
    
    // CASO B: Si el usuario intenta cargar la vista completa de reportes, mostramos una pantalla de error limpia
    else {
        ob_clean();
        echo "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Acceso Restringido - Ticket UCAD</title>
            <style>
                body { background-color: #0a0f1e; font-family: 'Segoe UI', Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            </style>
            <link rel='stylesheet' href='/TICKETUCAD/recursos/libs/sweetalert2/sweetalert2.min.css'>
            <script src='/TICKETUCAD/recursos/libs/sweetalert2/sweetalert2.min.js'></script>
        </head>
        <body>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    Swal.fire({
                        icon: 'error',
                        title: '<span style=\"color: #ffffff; font-family: \'Segoe UI\', sans-serif;\">Acceso Restringido</span>',
                        html: '<p style=\"color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: \'Segoe UI\', sans-serif;\">No tienes los permisos necesarios para tener acceso a los reportes del sistema.</p>',
                        confirmButtonColor: '#2563eb', 
                        confirmButtonText: 'Entendido',
                        background: '#111827', 
                        color: '#fff',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then((result) => {
                        window.location.href = '/TICKETUCAD/app/views/pages/padmin.html';
                    });
                });
            </script>
        </body>
        </html>";
        exit;
    }
}
?>