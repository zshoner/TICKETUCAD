<?php
session_start();

$allowedViews = [
    'login'            => 'views/pages/login.html',
    'inicio'           => 'views/pages/inicio.html',
    'padmin'           => 'views/pages/padmin.html',
    'usuarios'         => 'views/pages/usuarios.html',
    'reportes'         => 'views/pages/reportes.php',
    'configuracion'    => 'views/pages/configuraciones.html',
    'tickets'          => 'views/pages/tickets.html',
    'dashboard'        => 'views/pages/dashboard.html',
    'form_user'        => 'views/forms/form_user.html',
    'vista_ticket'     => 'views/pages/vista_ticket.html',
    'cambiar_password' => 'views/pages/cambiar_password.html',
];

$aliasViews = [
    'formulario-usuario' => 'form_user',
    'vista-ticket'       => 'vista_ticket',
];

$view = trim((string)($_GET['view'] ?? ''));
if ($view === '' && isset($_GET['page'])) {
    $view = trim((string)$_GET['page']);
}

if (isset($aliasViews[$view])) {
    $view = $aliasViews[$view];
}

if (!array_key_exists($view, $allowedViews)) {
    header('HTTP/1.1 404 Not Found');
    echo 'Página no encontrada.';
    exit;
}

$publicViews = ['login'];

if (!in_array($view, $publicViews, true)) {
    if (empty($_SESSION['usuario_id']) || empty($_SESSION['rol'])) {
        header('Location: /TICKETUCAD/inicio-sesion');
        exit;
    }
}

$path = __DIR__ . '/../' . $allowedViews[$view];
if (!is_file($path)) {
    header('HTTP/1.1 404 Not Found');
    echo 'Recurso no encontrado.';
    exit;
}

$ext = pathinfo($path, PATHINFO_EXTENSION);
if ($ext === 'php') {
    include $path;
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($path);
exit;
