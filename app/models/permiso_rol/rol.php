<?php

/**
 * Configuración central de vistas permitidas por rol.
 */
function normalizarRol($rol)
{
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

    return 'agente';
}

function vistasAgente()
{
    return ['inicio', 'tickets', 'form_user', 'dashboard'];
}

function vistasAdmin()
{
    return array_merge(vistasAgente(), ['usuarios', 'reportes', 'configuracion']);
}

function vistasPorRol($rol)
{
    return normalizarRol($rol) === 'admin' ? vistasAdmin() : vistasAgente();
}

function puedeAccederVista($rol, $vista)
{
    return in_array($vista, vistasPorRol($rol), true);
}

function esAdmin($rol)
{
    return normalizarRol($rol) === 'admin';
}
