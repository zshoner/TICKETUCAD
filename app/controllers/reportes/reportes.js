$(document).ready(function() {
    // Variable global para filtros locales en los widgets
    let datosLocales = [];

    // 1. Llenar los selects al cargar la pagina
    function cargarSelectores() {
        $.ajax({
            url: 'app/models/reportes/get_filtros.php',
            type: 'GET',
            success: function(res) {
                if(res.status === 'success') {
                    // Cargar Tecnicos
                    let htmlTec = '<option value="">-- Todos --</option>';
                    res.tecnicos.forEach(t => {
                        htmlTec += `<option value="${t.id}">${t.nombre}</option>`;
                    });
                    $('#sel_tecnico').html(htmlTec);

                    // Cargar Deptos
                    let htmlDep = '<option value="">-- Todos --</option>';
                    res.departamentos.forEach(d => {
                        htmlDep += `<option value="${d.id}">${d.nombre}</option>`;
                    });
                    $('#sel_depto').html(htmlDep);

                    // Cargar Estados
                    let htmlEst = '<option value="">-- Todos --</option>';
                    res.estados.forEach(e => {
                        htmlEst += `<option value="${e.nombre}">${e.nombre}</option>`;
                    });
                    $('#sel_estado').html(htmlEst);
                }
            }
        });
    }

    cargarSelectores();

    // 2. Funcion para pintar la tabla con correcciones de Fecha y SLA
    function pintarTabla(data) {
        let rows = '';
        
        if (data.length > 0) {
            data.forEach(item => {
                // --- CORRECCIÓN: Renderizado de Fecha (13 may 2026) y Hora (12h AM/PM) ---
                const fechaObj = new Date(item.fecha_creacion);
                
                // Formato de fecha corta: 13 may 2026
                const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
                const fechaParte = fechaObj.toLocaleDateString('es-ES', opcionesFecha).replace('.', '');

                // Formato de hora: 11:01 PM
                const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                const horaParte = fechaObj.toLocaleTimeString('es-ES', opcionesHora).toUpperCase();

                const fechaFinal = `${fechaParte}, ${horaParte}`;

                // --- CORRECCIÓN: Estilos para el SLA (Icono + Badge) ---
                const esVencido = item.sla_status === 'VENCIDO';
                const slaColor = esVencido ? '#ef4444' : '#10b981';
                const slaIcon = esVencido ? 'fa-times-circle' : 'fa-check-circle';
                const slaBackground = esVencido ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                const slaBorder = esVencido ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                
                // Color para el estado (Badge original)
                const colorBadge = (item.es_final == 1) 
                    ? 'border: 1px solid #10b981; color: #10b981;' 
                    : 'border: 1px solid #3b82f6; color: #3b82f6;';

                rows += `
                    <tr>
                        <td class="text-white font-weight-bold">#${item.id_ticket}</td>
                        <td>${item.tecnico_nombre || '<span class="text-muted">Sin asignar</span>'}</td>
                        <td><small>${item.departamento}</small></td>
                        <td style="color: #94a3b8; font-size: 0.85rem;">${fechaFinal}</td>
                        <td>
                            <span class="badge" style="padding: 5px 10px; ${colorBadge}">
                                ${item.estado}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; color: ${slaColor}; background: ${slaBackground}; padding: 4px 10px; border-radius: 4px; width: fit-content; font-size: 11px; font-weight: bold; border: 1px solid ${slaBorder};">
                                <i class="fas ${slaIcon} mr-1"></i> ${item.sla_status}
                            </div>
                        </td>
                    </tr>`;
            });
        } else {
            rows = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay registros para mostrar.</td></tr>';
        }
        $('#tablaReportesBody').html(rows);
    }

    // 3. Boton para buscar (AJAX al servidor)
    $('#btnGenerarVista').on('click', function() {
        const btn = $(this);
        btn.prop('disabled', true).text('Buscando...');

        const filtros = {
            inicio: $('#fecha_inicio').val(),
            fin: $('#fecha_fin').val(),
            tecnico: $('#sel_tecnico').val(),
            departamento: $('#sel_depto').val(),
            estado: $('#sel_estado').val()
        };

        $.ajax({
            url: 'app/models/reportes/get_reportes.php',
            type: 'GET',
            data: filtros,
            success: function(res) {
                if (res.status === 'success') {
                    datosLocales = res.data; 
                    pintarTabla(datosLocales);
                    
                    // Actualizar los numeritos de los cuadros
                    $('#countTotal').text(res.stats.total);
                    $('#countResueltos').text(res.stats.resueltos);
                    $('#countPendientes').text(res.stats.pendientes);
                    $('#countVencidos').text(res.stats.vencidos);

                    // Pasar filtros a los hiddens para el PDF
                    $('#h_inicio').val(filtros.inicio);
                    $('#h_fin').val(filtros.fin);
                    $('#h_tecnico').val(filtros.tecnico);
                    $('#h_depto').val(filtros.departamento);
                    $('#h_estado').val(filtros.estado);
                }
                btn.prop('disabled', false).text('Generar Vista');
            },
            error: function() {
                btn.prop('disabled', false).text('Generar Vista');
                alert('Error al conectar con el servidor');
            }
        });
    });

    // 4. Filtro rapido al dar clic en los cuadros (Total, Resueltos, etc)
    $('.stat-box').on('click', function() {
        if (datosLocales.length === 0) return;

        const idStat = $(this).find('.stat-number').attr('id');
        let filtrados = [];

        if (idStat === 'countTotal') {
            filtrados = datosLocales;
        } else if (idStat === 'countResueltos') {
            filtrados = datosLocales.filter(t => t.es_final == 1);
        } else if (idStat === 'countPendientes') {
            filtrados = datosLocales.filter(t => t.es_final == 0);
        } else if (idStat === 'countVencidos') {
            filtrados = datosLocales.filter(t => t.sla_status === 'VENCIDO');
        }

        pintarTabla(filtrados);
    });

    // 5. Boton para limpiar filtros
    $('#btnLimpiar').on('click', function() {
        $('#fecha_inicio, #fecha_fin, #sel_tecnico, #sel_depto, #sel_estado').val('');
        $('#tablaReportesBody').html('<tr><td colspan="6" class="text-center py-4">Seleccione filtros para ver datos</td></tr>');
        $('.stat-number').text('0');
        datosLocales = [];
    });
});