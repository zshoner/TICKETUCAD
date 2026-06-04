const ROL_ID_USUARIO_FINAL = 3;

const VISTAS_USUARIO_FINAL = ['form_user'];
const VISTAS_AGENTE = ['inicio', 'tickets', 'form_user', 'dashboard'];
const VISTAS_ADMIN = [...VISTAS_AGENTE, 'usuarios', 'reportes', 'configuracion'];

function obtenerIdRolActual(idRolExplicito) {
    if (idRolExplicito != null && idRolExplicito !== '') {
        const explicito = parseInt(idRolExplicito, 10);
        if (Number.isFinite(explicito)) return explicito;
    }

    const idRol = sessionStorage.getItem('ucad_id_rol');
    if (idRol == null || idRol === '') return null;

    const parsed = parseInt(idRol, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function limpiarTextoRol(rol) {
    return (rol || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function normalizarRolMenu(rol, idRolExplicito) {
    const idRol = obtenerIdRolActual(idRolExplicito);

    if (idRol === ROL_ID_USUARIO_FINAL) {
        return 'usuario_final';
    }

    const r = limpiarTextoRol(rol);

    if (
        ['admin', 'administrador', 'super admin', 'superadmin'].includes(r) ||
        r.includes('admin')
    ) {
        return 'admin';
    }

    if (r.includes('usuario final') || (r.includes('usuario') && r.includes('final'))) {
        return 'usuario_final';
    }

    return 'agente';
}

function esUsuarioFinalMenu(rol, idRolExplicito) {
    return normalizarRolMenu(rol, idRolExplicito) === 'usuario_final';
}

function obtenerVistasPermitidas(rol, idRolExplicito) {
    const tipo = normalizarRolMenu(rol, idRolExplicito);

    if (tipo === 'admin') return VISTAS_ADMIN;
    if (tipo === 'usuario_final') return VISTAS_USUARIO_FINAL;
    return VISTAS_AGENTE;
}

function puedeAccederVistaMenu(rol, vista, idRolExplicito) {
    if (!vista) return false;
    return obtenerVistasPermitidas(rol, idRolExplicito).includes(vista);
}

function aplicarInterfazPorRol(rol, idRolExplicito) {
    const esFinal = esUsuarioFinalMenu(rol, idRolExplicito);

    document.body.classList.toggle('usuario-final', esFinal);

    const headerSearch = document.getElementById('header-search');
    const btnNotif = document.getElementById('btn-notificaciones');
    const btnMensajes = document.getElementById('btn-mensajes');
    const navSectionPrincipal = document.querySelector('.nav-section:not(.nav-section-gestion)');

    if (headerSearch) headerSearch.style.display = esFinal ? 'none' : '';
    if (btnNotif) btnNotif.style.display = esFinal ? 'none' : '';
    if (btnMensajes) btnMensajes.style.display = esFinal ? 'none' : '';
    if (navSectionPrincipal) navSectionPrincipal.style.display = esFinal ? 'none' : '';
}

function aplicarMenuPorRol(rol, idRolExplicito) {
    const permitidas = obtenerVistasPermitidas(rol, idRolExplicito);
    const esAdmin = normalizarRolMenu(rol, idRolExplicito) === 'admin';

    document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
        const view = item.dataset.view;
        const visible = permitidas.includes(view);
        item.style.display = visible ? '' : 'none';
        item.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });

    const seccionGestion = document.querySelector('.nav-section-gestion');
    if (seccionGestion) {
        seccionGestion.style.display = esAdmin ? '' : 'none';
    }

    document.querySelectorAll('.nav-item-gestion').forEach((item) => {
        item.style.display = esAdmin ? '' : 'none';
    });

    aplicarInterfazPorRol(rol, idRolExplicito);
}

function vistaPorDefectoSegura(rol, idRolExplicito) {
    if (esUsuarioFinalMenu(rol, idRolExplicito)) {
        return 'form_user';
    }

    const permitidas = obtenerVistasPermitidas(rol, idRolExplicito);
    return permitidas.includes('inicio') ? 'inicio' : permitidas[0];
}
