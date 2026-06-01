<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['nombre']) && isset($_SESSION['rol'])) {
    echo json_encode([
        'autenticado' => true,
        'nombre'      => $_SESSION['nombre'],
        'rol'         => $_SESSION['rol'],
        'id_rol'      => $_SESSION['rol_id'] ?? null,
        'rol_id'      => $_SESSION['rol_id'] ?? null,
        'usuario_id'  => $_SESSION['usuario_id'] ?? null,
    ]);
} else {
    echo json_encode(['autenticado' => false]);
}
