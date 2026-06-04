$(document).ready(function() {
    let datosLocales = [];
    let datosFiltradosActuales = []; 
    let paginaActual = 1;
    const registrosPorPagina = 6; 

    function verificarRestriccion(res) {
        if (res && res.status === 'restricted') {
            Swal.fire({
                icon: 'error',
                title: '<span style="color: #ffffff; font-family: \'Segoe UI\', sans-serif;">Sesión Inválida</span>',
                html: `<p style="color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: 'Segoe UI', sans-serif;">${res.message || 'No tienes permisos para interactuar con esta sección.'}</p>`,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Entendido',
                background: '#111827',
                color: '#fff',
                allowOutsideClick: false,
                allowEscapeKey: false
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
                    res.tecnicos.forEach(t => {
                        htmlTec += `<option value="${t.id}">${t.nombre}</option>`;
                    });
                    $('#sel_tecnico').html(htmlTec);

                    let htmlDep = '<option value="">-- Todos --</option>';
                    res.departamentos.forEach(d => {
                        htmlDep += `<option value="${d.id}">${d.nombre}</option>`;
                    });
                    $('#sel_depto').html(htmlDep);

                    let htmlEst = '<option value="">-- Todos --</option>';
                    res.estados.forEach(e => {
                        htmlEst += `<option value="${e.nombre}">${e.nombre}</option>`;
                    });
                    $('#sel_estado').html(htmlEst);

                    if (typeof $.fn.select2 !== 'undefined') {
                        $('#sel_tecnico, #sel_depto').select2({
                            theme: 'bootstrap4',
                            placeholder: "Seleccione una opción",
                            allowClear: true,
                            width: '100%'
                        });
                    }
                }
            },
            error: function(xhr) {
                try {
                    let jsonErr = JSON.parse(xhr.responseText);
                    if (verificarRestriccion(jsonErr)) return;
                } catch(e) {}
                console.error('Error al inicializar filtros relacionales.');
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
                const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
                const fechaParte = fechaObj.toLocaleDateString('es-ES', opcionesFecha).replace('.', '');

                const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                const horaParte = fechaObj.toLocaleTimeString('es-ES', opcionesHora).toUpperCase();

                const fechaFinal = `${fechaParte}, ${horaParte}`;

                const esVencido = item.sla_status === 'VENCIDO';
                const slaColor = esVencido ? '#ef4444' : '#10b981';
                const slaIcon = esVencido ? 'fa-times-circle' : 'fa-check-circle';
                const slaBackground = esVencido ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                const slaBorder = esVencido ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                
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

    function actualizarControlesPaginacion(totalRegistros) {
        const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;

        $('#paginaActualTxt').text(paginaActual);
        $('#totalPaginasTxt').text(totalPaginas);

        if (paginaActual <= 1) {
            $('#btnPaginaAnterior').prop('disabled', true);
        } else {
            $('#btnPaginaAnterior').prop('disabled', false);
        }

        if (paginaActual >= totalPaginas) {
            $('#btnPaginaSiguiente').prop('disabled', true);
        } else {
            $('#btnPaginaSiguiente').prop('disabled', false);
        }
    }

    $('#btnPaginaAnterior').on('click', function() {
        if (paginaActual > 1) {
            paginaActual--;
            pintarTablaPaginada(paginaActual);
        }
    });

    $('#btnPaginaSiguiente').on('click', function() {
        const totalPaginas = Math.ceil(datosFiltradosActuales.length / registrosPorPagina) || 1;
        if (paginaActual < totalPaginas) {
            paginaActual++;
            pintarTablaPaginada(paginaActual);
        }
    });

    $('#btnGenerarVista').on('click', function() {
        const btn = $(this);
        const fechaInicioVal = $('#fecha_inicio').val();
        const fechaFinVal = $('#fecha_fin').val();

        if (!fechaInicioVal || !fechaFinVal) {
            Swal.fire({
                icon: 'warning',
                title: '<span style="color: #ffffff; font-family: \'Segoe UI\', sans-serif;">Rango de Fechas Requerido</span>',
                html: `<p style="color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: 'Segoe UI', sans-serif;">Debe seleccionar una fecha de inicio y una fecha límite para poder consultar los reportes del sistema.</p>`,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Entendido',
                background: '#111827',
                color: '#fff',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
            return false;
        }

        btn.prop('disabled', true).text('Buscando...');

        const filtros = {
            inicio: fechaInicioVal,
            fin: fechaFinVal,
            tecnico: $('#sel_tecnico').val(),
            departamento: $('#sel_depto').val(),
            estado: $('#sel_estado').val()
        };

        $.ajax({
            url: 'app/models/reportes/get_reportes.php',
            type: 'GET',
            data: filtros,
            dataType: 'json',
            success: function(res) {
                if (verificarRestriccion(res)) {
                    btn.prop('disabled', false).text('Generar Vista');
                    return;
                }

                if (res.status === 'success') {
                    datosLocales = res.data; 
                    datosFiltradosActuales = res.data; 
                    
                    pintarTablaPaginada(1);
                    
                    $('#countTotal').text(res.stats.total);
                    $('#countResueltos').text(res.stats.resueltos);
                    $('#countPendientes').text(res.stats.pendientes);
                    $('#countVencidos').text(res.stats.vencidos);

                    $('#h_inicio').val(filtros.inicio);
                    $('#h_fin').val(filtros.fin);
                    $('#h_tecnico').val(filtros.tecnico);
                    $('#h_depto').val(filtros.departamento);
                    $('#h_estado').val(filtros.estado);
                }
                btn.prop('disabled', false).text('Generar Vista');
            },
            error: function(xhr) {
                btn.prop('disabled', false).text('Generar Vista');
                try {
                    let jsonErr = JSON.parse(xhr.responseText);
                    if (verificarRestriccion(jsonErr)) return;
                } catch(e) {}
                
                Swal.fire({
                    icon: 'error',
                    title: 'Falla de Comunicación',
                    text: 'Ocurrió un problema de conectividad al procesar la auditoría analítica.',
                    confirmButtonColor: '#2563eb',
                    background: '#111827',
                    color: '#fff'
                });
            }
        });
    });

    $('.stat-box').on('click', function() {
        if (!datosLocales || datosLocales.length === 0) return;

        const idStat = $(this).find('.stat-number').attr('id');

        if (idStat === 'countTotal') {
            datosFiltradosActuales = datosLocales;
        } else if (idStat === 'countResueltos') {
            datosFiltradosActuales = datosLocales.filter(t => t.es_final == 1);
        } else if (idStat === 'countPendientes') {
            datosFiltradosActuales = datosLocales.filter(t => t.es_final == 0);
        } else if (idStat === 'countVencidos') {
            datosFiltradosActuales = datosLocales.filter(t => t.sla_status === 'VENCIDO');
        }

        pintarTablaPaginada(1);
    });

    $('#btnLimpiar').on('click', function() {
        $('#fecha_inicio, #fecha_fin, #sel_estado').val('');
        
        if (typeof $.fn.select2 !== 'undefined') {
            $('#sel_tecnico, #sel_depto').val('').trigger('change');
        } else {
            $('#sel_tecnico, #sel_depto').val('');
        }

        $('#tablaReportesBody').html('<tr><td colspan="6" class="text-center py-5 text-muted">Defina los filtros y presione "Generar Vista".</td></tr>');
        $('.stat-number').text('--'); 
        
        datosLocales = []; 
        datosFiltradosActuales = [];
        paginaActual = 1;
        
        $('#paginaActualTxt').text('1');
        $('#totalPaginasTxt').text('1');
        $('#btnPaginaAnterior, #btnPaginaSiguiente').prop('disabled', true);
        
        $('#paginacionInfo').text('0 a 0');
        $('#paginacionTotal').text('0');
        
        $('#h_inicio, #h_fin, #h_tecnico, #h_depto, #h_estado, #h_usuario_activo').val('');
    });

    $(document).on('submit', '#formExportar', function(e) {
        $('#h_inicio').val($('#fecha_inicio').val());
        $('#h_fin').val($('#fecha_fin').val());
        $('#h_tecnico').val($('#sel_tecnico').val());
        $('#h_depto').val($('#sel_depto').val());
        $('#h_estado').val($('#sel_estado').val());
        $('#h_usuario_activo').val('HAZTA'); 

        const fechaInicio = $('#h_inicio').val();
        const fechaFin = $('#h_fin').val();
        const totalTickets = datosLocales.length;

        if (!fechaInicio || !fechaFin || totalTickets === 0) {
            e.preventDefault();
            e.stopPropagation();

            let tituloAlerta = 'Exportación Bloqueada';
            let mensajeAlerta = '';

            if (!fechaInicio || !fechaFin) {
                tituloAlerta = 'Acción Inválida';
                mensajeAlerta = 'Debe seleccionar un rango de fechas y presionar <b>"Generar Vista"</b> antes de poder exportar un reporte.';
            } else {
                tituloAlerta = 'Exportación Vacía';
                mensajeAlerta = 'No se encontraron registros de auditoría en el periodo seleccionado. Modifique el rango de tiempo para generar un documento institucional válido.';
            }

            Swal.fire({
                icon: 'warning',
                title: `<span style="color: #ffffff; font-family: 'Segoe UI', sans-serif;">${tituloAlerta}</span>`,
                html: `<p style="color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: 'Segoe UI', sans-serif;">${mensajeAlerta}</p>`,
                confirmButtonColor: '#2563eb', 
                confirmButtonText: 'Entendido',
                background: '#111827', 
                color: '#fff',
                allowOutsideClick: false,
                allowEscapeKey: false
            });

            return false; 
        }

                e.preventDefault();
        Swal.fire({
            title: '<span style="color:#fff;">Exportar Reporte</span>',
            html: '<p style="color:#94a3b8;">¿Cómo deseas exportar el reporte?</p>',
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Descargar PDF',
            denyButtonText: 'Enviar por correo',
            confirmButtonColor: '#2563eb',
            denyButtonColor: '#059669',
            background: '#111827',
            color: '#fff'
        }).then(function(result) {
            if (result.isConfirmed) {
                document.getElementById('formExportar').target = '_blank';
                document.getElementById('formExportar').submit();
            } else if (result.isDenied) {
                enviarPorCorreo();
            }
        });
    });
        function enviarPorCorreo() {
        Swal.fire({
            title: '<span style="color:#fff;">Enviar por correo</span>',
            background: '#111827', color: '#fff',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            html: `<input id="swal_email" type="email" class="swal2-input" placeholder="ejemplo@ucad.edu.sv">
                   <textarea id="swal_mensaje" class="swal2-textarea" placeholder="Mensaje opcional..."></textarea>`,
            preConfirm: function() {
                const email = document.getElementById('swal_email').value.trim();
                if (!email) { Swal.showValidationMessage('El correo es obligatorio'); return false; }
                return { email: email, mensaje: document.getElementById('swal_mensaje').value.trim() };
            }
        }).then(function(res) {
            if (!res.isConfirmed) return;
            $.ajax({
                url: 'app/models/reportes/enviar_correo.php',
                method: 'POST', dataType: 'json',
                data: {
                    h_inicio: $('#h_inicio').val(), h_fin: $('#h_fin').val(),
                    h_tecnico: $('#h_tecnico').val(), h_depto: $('#h_depto').val(),
                    h_estado: $('#h_estado').val(),
                    email_destino: res.value.email, mensaje: res.value.mensaje
                },
                success: function(data) {
                    Swal.fire({
                        icon: data.success ? 'success' : 'error',
                        title: data.success ? '¡Correo enviado!' : 'Error al enviar',
                        text: data.success ? data.msg : data.error,
                        background: '#111827', color: '#fff'
                    });
                }
            });
        });
    }
});