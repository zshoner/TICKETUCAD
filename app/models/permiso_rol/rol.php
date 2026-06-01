<?php

define('ROL_ID_USUARIO_FINAL', 3);

/**
 * Configuración central de vistas permitidas por rol.
 */
function normalizarRol($rol, $rolId = null)
{
    if ((int) $rolId === ROL_ID_USUARIO_FINAL) {
        return 'usuario_final';
    }

    $r = strtolower(trim((string) $rol));
    $r = str_replace(
        ['á', 'é', 'í', 'ó', 'ú', 'ñ'],
        ['a', 'e', 'i', 'o', 'u', 'n'],
        $r
    );

    if (
        in_array($r, ['admin', 'administrador', 'super admin', 'superadmin'], true)
        || strpos($r, 'admin') !== false
    ) {
        return 'admin';
    }

    if (strpos($r, 'usuario final') !== false || $r === 'usuario final') {
        return 'usuario_final';
    }

    return 'agente';
}

function obtenerRolIdSesion()
{
    if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['rol_id'])) {
        return (int) $_SESSION['rol_id'];
    }

    return null;
}

function vistasUsuarioFinal()
{
    return ['form_user'];
}

function vistasAgente()
{
    return ['inicio', 'tickets', 'form_user', 'dashboard'];
}

function vistasAdmin()
{
    return array_merge(vistasAgente(), ['usuarios', 'reportes', 'configuracion']);
}

function vistasPorRol($rol, $rolId = null)
{
    if ($rolId === null) {
        $rolId = obtenerRolIdSesion();
    }

    $tipo = normalizarRol($rol, $rolId);

    if ($tipo === 'admin') {
        return vistasAdmin();
    }

    if ($tipo === 'usuario_final') {
        return vistasUsuarioFinal();
    }

    return vistasAgente();
}

function puedeAccederVista($rol, $vista)
{
    return in_array($vista, vistasPorRol($rol), true);
}

function esAdmin($rol)
{
    return normalizarRol($rol, obtenerRolIdSesion()) === 'admin';
}

function esUsuarioFinal($rol)
{
    return normalizarRol($rol, obtenerRolIdSesion()) === 'usuario_final';
}
