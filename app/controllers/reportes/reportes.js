$(document).ready(function() {
    let datosLocales = [];
    let datosFiltradosActuales = []; 
    let paginaActual = 1;
    const registrosPorPagina = 10; 

    function verificarRestriccion(res) {
        if (res && res.status === 'restricted') {
            Swal.fire({
                icon: 'error',
                title: '<span style="color: #ffffff; font-family: \'Segoe UI\', sans-serif;">Sesión Inválida</span>',
                html: `<p style="color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: 'Segoe UI', sans-serif;">${res.message || 'No tienes permisos.'}</p>`,
                confirmButtonColor: '#2563eb',
                background: '#111827',
                color: '#fff',
                allowOutsideClick: false
            }).then(() => {
                window.location.href = '/TICKETUCAD/app/views/pages/padmin.html';
            });
            return true; 
        }
        return false;
    }

    function cargarSelectores() {
        $.ajax({
            url: 'app/models/reportes/get_filtros.php',
            type: 'GET',
            dataType: 'json', 
            success: function(res) {
                if (verificarRestriccion(res)) return;
                if(res.status === 'success') {
                    let htmlTec = '<option value="">-- Todos --</option>';
                    res.tecnicos.forEach(t => { htmlTec += `<option value="${t.id}">${t.nombre}</option>`; });
                    $('#sel_tecnico').html(htmlTec);

                    let htmlDep = '<option value="">-- Todos --</option>';
                    res.departamentos.forEach(d => { htmlDep += `<option value="${d.id}">${d.nombre}</option>`; });
                    $('#sel_depto').html(htmlDep);

                    let htmlEst = '<option value="">-- Todos --</option>';
                    res.estados.forEach(e => { htmlEst += `<option value="${e.nombre}">${e.nombre}</option>`; });
                    $('#sel_estado').html(htmlEst);

                    if (typeof $.fn.select2 !== 'undefined') {
                        $('#sel_tecnico, #sel_depto').select2({ theme: 'bootstrap4', allowClear: true, width: '100%' });
                    }
                }
            }
        });
    }

    cargarSelectores();

    function pintarTablaPaginada(pagina) {
        paginaActual = pagina;
        let rows = '';
        const totalRegistros = datosFiltradosActuales.length;
        
        if (totalRegistros > 0) {
            const indiceInicio = (paginaActual - 1) * registrosPorPagina;
            const indiceFin = Math.min(indiceInicio + registrosPorPagina, totalRegistros);
            const registrosPagina = datosFiltradosActuales.slice(indiceInicio, indiceFin);
            
            registrosPagina.forEach(item => {
                const fechaObj = new Date(item.fecha_creacion);
                const fechaFinal = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') + ', ' + 
                                   fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

                const esVencido = item.sla_status === 'VENCIDO';
                const slaColor = esVencido ? '#ef4444' : '#10b981';
                const slaIcon = esVencido ? 'fa-times-circle' : 'fa-check-circle';
                const slaBg = esVencido ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                const slaBorder = esVencido ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                const colorBadge = (item.es_final == 1) ? 'border: 1px solid #10b981; color: #10b981;' : 'border: 1px solid #3b82f6; color: #3b82f6;';

                rows += `<tr>
                            <td class="text-white font-weight-bold">#${item.id_ticket}</td>
                            <td>${item.tecnico_nombre || '<span class="text-muted">Sin asignar</span>'}</td>
                            <td><small>${item.departamento}</small></td>
                            <td style="color: #94a3b8; font-size: 0.85rem;">${fechaFinal}</td>
                            <td><span class="badge" style="padding: 5px 10px; ${colorBadge}">${item.estado}</span></td>
                            <td>
                                <div style="display: flex; align-items: center; color: ${slaColor}; background: ${slaBg}; padding: 4px 10px; border-radius: 4px; width: fit-content; font-size: 11px; font-weight: bold; border: 1px solid ${slaBorder};">
                                    <i class="fas ${slaIcon} mr-1"></i> ${item.sla_status}
                                </div>
                            </td>
                        </tr>`;
            });
            $('#paginacionInfo').text(`${indiceInicio + 1} a ${indiceFin}`);
            $('#paginacionTotal').text(totalRegistros);
        } else {
            rows = '<tr><td colspan="6" class="text-center py-5 text-muted">No hay registros para mostrar.</td></tr>';
            $('#paginacionInfo').text('0 a 0');
            $('#paginacionTotal').text('0');
        }
        $('#tablaReportesBody').html(rows);
        actualizarControlesPaginacion(totalRegistros);
    }

    function actualizarControlesPaginacion(total) {
        const totalPaginas = Math.ceil(total / registrosPorPagina) || 1;
        $('#paginaActualTxt').text(paginaActual);
        $('#totalPaginasTxt').text(totalPaginas);
        $('#btnPaginaAnterior').prop('disabled', paginaActual <= 1);
        $('#btnPaginaSiguiente').prop('disabled', paginaActual >= totalPaginas);
    }

    $('#btnPaginaAnterior').on('click', function() { if (paginaActual > 1) pintarTablaPaginada(--paginaActual); });
    $('#btnPaginaSiguiente').on('click', function() {
        const totalPaginas = Math.ceil(datosFiltradosActuales.length / registrosPorPagina) || 1;
        if (paginaActual < totalPaginas) pintarTablaPaginada(++paginaActual);
    });

    $('#btnGenerarVista').on('click', function() {
        const btn = $(this);
        const filtros = {
            inicio: $('#fecha_inicio').val(),
            fin: $('#fecha_fin').val(),
            tecnico: $('#sel_tecnico').val(),
            departamento: $('#sel_depto').val(),
            estado: $('#sel_estado').val()
        };

        if (!filtros.inicio || !filtros.fin) {
            Swal.fire({ icon: 'warning', title: 'Rango Requerido', text: 'Debe seleccionar fechas de inicio y fin.', confirmButtonColor: '#2563eb', background: '#111827', color: '#fff' });
            return;
        }

        btn.prop('disabled', true).text('Buscando...');

        $.ajax({
            url: 'app/models/reportes/get_reportes.php',
            type: 'GET',
            data: filtros,
            dataType: 'json',
            success: function(res) {
                if (verificarRestriccion(res)) { btn.prop('disabled', false).text('Generar Vista'); return; }
                if (res.status === 'success') {
                    datosLocales = res.data; 
                    datosFiltradosActuales = res.data; 
                    pintarTablaPaginada(1);
                    $('#h_inicio').val(filtros.inicio);
                    $('#h_fin').val(filtros.fin);
                    $('#h_tecnico').val(filtros.tecnico);
                    $('#h_depto').val(filtros.departamento);
                    $('#h_estado').val(filtros.estado);
                }
                btn.prop('disabled', false).text('Generar Vista');
            },
            error: function() { btn.prop('disabled', false).text('Generar Vista'); }
        });
    });

    $('#btnLimpiar').on('click', function() {
        $('#fecha_inicio, #fecha_fin, #sel_estado').val('');
        if (typeof $.fn.select2 !== 'undefined') $('#sel_tecnico, #sel_depto').val('').trigger('change');
        else $('#sel_tecnico, #sel_depto').val('');
        
        $('#tablaReportesBody').html('<tr><td colspan="6" class="text-center py-5 text-muted">Defina los filtros y presione "Generar Vista".</td></tr>');
        datosLocales = []; datosFiltradosActuales = []; paginaActual = 1;
        $('#paginacionInfo').text('0 a 0'); $('#paginacionTotal').text('0');
        $('#paginaActualTxt').text('1'); $('#totalPaginasTxt').text('1');
        $('#btnPaginaAnterior, #btnPaginaSiguiente').prop('disabled', true);
        $('#h_inicio, #h_fin, #h_tecnico, #h_depto, #h_estado, #h_usuario_activo').val('');
    });

    $(document).on('submit', '#formExportar', function(e) {
        if (datosLocales.length === 0) {
            e.preventDefault();
            Swal.fire({ icon: 'warning', title: 'Exportación Vacía', text: 'Genere una vista previa con datos antes de exportar.', confirmButtonColor: '#2563eb', background: '#111827', color: '#fff' });
            return false;
        }
        this.target = '_blank';
    });
});