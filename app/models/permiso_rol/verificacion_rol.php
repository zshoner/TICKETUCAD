<?php

require_once __DIR__ . '/rol.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function usuarioAutenticado()
{
    return isset($_SESSION['usuario_id']) && !empty($_SESSION['rol']);
}

function requerirAjax()
{
    $esAjax = (
        (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
        (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    );

    if (!$esAjax) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(403);
        }
        echo json_encode([
            'success' => false,
            'status'  => 'restricted',
            'message' => 'Acceso directo no permitido.',
        ]);
        exit;
    }
}

function rechazarAccesoJson($mensaje = 'Acceso denegado.')
{
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(403);
    }
    echo json_encode([
        'success' => false,
        'status'  => 'restricted',
        'message' => $mensaje,
    ]);
    exit;
}

function requerirAutenticacion()
{
    if (!usuarioAutenticado()) {
        rechazarAccesoJson('Sesión no válida. Inicia sesión nuevamente.');
    }
}

function requerirAdmin()
{
    requerirAutenticacion();
    if (!esAdmin($_SESSION['rol'])) {
        rechazarAccesoJson('No tienes permisos de administrador para esta acción.');
    }
}

function requerirVista($vista)
{
    requerirAutenticacion();
    if (!puedeAccederVista($_SESSION['rol'], $vista)) {
        rechazarAccesoJson('No tienes permiso para acceder a esta sección.');
    }
}
