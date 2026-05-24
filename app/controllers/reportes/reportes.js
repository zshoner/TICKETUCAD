$(document).ready(function() {
    // Arreglo global para guardar los tickets y filtrarlos localmente sin recargar
    let datosLocales = [];
    let datosFiltradosActuales = []; // Guarda el filtro activo para la paginación
    let paginaActual = 1;
    const registrosPorPagina = 6; // Cantidad MÁXIMA de filas que se van a ver por página

    // =========================================================================
    // FUNCIÓN AUXILIAR: Valida si el backend devolvió un acceso restringido
    // =========================================================================
    function verificarRestriccion(res) {
        if (res && res.status === 'restricted') {
            Swal.fire({
                icon: 'error',
                title: '<span style="color: #ffffff; font-family: \'Segoe UI\', sans-serif;">Sesión Inválida</span>',
                html: `<p style="color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: 'Segoe UI', sans-serif;">${res.message || 'No tienes permisos para interactuar con esta sección.'}</p>`,
                confirmButtonColor: '#2563eb', // Azul Cobalto
                confirmButtonText: 'Entendido',
                background: '#111827', // Fondo Oscuro
                color: '#fff',
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                // Redireccionar al panel de administracion si no hay permisos
                window.location.href = '/TICKETUCAD/app/views/pages/padmin.html';
            });
            return true; 
        }
        return false;
    }

    // =========================================================================
    // 1. CARGAR LAS OPCIONES DE LOS SELECTS AL ENTRAR A LA PÁGINA
    // =========================================================================
    function cargarSelectores() {
        $.ajax({
            url: 'app/models/reportes/get_filtros.php',
            type: 'GET',
            dataType: 'json', 
            success: function(res) {
                // Validar si el filtro devolvio acceso denegado
                if (verificarRestriccion(res)) return;

                if(res.status === 'success') {
                    // Llenar el select de los Tecnicos
                    let htmlTec = '<option value="">-- Todos --</option>';
                    res.tecnicos.forEach(t => {
                        htmlTec += `<option value="${t.id}">${t.nombre}</option>`;
                    });
                    $('#sel_tecnico').html(htmlTec);

                    // Llenar el select de los Departamentos
                    let htmlDep = '<option value="">-- Todos --</option>';
                    res.departamentos.forEach(d => {
                        htmlDep += `<option value="${d.id}">${d.nombre}</option>`;
                    });
                    $('#sel_depto').html(htmlDep);

                    // Llenar el select de los Estados de los tickets
                    let htmlEst = '<option value="">-- Todos --</option>';
                    res.estados.forEach(e => {
                        htmlEst += `<option value="${e.nombre}">${e.nombre}</option>`;
                    });
                    $('#sel_estado').html(htmlEst);

                    // CORRECCIÓN SELECT2: Inicialización con tema bootstrap4 y buscador nativo activo
                    if (typeof $.fn.select2 !== 'undefined') {
                        $('#sel_tecnico, #sel_depto').select2({
                            theme: 'bootstrap4', // Acopla el diseño al entorno gráfico
                            placeholder: "Seleccione una opción",
                            allowClear: true,
                            width: '100%' // Previene que Select2 desborde el contenedor .col-4
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

    // Llamar a la funcion para rellenar los selects inmediatamente
    cargarSelectores();

    // =========================================================================
    // 2. FUNCIÓN PARA MOSTRAR LAS FILAS DE LA PÁGINA ACTUAL (ESTRICTO MAX 6)
    // =========================================================================
    function pintarTablaPaginada(pagina) {
        paginaActual = pagina;
        let rows = '';
        const totalRegistros = datosFiltradosActuales.length;
        
        if (totalRegistros > 0) {
            // Calcular los indices para cortar el arreglo de datos en bloques de 5
            const indiceInicio = (paginaActual - 1) * registrosPorPagina;
            const indiceFin = Math.min(indiceInicio + registrosPorPagina, totalRegistros);
            
            // Extraer estrictamente los 5 registros asignados a la pagina actual
            const registrosPagina = datosFiltradosActuales.slice(indiceInicio, indiceFin);
            
            registrosPagina.forEach(item => {
                // Formatear la fecha de creacion al estilo corto: 13 may 2026
                const fechaObj = new Date(item.fecha_creacion);
                const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
                const fechaParte = fechaObj.toLocaleDateString('es-ES', opcionesFecha).replace('.', '');

                // Formatear la hora en formato de 12 horas: 11:01 PM
                const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                const horaParte = fechaObj.toLocaleTimeString('es-ES', opcionesHora).toUpperCase();

                const fechaFinal = `${fechaParte}, ${horaParte}`;

                // Definir colores e iconos dependiendo de si el SLA esta vencido o a tiempo
                const esVencido = item.sla_status === 'VENCIDO';
                const slaColor = esVencido ? '#ef4444' : '#10b981';
                const slaIcon = esVencido ? 'fa-times-circle' : 'fa-check-circle';
                const slaBackground = esVencido ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                const slaBorder = esVencido ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                
                // Definir el color del borde y texto del estado del ticket (Abierto / Finalizado)
                const colorBadge = (item.es_final == 1) 
                    ? 'border: 1px solid #10b981; color: #10b981;' 
                    : 'border: 1px solid #3b82f6; color: #3b82f6;';

                // Ir acumulando el codigo HTML de la fila
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
            
            // Actualizar el texto descriptivo de la paginacion
            $('#paginacionInfo').text(`${indiceInicio + 1} a ${indiceFin}`);
            $('#paginacionTotal').text(totalRegistros);
            
        } else {
            rows = '<tr><td colspan="6" class="text-center py-5 text-muted">No hay registros para mostrar.</td></tr>';
            $('#paginacionInfo').text('0 a 0');
            $('#paginacionTotal').text('0');
        }
        
        // Inyectar de forma controlada el HTML en el contenedor
        $('#tablaReportesBody').html(rows);
        construirControlesPaginacion(totalRegistros);
    }

    // =========================================================================
    // 2.1 GENERAR BOTONES DE PAGINACIÓN DE FORMA DINÁMICA
    // =========================================================================
    function construirControlesPaginacion(totalRegistros) {
        const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
        let htmlPaginador = '';
        
        if (totalPaginas > 1) {
            // Boton de Anterior
            htmlPaginador += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${paginaActual - 1}">&laquo;</a>
            </li>`;
            
            // Crear los botones numericos de las paginas
            for (let i = 1; i <= totalPaginas; i++) {
                htmlPaginador += `<li class="page-item ${paginaActual === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`;
            }
            
            // Boton de Siguiente
            htmlPaginador += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${paginaActual + 1}">&raquo;</a>
            </li>`;
        }
        
        $('#contenedorPaginacion').html(htmlPaginador);
    }

    // Detectar el clic en los botones del paginador
    $(document).on('click', '#contenedorPaginacion .page-link', function(e) {
        e.preventDefault();
        const nuevaPagina = parseInt($(this).data('page'));
        if (nuevaPagina && nuevaPagina !== paginaActual) {
            pintarTablaPaginada(nuevaPagina);
        }
    });

    // =========================================================================
    // 3. BOTÓN PARA EJECUTAR LA BÚSQUEDA MEDIANTE AJAX (CON VALIDACIÓN DE FECHAS)
    // =========================================================================
    $('#btnGenerarVista').on('click', function() {
        const btn = $(this);
        
        // Capturar los inputs de fecha para validar del lado del cliente
        const fechaInicioVal = $('#fecha_inicio').val();
        const fechaFinVal = $('#fecha_fin').val();

        // BLINDAJE: Si falta alguna fecha, frena la consulta y tira SweetAlert2 institucional
        if (!fechaInicioVal || !fechaFinVal) {
            Swal.fire({
                icon: 'warning',
                title: '<span style="color: #ffffff; font-family: \'Segoe UI\', sans-serif;">Rango de Fechas Requerido</span>',
                html: `<p style="color: #94a3b8; font-size: 14.5px; margin-bottom: 0; font-family: 'Segoe UI', sans-serif;">Debe seleccionar una fecha de inicio y una fecha límite para poder consultar los reportes del sistema.</p>`,
                confirmButtonColor: '#2563eb', // Azul Cobalto
                confirmButtonText: 'Entendido',
                background: '#111827', // Fondo Oscuro
                color: '#fff',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
            return false; // Corta la ejecución del proceso inmediatamente
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
                    
                    // Renderizar el primer set de 5 filas
                    pintarTablaPaginada(1);
                    
                    // Actualizar contadores analíticos superiores
                    $('#countTotal').text(res.stats.total);
                    $('#countResueltos').text(res.stats.resueltos);
                    $('#countPendientes').text(res.stats.pendientes);
                    $('#countVencidos').text(res.stats.vencidos);

                    // Sincronizar inputs ocultos de exportación
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

    // =========================================================================
    // 4. EVENTO CLICK EN LAS TARJETAS SUPERIORES PARA FILTRAR EN MEMORIA
    // =========================================================================
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

        // Al cambiar de filtro, rearma la estructura limitando a 5 items
        pintarTablaPaginada(1);
    });

    // =========================================================================
    // 5. BOTÓN PARA REINICIAR TODOS LOS CAMPOS Y CONTADORES
    // =========================================================================
    $('#btnLimpiar').on('click', function() {
        $('#fecha_inicio, #fecha_fin, #sel_estado').val('');
        
        // CORRECCIÓN SELECT2: Reseteo correcto disparando el evento de actualización visual (.trigger)
        if (typeof $.fn.select2 !== 'undefined') {
            $('#sel_tecnico, #sel_depto').val('').trigger('change');
        } else {
            $('#sel_tecnico, #sel_depto').val('');
        }

        $('#tablaReportesBody').html('<tr><td colspan="6" class="text-center py-5 text-muted">Defina los filtros y presione "Generar Vista".</td></tr>');
        $('.stat-number').text('0');
        
        datosLocales = []; 
        datosFiltradosActuales = [];
        $('#contenedorPaginacion').html('');
        $('#paginacionInfo').text('0 a 0');
        $('#paginacionTotal').text('0');
        
        $('#h_inicio, #h_fin, #h_tecnico, #h_depto, #h_estado').val('');
    });

    // =========================================================================
    // 6. DETENER EL ENVÍO DEL PDF SI NO SE CUMPLEN LOS REQUISITOS
    // =========================================================================
    $(document).on('submit', '#formExportar', function(e) {
        $('#h_inicio').val($('#fecha_inicio').val());
        $('#h_fin').val($('#fecha_fin').val());
        $('#h_tecnico').val($('#sel_tecnico').val());
        $('#h_depto').val($('#sel_depto').val());
        $('#h_estado').val($('#sel_estado').val());

        const fechaInicio = $('#h_inicio').val();
        const fechaFin = $('#h_fin').val();
        const totalTickets = parseInt($('#countTotal').text().trim()) || 0;

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
    });
});