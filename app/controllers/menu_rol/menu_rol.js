const VISTAS_AGENTE = ['inicio', 'tickets', 'form_user', 'dashboard'];
const VISTAS_ADMIN = [...VISTAS_AGENTE, 'usuarios', 'reportes', 'configuracion'];

function normalizarRolMenu(rol) {
    let r = (rol || '').toLowerCase().trim();
    r = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (
        ['admin', 'administrador', 'super admin', 'superadmin'].includes(r) ||
        r.includes('admin')
    ) {
        return 'admin';
    }
    return 'agente';
}

function obtenerVistasPermitidas(rol) {
    return normalizarRolMenu(rol) === 'admin' ? VISTAS_ADMIN : VISTAS_AGENTE;
}

function puedeAccederVistaMenu(rol, vista) {
    if (!vista) return false;
    return obtenerVistasPermitidas(rol).includes(vista);
}

function aplicarMenuPorRol(rol) {
    const permitidas = obtenerVistasPermitidas(rol);
    const esAdmin = normalizarRolMenu(rol) === 'admin';

    document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
        const view = item.dataset.view;
        item.style.display = permitidas.includes(view) ? '' : 'none';
    });

    const seccionGestion = document.querySelector('.nav-section-gestion');
    if (seccionGestion) {
        seccionGestion.style.display = esAdmin ? '' : 'none';
    }

    document.querySelectorAll('.nav-item-gestion').forEach((item) => {
        item.style.display = esAdmin ? '' : 'none';
    });
}

function vistaPorDefectoSegura(rol) {
    const permitidas = obtenerVistasPermitidas(rol);
    return permitidas.includes('inicio') ? 'inicio' : permitidas[0];
}
