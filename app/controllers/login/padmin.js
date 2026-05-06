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
        }
    } catch (e) {
        // Si falla el fetch, usar lo que haya en sessionStorage
    }

    const nombre = sessionStorage.getItem('ucad_nombre') || 'Administrador';
    const rol    = sessionStorage.getItem('ucad_rol')    || 'Super Admin';

    const elUserName   = document.querySelector('.user-name');
    const elUserRole   = document.querySelector('.user-role');
    const elUserAvatar = document.querySelector('.user-avatar');

    if (elUserName)   elUserName.textContent   = nombre;
    if (elUserRole)   elUserRole.textContent   = rol;
    if (elUserAvatar) elUserAvatar.textContent = nombre.charAt(0).toUpperCase();
}

// ── Arranque: primero sesión, luego vista inicio ──────────────────────────────
// Se usa await para garantizar que sessionStorage ya tiene nombre y rol
// antes de que el script de inicio.html se ejecute y los intente leer.
cargarSesionUsuario().then(() => cargarVista('inicio'));


// ── URL amigable ──────────────────────────────────────────────────────────────
if (window.location.pathname !== '/TICKETUCAD/panel-administrador') {
    window.history.replaceState(null, 'Panel Administrador', '/TICKETUCAD/panel-administrador');
}

// ── Toggle sidebar móvil ──────────────────────────────────────────────────────
const sidebar   = document.getElementById('sidebar');
const btnToggle = document.getElementById('btnToggle');
btnToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

document.addEventListener('click', e => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== btnToggle) {
        sidebar.classList.remove('open');
    }
});

// ── Carga dinámica de vistas ──────────────────────────────────────────────────
const mainContent   = document.getElementById('main-content');
const dashboardHTML = mainContent.innerHTML; // guarda el dashboard original

const viewMap = {
    inicio:       '/TICKETUCAD/app/views/pages/inicio.html',
    usuarios:     '/TICKETUCAD/app/views/pages/usuarios.html',
    reportes:     '/TICKETUCAD/app/views/pages/reportes.html',
    configuracion:'/TICKETUCAD/app/views/pages/configuraciones.html',
    tickets:      '/TICKETUCAD/app/views/pages/tickets.html',
};

function cargarVista(view) {
    if (view === 'dashboard') {
        mainContent.innerHTML = dashboardHTML;
        return;
    }
    const url = viewMap[view];
    if (!url) return;
    $('#main-content').load(url);
}

// ── Nav activo + carga de vista ───────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        const view = this.dataset.view;
        if (view) cargarVista(view);
    });
});

// ── Pantalla completa ─────────────────────────────────────────────────────────
document.getElementById('btnFullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});
