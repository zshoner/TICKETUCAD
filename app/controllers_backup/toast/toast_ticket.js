(function () {
    const INTERVALO_MS = 8000;
    const STORAGE_KEY = 'ucad_toast_notificaciones_vistas';
    const ROL_ID_USUARIO_FINAL = 3;

    let pollingActivo = false;
    let consultando = false;

    function esUsuarioFinalSesion() {
        const idRol = sessionStorage.getItem('ucad_id_rol');
        if (idRol && parseInt(idRol, 10) === ROL_ID_USUARIO_FINAL) {
            return true;
        }

        const rol = (sessionStorage.getItem('ucad_rol') || '').toLowerCase();
        return rol.includes('usuario final');
    }

    async function esperarSesion(maxMs) {
        const limite = maxMs || 5000;
        const inicio = Date.now();

        while (Date.now() - inicio < limite) {
            if (sessionStorage.getItem('ucad_rol') || sessionStorage.getItem('ucad_id_rol')) {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return false;
    }

    function obtenerIdsVistos() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.map(Number) : [];
        } catch (e) {
            return [];
        }
    }

    function guardarIdVisto(id) {
        const ids = obtenerIdsVistos();
        if (!ids.includes(id)) {
            ids.push(id);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        }
    }

    function actualizarBadge(total) {
        const badge = document.getElementById('badge-notificaciones');
        if (!badge) return;

        badge.style.display = total > 0 ? 'block' : 'none';
    }

    function mostrarToast(notificacion) {
        if (typeof Swal === 'undefined') return;

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: true,
            background: '#0d1528',
            color: '#e2e8f0',
        });

        Toast.fire({
            icon: 'info',
            title: 'Nuevo ticket',
            text: notificacion.mensaje,
        });
    }

    async function marcarLeida(id) {
        try {
            await fetch('/TICKETUCAD/app/models/notificacion/marcar_leida.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ id }),
            });
        } catch (e) {
            console.error('No se pudo marcar la notificación como leída:', e);
        }
    }

    async function consultarNotificaciones() {
        if (consultando) return;
        consultando = true;

        try {
            const res = await fetch('/TICKETUCAD/app/models/notificacion/listar.php', {
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();

            if (!data || !data.ok || !data.autenticado) {
                actualizarBadge(0);
                return;
            }

            actualizarBadge(data.total || 0);

            const idsVistos = obtenerIdsVistos();
            const nuevas = (data.notificaciones || []).filter(
                (n) => !idsVistos.includes(Number(n.id))
            );

            for (const notificacion of nuevas) {
                mostrarToast(notificacion);
                guardarIdVisto(Number(notificacion.id));
                await marcarLeida(Number(notificacion.id));
            }

            if (nuevas.length > 0 && typeof extraerTickets === 'function') {
                extraerTickets();
            }
        } catch (e) {
            console.error('Error al consultar notificaciones:', e);
        } finally {
            consultando = false;
        }
    }

    function iniciarPollingNotificaciones() {
        if (pollingActivo) return;
        pollingActivo = true;

        consultarNotificaciones();
        setInterval(consultarNotificaciones, INTERVALO_MS);
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await esperarSesion();
        if (esUsuarioFinalSesion()) return;
        iniciarPollingNotificaciones();
    });
})();
