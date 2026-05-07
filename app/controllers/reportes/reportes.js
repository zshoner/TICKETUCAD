$(document).ready(function() {
    
    function actualizarContadores(stats) {
        $('#countTotal').text(stats.total || 0);
        $('#countResueltos').text(stats.resueltos || 0);
        $('#countPendientes').text(stats.pendientes || 0);
        $('#countVencidos').text(stats.vencidos || 0);
    }

    // Delegación limpia para evitar duplicados al recargar la vista
    $(document).off('click', '#btnGenerarVista').on('click', '#btnGenerarVista', function(e) {
        e.preventDefault();
        
        const params = {
            inicio: $('#fecha_inicio').val(),
            fin: $('#fecha_fin').val(),
            tecnico: $('#sel_tecnico').val(),
            departamento: $('#sel_depto').val(),
            estado: $('#sel_estado').val()
        };

        const tablaBody = $('#tablaReportesBody');
        tablaBody.html('<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Cargando...</td></tr>');

        $.ajax({
            url: '/TICKETUCAD/app/models/reportes/get_reportes.php',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: function(json) {
                if (json.status === 'error') {
                    tablaBody.html(`<tr><td colspan="6" class="text-center text-danger">${json.message}</td></tr>`);
                    return;
                }
                
                tablaBody.empty();
                if (!json.data || json.data.length === 0) {
                    tablaBody.html('<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron resultados.</td></tr>');
                } else {
                    json.data.forEach(t => {
                        const badge = t.es_final == 1 ? 'badge-success' : 'badge-warning';
                        tablaBody.append(`
                            <tr>
                                <td class="font-weight-bold text-primary">#${t.id}</td>
                                <td>${t.tecnico_nombre || 'Sin técnico'}</td>
                                <td>${t.depto_nombre}</td>
                                <td>${t.fecha_creacion}</td>
                                <td><span class="badge ${badge}">${t.estado_nombre}</span></td>
                                <td class="font-weight-bold">${t.cumplimiento}</td>
                            </tr>
                        `);
                    });
                }
                actualizarContadores(json.stats || {});
            },
            error: function() {
                tablaBody.html('<tr><td colspan="6" class="text-center text-danger">Error de comunicación con el servidor.</td></tr>');
            }
        });
    });

    // Limpiar
    $(document).off('click', '#btnLimpiar').on('click', '#btnLimpiar', function() {
        $('#fecha_inicio').val('2026-04-01');
        $('#fecha_fin').val('2026-04-30');
        $('#sel_tecnico, #sel_depto, #sel_estado').val('');
        actualizarContadores({total:0, resueltos:0, pendientes:0, vencidos:0});
        $('#tablaReportesBody').html('<tr><td colspan="6" class="text-center py-5 text-muted">Defina los filtros y presione "Generar Vista".</td></tr>');
    });

    // Antes de exportar, pasamos los valores de los filtros a los campos ocultos
    $('#formExportar').on('submit', function() {
        $('#h_inicio').val($('#fecha_inicio').val());
        $('#h_fin').val($('#fecha_fin').val());
    });
});