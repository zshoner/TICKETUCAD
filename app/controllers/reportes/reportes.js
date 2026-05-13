$(document).ready(function() {
    // Variable global para almacenar los datos actuales y poder filtrar localmente
    let datosLocales = [];

    // 1. Carga inicial de selectores (Técnicos, Deptos, Estados)
    function inicializarFiltros() {
        $.ajax({
            url: '/TICKETUCAD/app/models/reportes/get_filtros.php',
            type: 'GET',
            success: function(res) {
                if(res.status === 'success') {
                    let htmlTec = '<option value="">Todos los técnicos</option>';
                    res.tecnicos.forEach(t => htmlTec += `<option value="${t.id}">${t.nombre}</option>`);
                    $('#sel_tecnico').html(htmlTec);

                    let htmlDep = '<option value="">Cualquier Departamento</option>';
                    res.departamentos.forEach(d => htmlDep += `<option value="${d.id}">${d.nombre}</option>`);
                    $('#sel_depto').html(htmlDep);

                    let htmlEst = '<option value="">Todos los estados</option>';
                    res.estados.forEach(e => htmlEst += `<option value="${e.nombre}">${e.nombre}</option>`);
                    $('#sel_estado').html(htmlEst);
                }
            }
        });
    }

    inicializarFiltros();

    // 2. Función para renderizar la tabla basada en un array de datos
    function renderizarTabla(data) {
        let rows = '';
        if (data.length > 0) {
            data.forEach(item => {
                const slaClass = item.sla_status === 'VENCIDO' ? 'text-danger' : 'text-success';
                rows += `
                    <tr>
                        <td><strong>#${item.id_ticket}</strong></td>
                        <td>${item.tecnico_nombre || '<span class="text-muted small">Sin asignar</span>'}</td>
                        <td>${item.departamento}</td>
                        <td>${item.fecha_creacion}</td>
                        <td><span class="badge" style="background:rgba(37,99,235,0.1); color:#60a5fa; border:1px solid rgba(37,99,235,0.2); padding:4px 8px;">${item.estado}</span></td>
                        <td class="${slaClass}"><strong>${item.sla_status}</strong></td>
                    </tr>`;
            });
        } else {
            rows = '<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron registros coincidentes.</td></tr>';
        }
        $('#tablaReportesBody').html(rows);
    }

    // 3. Botón Generar Vista (Consulta al Servidor)
    $('#btnGenerarVista').on('click', function() {
        const btn = $(this);
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> BUSCANDO...');

        const params = {
            inicio: $('#fecha_inicio').val(),
            fin: $('#fecha_fin').val(),
            tecnico: $('#sel_tecnico').val(),
            departamento: $('#sel_depto').val(),
            estado: $('#sel_estado').val()
        };

        $.ajax({
            url: '/TICKETUCAD/app/models/reportes/get_reportes.php',
            type: 'GET',
            data: params,
            success: function(res) {
                if (res.status === 'success') {
                    datosLocales = res.data; // Guardamos para filtros de widgets
                    renderizarTabla(datosLocales);
                    
                    // Actualizar contadores visuales
                    $('#countTotal').text(res.stats.total);
                    $('#countResueltos').text(res.stats.resueltos);
                    $('#countPendientes').text(res.stats.pendientes);
                    $('#countVencidos').text(res.stats.vencidos);

                    // Sincronizar hiddens para exportación
                    $('#h_inicio').val(params.inicio);
                    $('#h_fin').val(params.fin);
                }
                btn.prop('disabled', false).html('<i class="fas fa-search mr-1"></i> Generar Vista');
            }
        });
    });

    // 4. Lógica de los Recuadros (Widgets) - Filtro rápido local
    $('.stat-box').on('click', function() {
        if (datosLocales.length === 0) return;

        // Quitamos clase activa de otros y ponemos al actual (opcional visual)
        $('.stat-box').css('border-color', 'rgba(255,255,255,0.08)');
        $(this).css('border-color', '#2563eb');

        const tipo = $(this).find('.stat-number').attr('id');
        let filtrados = [];

        switch(tipo) {
            case 'countTotal':
                filtrados = datosLocales;
                break;
            case 'countResueltos':
                filtrados = datosLocales.filter(t => t.es_final == 1);
                break;
            case 'countPendientes':
                filtrados = datosLocales.filter(t => t.es_final == 0);
                break;
            case 'countVencidos':
                filtrados = datosLocales.filter(t => t.sla_status === 'VENCIDO');
                break;
        }
        renderizarTabla(filtrados);
    });

    // 5. Botón Limpiar (Reset total)
    $('#btnLimpiar').on('click', function() {
    // Forzamos el vaciado de los inputs de fecha
    $('#fecha_inicio').val('');
    $('#fecha_fin').val('');

    // Si quieres que el resto de selects también se limpien
    $('#sel_tecnico').val('');
    $('#sel_departamento').val('');
    $('#sel_estado').val('');

    // Limpiamos la tabla visualmente
    $('#tablaReportesBody').html('<tr><td colspan="6" class="text-center py-5" style="color: #94a3b8 !important;">Defina los filtros y presione "Generar Vista".</td></tr>');
    
    // Reseteamos los contadores de los cuadros a cero
    $('.stat-number').text('0');
});

    function renderizarTabla(data) {
    let rows = '';
    
    // Función auxiliar para formatear fecha (DD/MM/YYYY HH:mm)
    const formatearFecha = (fechaRaw) => {
        if(!fechaRaw) return "---";
        const d = new Date(fechaRaw);
        return d.toLocaleDateString('es-ES', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (data.length > 0) {
        data.forEach(item => {
            // Lógica Pro para el SLA
            const esVencido = item.sla_status === 'VENCIDO';
            const slaIcon = esVencido ? 'fa-exclamation-circle' : 'fa-check-circle';
            const slaClass = esVencido ? 'badge-sla-danger' : 'badge-sla-success';

            // Lógica Pro para Estados
            const esFinalizado = item.es_final == 1;
            const estadoBadge = esFinalizado 
                ? 'rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2);' 
                : 'rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2);';

            rows += `
                <tr>
                    <td class="text-white font-weight-bold">#${item.id_ticket}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-mini mr-2">${item.tecnico_nombre ? item.tecnico_nombre.charAt(0) : '?'}</div>
                            <span>${item.tecnico_nombre || 'Sin asignar'}</span>
                        </div>
                    </td>
                    <td><span class="text-muted small">${item.departamento}</span></td>
                    <td class="font-italic" style="color: #94a3b8;">${formatearFecha(item.fecha_creacion)}</td>
                    <td>
                        <span class="badge py-1 px-2" style="${estadoBadge}">
                            ${item.estado}
                        </span>
                    </td>
                    <td>
                        <div class="${slaClass}">
                            <i class="fas ${slaIcon} mr-1"></i> ${item.sla_status}
                        </div>
                    </td>
                </tr>`;
        });
    } else {
        rows = '<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron registros coincidentes.</td></tr>';
    }
    $('#tablaReportesBody').html(rows);
}
});