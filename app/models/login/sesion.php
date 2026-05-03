<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['nombre']) && isset($_SESSION['rol'])) {
    echo json_encode([
        'autenticado' => true,
        'nombre'      => $_SESSION['nombre'],
        'rol'         => $_SESSION['rol']
    ]);
} else {
    echo json_encode(['autenticado' => false]);
}
