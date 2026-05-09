function obtenerParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleString('es-ES');
}

async function cargarDetalleTicket(ticketId) {
    const estado = document.getElementById('estadoCargando');
    const titulo = document.getElementById('tituloTicket');
    const meta = document.getElementById('metaTicket');
    const desc = document.getElementById('descripcionTicket');

    estado.textContent = 'Cargando detalle...';
    try {
        const res = await fetch(`/TICKETUCAD/app/models/php/obtener_ticket.php?id=${encodeURIComponent(ticketId)}`);
        const data = await res.json();

        if (!data.success) {
            titulo.textContent = 'Ticket no encontrado';
            desc.textContent = data.message || 'No se encontró información del ticket.';
            meta.innerHTML = '';
            return;
        }

        const t = data.ticket;
        titulo.textContent = `#${t.id} - ${t.titulo}`;
        meta.innerHTML = `
            <div class="meta-item"><small>Estado</small>${t.estado_nombre || '-'}</div>
            <div class="meta-item"><small>Prioridad</small>${t.prioridad_nombre || '-'}</div>
            <div class="meta-item"><small>Categoría</small>${t.categoria_nombre || '-'}</div>
            <div class="meta-item"><small>Creado por</small>${t.creador_nombre || '-'}</div>
            <div class="meta-item"><small>Asignado a</small>${t.asignado_nombre || 'Sin asignar'}</div>
            <div class="meta-item"><small>Fecha creación</small>${formatearFecha(t.fecha_creacion)}</div>
        `;
        desc.textContent = t.descripcion || 'Sin descripción.';
    } catch (err) {
        titulo.textContent = 'Error al cargar ticket';
        desc.textContent = 'Ocurrió un error al consultar el detalle.';
        meta.innerHTML = '';
        console.error(err);
    } finally {
        estado.textContent = '';
    }
}

async function cargarMensajes(ticketId) {
    const contenedor = document.getElementById('contenedorMensajes');
    contenedor.innerHTML = '<p style="color:#9ca3af;">Cargando respuestas...</p>';

    try {
        const res = await fetch(`/TICKETUCAD/app/models/php/obtener_respuestas_ticket.php?id=${encodeURIComponent(ticketId)}`);
        const data = await res.json();

        if (!data.success) {
            contenedor.innerHTML = `<p class="error">${data.message || 'No fue posible cargar respuestas.'}</p>`;
            return;
        }

        if (!data.respuestas.length) {
            contenedor.innerHTML = '<p style="color:#9ca3af;">Aún no hay respuestas para este ticket.</p>';
            return;
        }

        contenedor.innerHTML = data.respuestas.map(r => `
            <div class="msg">
                <div class="msg-head">
                    <span class="msg-user">${r.usuario_nombre || 'Usuario'}</span>
                    <span class="msg-date">${formatearFecha(r.fecha_creacion)}</span>
                </div>
                <div>${(r.mensaje || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
        `).join('');
    } catch (err) {
        contenedor.innerHTML = '<p class="error">Error al cargar el historial.</p>';
        console.error(err);
    }
}

async function enviarRespuesta(ticketId) {
    const txt = document.getElementById('txtRespuesta');
    const msg = document.getElementById('msgEnvio');
    const mensaje = txt.value.trim();

    if (!mensaje) {
        msg.textContent = 'Escribe una respuesta antes de enviar.';
        msg.className = 'error';
        return;
    }

    msg.textContent = 'Enviando...';
    msg.className = '';

    try {
        const fd = new FormData();
        fd.append('ticket_id', ticketId);
        fd.append('mensaje', mensaje);

        const res = await fetch('/TICKETUCAD/app/models/php/guardar_respuesta_ticket.php', {
            method: 'POST',
            body: fd
        });
        const data = await res.json();

        if (!data.success) {
            msg.textContent = data.message || 'No se pudo guardar la respuesta.';
            msg.className = 'error';
            return;
        }

        txt.value = '';
        msg.textContent = 'Respuesta enviada correctamente.';
        msg.className = '';
        await cargarMensajes(ticketId);
    } catch (err) {
        msg.textContent = 'Error de red al enviar respuesta.';
        msg.className = 'error';
        console.error(err);
    }
}

(function initVistaTicket() {
    const ticketId = obtenerParam('id');
    const btnVolver = document.getElementById('btnVolver');
    const btnEnviar = document.getElementById('btnEnviar');

    if (!ticketId) {
        document.getElementById('tituloTicket').textContent = 'Ticket inválido';
        document.getElementById('descripcionTicket').textContent = 'No se recibió el id del ticket.';
        return;
    }

    btnVolver.addEventListener('click', function () {
        window.location.href = '/TICKETUCAD/panel-administrador';
    });
    btnEnviar.addEventListener('click', function () {
        enviarRespuesta(ticketId);
    });

    cargarDetalleTicket(ticketId);
    cargarMensajes(ticketId);
})();
