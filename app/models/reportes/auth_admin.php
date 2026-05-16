<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$rolActual = isset($_SESSION['rol']) ? strtoupper(trim($_SESSION['rol'])) : '';

if (!isset($_SESSION['usuario_id']) || ($rolActual !== 'ADMIN' && $rolActual !== 'ADMINISTRADOR')) {
    
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Acceso denegado.']);
        exit;
    } else {
        // Redirección visual corregida sin conflictos de comillas
        echo "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { background-color: #1e1e2f; font-family: sans-serif; }
            </style>
        </head>
        <body>
            <script>
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'No tienes los permisos necesarios para ver el módulo de reportes.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido',
                    background: '#1e1e2f',
                    color: '#fff'
                }).then((result) => {
                    // Retorno fluido al panel principal
                    window.location.href = '/TICKETUCAD/app/views/pages/padmin.html';
                });
            </script>
        </body>
        </html>";
        exit;
    }
}