// ── Fecha actual en el dashboard ─────────────────────────────────────────────
const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
const fechaEl = document.getElementById('fecha-hoy');
if (fechaEl) fechaEl.textContent = new Date().toLocaleDateString('es-ES', opts);

// ── Datos del usuario: sesión PHP → sessionStorage → sidebar ─────────────────
async function cargarSesionUsuario() {
    try {
        const res  = await fetch('/TICKETUCAD/app/models/login/sesion.php');
        const data = await res.json();

        if (data.autenticado) {
            sessionStorage.setItem('ucad_nombre', data.nombre);
            sessionStorage.setItem('ucad_rol',    data.rol);

            const idRol = data.id_rol ?? data.rol_id ?? null;
            if (idRol != null) {
                sessionStorage.setItem('ucad_id_rol', String(idRol));
            }

            if (data.usuario_id != null) {
                sessionStorage.setItem('ucad_usuario_id', String(data.usuario_id));
            }

            return {
                ok: true,
                rol: data.rol,
                id_rol: idRol,
            };
        }
    } catch (e) {
        // Si falla el fetch, usar lo que haya en sessionStorage
    }

    const nombre = sessionStorage.getItem('ucad_nombre');
    const rol    = sessionStorage.getItem('ucad_rol');
    const idRol  = sessionStorage.getItem('ucad_id_rol');

    if (nombre && rol) {
        return {
            ok: true,
            rol,
            id_rol: idRol != null ? parseInt(idRol, 10) : null,
        };
    }

    return { ok: false };
}

function obtenerIdRolSesion() {
    const idRol = sessionStorage.getItem('ucad_id_rol');
    if (idRol == null || idRol === '') return null;
    const parsed = parseInt(idRol, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function obtenerRolActual() {
    return sessionStorage.getItem('ucad_rol') || '';
}

function pintarUsuarioSidebar() {
    const nombre = sessionStorage.getItem('ucad_nombre') || 'Usuario';
    const rol    = sessionStorage.getItem('ucad_rol')    || 'Sin rol';

    const elUserName   = document.querySelector('.user-name');
    const elUserRole   = document.querySelector('.user-role');
    const elUserAvatar = document.querySelector('.user-avatar');

    if (elUserName)   elUserName.textContent   = nombre;
    if (elUserRole)   elUserRole.textContent   = rol;
    if (elUserAvatar) elUserAvatar.textContent = nombre.charAt(0).toUpperCase();
}

function alertaAccesoDenegado() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso restringido',
            text: 'No tienes permiso para abrir esta sección.',
            background: '#0d1528',
            color: '#e2e8f0',
            confirmButtonColor: '#2563eb',
        });
    }
}

// ── Arranque: sesión → menú por rol → vista inicial ───────────────────────────
cargarSesionUsuario().then((sesion) => {
    if (!sesion.ok) {
        window.location.href = '/TICKETUCAD/inicio-sesion';
        return;
    }

    pintarUsuarioSidebar();

    const rol   = sesion.rol || obtenerRolActual();
    const idRol = sesion.id_rol ?? obtenerIdRolSesion();

    if (typeof aplicarMenuPorRol === 'function') {
        aplicarMenuPorRol(rol, idRol);
    }

    const params = new URLSearchParams(window.location.search);
    const viewFromQuery = params.get('view');
    const viewFromStorage = sessionStorage.getItem('ucad_view');
    let view = (viewFromQuery && viewMap[viewFromQuery]) ? viewFromQuery : viewFromStorage;

    if (!view) {
        view = typeof vistaPorDefectoSegura === 'function'
            ? vistaPorDefectoSegura(rol, idRol)
            : 'inicio';
    }

    if (typeof puedeAccederVistaMenu === 'function' && !puedeAccederVistaMenu(rol, view, idRol)) {
        view = typeof vistaPorDefectoSegura === 'function'
            ? vistaPorDefectoSegura(rol, idRol)
            : 'inicio';
    }

    if (typeof esUsuarioFinalMenu === 'function' && esUsuarioFinalMenu(rol, idRol)) {
        view = 'form_user';
    }

    if (window.location.search.includes('view=')) {
        window.history.replaceState(null, 'Panel Administrador', '/TICKETUCAD/panel-administrador');
    }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const nav = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (nav && nav.style.display !== 'none') {
        nav.classList.add('active');
    }

    cargarVista(view);
    sessionStorage.removeItem('ucad_view');
});

// ── URL amigable ──────────────────────────────────────────────────────────────
if (window.location.pathname !== '/TICKETUCAD/panel-administrador') {
    window.history.replaceState(null, 'Panel Administrador', '/TICKETUCAD/panel-administrador');
}

// ── Toggle sidebar móvil ──────────────────────────────────────────────────────
const sidebar   = document.getElementById('sidebar');
const btnToggle = document.getElementById('btnToggle');
if (btnToggle) {
    btnToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

document.addEventListener('click', e => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== btnToggle) {
        sidebar.classList.remove('open');
    }
});

// ── Carga dinámica de vistas ──────────────────────────────────────────────────
const mainContent = document.getElementById('main-content');

const viewMap = {
    inicio:       '/TICKETUCAD/app/views/pages/inicio.html',
    usuarios:     '/TICKETUCAD/app/views/pages/usuarios.html',
    reportes:     '/TICKETUCAD/app/views/pages/reportes.php',
    configuracion:'/TICKETUCAD/app/views/pages/configuraciones.html',
    tickets:      '/TICKETUCAD/app/views/pages/tickets.html',
    form_user:    '/TICKETUCAD/app/views/forms/form_user.html',
};

// Mapa: vista → archivo JS del controlador que debe re-ejecutarse cada vez
const scriptMap = {
    usuarios:      '/TICKETUCAD/app/controllers/usuarios/usuarios.js',
    configuracion: '/TICKETUCAD/app/controllers/configuraciones/configuraciones.js',
};

function cargarVista(view) {
    const rol   = obtenerRolActual();
    const idRol = obtenerIdRolSesion();

    if (typeof puedeAccederVistaMenu === 'function' && !puedeAccederVistaMenu(rol, view, idRol)) {
        alertaAccesoDenegado();
        view = typeof vistaPorDefectoSegura === 'function'
            ? vistaPorDefectoSegura(rol, idRol)
            : 'inicio';
    }

    if (typeof esUsuarioFinalMenu === 'function' && esUsuarioFinalMenu(rol, idRol)) {
        view = 'form_user';
    }

    if (view === 'dashboard') {
        if (typeof inicializarDashboard === 'function') {
            inicializarDashboard();
        } else {
            console.error('No se encontró la función inicializarDashboard.');
        }
        return;
    }

    const url = viewMap[view];
    if (!url) return;

    $('#main-content').load(url, function () {
        // Tickets: la función ya está cargada globalmente, solo la llamamos
        if (view === 'tickets' && typeof extraerTickets === 'function') {
            extraerTickets();
        }
        // Usuarios / Configuraciones: forzar re-ejecución del JS en cada visita
        if (scriptMap[view]) {
            $.getScript(scriptMap[view]);
        }
    });
}

// ── Nav activo + carga de vista ───────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const view = this.dataset.view;
        const rol   = obtenerRolActual();
        const idRol = obtenerIdRolSesion();

        if (typeof puedeAccederVistaMenu === 'function' && !puedeAccederVistaMenu(rol, view, idRol)) {
            alertaAccesoDenegado();
            return;
        }

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        if (view) cargarVista(view);
    });
});

// ── Pantalla completa ─────────────────────────────────────────────────────────
const btnFullscreen = document.getElementById('btnFullscreen');
if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}
