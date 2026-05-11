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

function getColorEstado(nombre) {
    if (!nombre) return '#ffffff';
    const texto = String(nombre).toLowerCase();
    if (texto.includes('espera')) return '#f97316';
    if (texto.includes('cerrado') || texto.includes('finaliz') || texto.includes('resuel')) return '#22c55e';
    return '#ffffff';
}

function escaparHtml(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function aplicarEstiloSelectEstado(selectEl, nombreEstado) {
    const c = getColorEstado(nombreEstado);
    selectEl.style.color = c;
    selectEl.style.borderColor = c;
}

function pintarControlesTicket(t, estados, usuarios, categorias) {
    const meta = document.getElementById('metaTicket');
    const estadoId = t.estado_id != null ? String(t.estado_id) : '';
    const catId = t.categoria_id != null ? String(t.categoria_id) : '';
    const asigId = t.asignado_id != null && t.asignado_id !== '' ? String(t.asignado_id) : '';

    let optsEstados = '';
    estados.forEach(est => {
        const sel = estadoId !== '' && String(est.id) === estadoId ? 'selected' : '';
        optsEstados += `<option value="${est.id}" ${sel}>${escaparHtml(est.nombre)}</option>`;
    });

    let optsCats = '<option value="">Sin categoría</option>';
    categorias.forEach(c => {
        const sel = catId !== '' && String(c.id) === catId ? 'selected' : '';
        optsCats += `<option value="${c.id}" ${sel}>${escaparHtml(c.nombre)}</option>`;
    });

    let optsUsers = '<option value="">Sin asignar</option>';
    usuarios.forEach(u => {
        const sel = asigId !== '' && String(u.id) === asigId ? 'selected' : '';
        optsUsers += `<option value="${u.id}" ${sel}>${escaparHtml(u.nombre)}</option>`;
    });

    meta.innerHTML = `
        <div class="meta-item">
            <small>Estado</small>
            <select id="selEstado" class="field-control">${optsEstados}</select>
        </div>
        <div class="meta-item">
            <small>Prioridad</small>
            <div style="padding-top:8px;">${escaparHtml(t.prioridad_nombre || '-')}</div>
        </div>
        <div class="meta-item">
            <small>Categoría</small>
            <select id="selCategoria" class="field-control">${optsCats}</select>
        </div>
        <div class="meta-item">
            <small>Creado por</small>
            <div style="padding-top:8px;">${escaparHtml(t.creador_nombre || '-')}</div>
        </div>
        <div class="meta-item">
            <small>Asignado a</small>
            <select id="selAsignado" class="field-control">${optsUsers}</select>
        </div>
        <div class="meta-item">
            <small>Fecha creación</small>
            <div style="padding-top:8px;">${escaparHtml(formatearFecha(t.fecha_creacion))}</div>
        </div>
    `;

    const selEstado = document.getElementById('selEstado');
    const idx = selEstado.selectedIndex;
    const nombreEst = idx >= 0 ? selEstado.options[idx].text : '';
    aplicarEstiloSelectEstado(selEstado, nombreEst);
}

async function cargarDetalleTicket(ticketId) {
    const estado = document.getElementById('estadoCargando');
    const titulo = document.getElementById('tituloTicket');
    const desc = document.getElementById('descripcionTicket');

    estado.textContent = 'Cargando detalle...';
    document.getElementById('msgAcciones').textContent = '';

    try {
        const [resTicket, resEst, resUsu, resCat] = await Promise.all([
            fetch(`/TICKETUCAD/app/models/php/obtener_ticket.php?id=${encodeURIComponent(ticketId)}`),
            fetch('/TICKETUCAD/app/models/php/obtener_estados.php'),
            fetch('/TICKETUCAD/app/models/php/obtener_usuarios.php'),
            fetch('/TICKETUCAD/app/models/php/obtener_categorias.php'),
        ]);

        const data = await resTicket.json();
        const estados = await resEst.json();
        const usuarios = await resUsu.json();
        const categorias = await resCat.json();

        if (!data.success) {
            titulo.textContent = 'Ticket no encontrado';
            desc.textContent = data.message || 'No se encontró información del ticket.';
            document.getElementById('metaTicket').innerHTML = '';
            return;
        }

        const t = data.ticket;
        titulo.textContent = `#${t.id} - ${t.titulo}`;
        desc.textContent = t.descripcion || 'Sin descripción.';

        pintarControlesTicket(t, estados, usuarios, categorias);
        enlazarControles(ticketId);
    } catch (err) {
        titulo.textContent = 'Error al cargar ticket';
        desc.textContent = 'Ocurrió un error al consultar el detalle.';
        document.getElementById('metaTicket').innerHTML = '';
        console.error(err);
    } finally {
        estado.textContent = '';
    }
}

function enlazarControles(ticketId) {
    const selEstado = document.getElementById('selEstado');
    const selCat = document.getElementById('selCategoria');
    const selAsig = document.getElementById('selAsignado');
    const msg = document.getElementById('msgAcciones');

    if (!selEstado || !selCat || !selAsig) return;

    selEstado.replaceWith(selEstado.cloneNode(true));
    selCat.replaceWith(selCat.cloneNode(true));
    selAsig.replaceWith(selAsig.cloneNode(true));

    const e = document.getElementById('selEstado');
    const c = document.getElementById('selCategoria');
    const a = document.getElementById('selAsignado');

    e.addEventListener('change', function () {
        const fd = new FormData();
        fd.append('ticket_id', ticketId);
        fd.append('estado_id', this.value);
        const texto = this.options[this.selectedIndex].text;
        aplicarEstiloSelectEstado(this, texto);
        msg.textContent = 'Guardando estado...';
        msg.className = '';
        fetch('/TICKETUCAD/app/models/php/actualizar_estado.php', { method: 'POST', body: fd })
            .then(() => {
                msg.textContent = 'Estado actualizado.';
                msg.className = 'ok';
            })
            .catch(() => {
                msg.textContent = 'Error al guardar estado.';
                msg.className = 'error';
            });
    });

    c.addEventListener('change', function () {
        const fd = new FormData();
        fd.append('ticket_id', ticketId);
        fd.append('categoria_id', this.value);
        msg.textContent = 'Guardando categoría...';
        msg.className = '';
        fetch('/TICKETUCAD/app/models/php/actualizar_categoria.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    msg.textContent = 'Categoría actualizada.';
                    msg.className = 'ok';
                } else {
                    msg.textContent = data.message || 'No se pudo actualizar.';
                    msg.className = 'error';
                }
            })
            .catch(() => {
                msg.textContent = 'Error al guardar categoría.';
                msg.className = 'error';
            });
    });

    a.addEventListener('change', function () {
        const fd = new FormData();
        fd.append('ticket_id', ticketId);
        fd.append('usuario_id', this.value);
        msg.textContent = 'Guardando asignación...';
        msg.className = '';
        fetch('/TICKETUCAD/app/models/php/actualizar_asignacion.php', { method: 'POST', body: fd })
            .then(() => {
                msg.textContent = 'Asignación actualizada.';
                msg.className = 'ok';
            })
            .catch(() => {
                msg.textContent = 'Error al guardar asignación.';
                msg.className = 'error';
            });
    });
}

