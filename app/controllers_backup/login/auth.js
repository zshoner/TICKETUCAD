/**
 * auth.js - Verificación de sesión y utilidades de autenticación (cliente)
 * Se carga antes de padmin.js para exponer las funciones que este necesita.
 */

// ── Verificar si hay sesión activa en sessionStorage ─────────────────────────
function haySessionLocal() {
    const nombre = sessionStorage.getItem('ucad_nombre');
    const rol    = sessionStorage.getItem('ucad_rol');
    return !!(nombre && rol);
}

// ── Cerrar sesión ─────────────────────────────────────────────────────────────
async function cerrarSesion() {
    try {
        await fetch('/TICKETUCAD/app/models/login/logout.php', { method: 'POST', credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    } catch (_) {
        // Si el servidor no responde igual limpiamos local
    } finally {
        sessionStorage.clear();
        window.location.replace('/TICKETUCAD/inicio-sesion');
    }
}

// ── Botón de logout ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }
});