async function cargarMensajes(ticketId) {
    const contenedor = document.getElementById('contenedorMensajes');
    contenedor.innerHTML = '<p style="color:#9ca3af;">Cargando respuestas...</p>';

    try {
        const res = await fetch(`/TICKETUCAD/app/models/php/obtener_respuestas_ticket.php?id=${encodeURIComponent(ticketId)}`);
        const data = await res.json();

        if (!data.success) {
            contenedor.innerHTML = `<p class="error">${escaparHtml(data.message || 'No fue posible cargar respuestas.')}</p>`;
            return;
        }

        if (!data.respuestas.length) {
            contenedor.innerHTML = '<p style="color:#9ca3af;">Aún no hay respuestas para este ticket.</p>';
            return;
        }

        contenedor.innerHTML = data.respuestas.map(r => `
            <div class="msg">
                <div class="msg-head">
                    <span class="msg-user">${escaparHtml(r.usuario_nombre || 'Usuario')}</span>
                    <span class="msg-date">${escaparHtml(formatearFecha(r.fecha_creacion))}</span>
                </div>
                <div>${escaparHtml(r.mensaje)}</div>
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
        msg.className = 'ok';
        await cargarMensajes(ticketId);
    } catch (err) {
        msg.textContent = 'Error de red al enviar respuesta.';
        msg.className = 'error';
        console.error(err);
    }
}

async function cerrarTicket(ticketId) {
    const msg = document.getElementById('msgAcciones');
    let confirmado = false;
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: '¿Cerrar ticket?',
            text: 'Seguro que desea continuar con esta acción.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            background: '#0f172a',
            color: '#e5e7eb'
        });
        confirmado = !!result.isConfirmed;
    } else {
        confirmado = confirm('¿Cerrar este ticket? Se pondrá en el estado de cierre configurado en la base de datos.');
    }

    if (!confirmado) return;

    msg.textContent = 'Cerrando ticket...';
    msg.className = '';
    try {
        const fd = new FormData();
        fd.append('ticket_id', ticketId);
        const res = await fetch('/TICKETUCAD/app/models/php/cerrar_ticket.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.success) {
            msg.textContent = data.message || 'No se pudo cerrar.';
            msg.className = 'error';
            return;
        }
        msg.textContent = `Ticket cerrado (${data.estado_nombre || 'OK'}).`;
        msg.className = 'ok';
        await cargarDetalleTicket(ticketId);
    } catch (e) {
        msg.textContent = 'Error al cerrar el ticket.';
        msg.className = 'error';
        console.error(e);
    }
}

(function initVistaTicket() {
    const idFromQuery = obtenerParam('id');
    const idFromStorage = sessionStorage.getItem('ucad_ticket_id');
    const ticketId = idFromQuery || idFromStorage;
    const btnVolver = document.getElementById('btnVolver');
    const btnEnviar = document.getElementById('btnEnviar');
    const btnCerrar = document.getElementById('btnCerrarTicket');

    if (idFromQuery) {
        sessionStorage.setItem('ucad_ticket_id', String(idFromQuery));
        window.history.replaceState(null, 'Vista ticket', '/TICKETUCAD/vista-ticket');
    }

    if (!ticketId) {
        document.getElementById('tituloTicket').textContent = 'Ticket inválido';
        document.getElementById('descripcionTicket').textContent = 'No se recibió el id del ticket.';
        return;
    }

    btnVolver.addEventListener('click', function () {
        sessionStorage.setItem('ucad_view', 'tickets');
        window.location.href = '/TICKETUCAD/panel-administrador';
    });
    btnEnviar.addEventListener('click', function () {
        enviarRespuesta(ticketId);
    });
    btnCerrar.addEventListener('click', function () {
        cerrarTicket(ticketId);
    });

    cargarDetalleTicket(ticketId);
    cargarMensajes(ticketId);
})();
