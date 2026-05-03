document.addEventListener('DOMContentLoaded', function() {
    const formFiltros = document.getElementById('formFiltros');
    const tablaBody = document.getElementById('tablaReportesBody');
    const btnLimpiar = document.getElementById('btnLimpiar');

    function actualizarContadores(stats) {
        document.getElementById('countTotal').innerText = stats.total || 0;
        document.getElementById('countResueltos').innerText = stats.resueltos || 0;
        document.getElementById('countPendientes').innerText = stats.pendientes || 0;
        document.getElementById('countVencidos').innerText = stats.vencidos || 0;
    }

    formFiltros.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(formFiltros);
        const params = new URLSearchParams(formData).toString();
        
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Procesando datos...</td></tr>';

        fetch(`../../models/reportes/get_reportes.php?${params}`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'error') throw new Error(json.message);
                
                tablaBody.innerHTML = '';
                
                if (json.data.length === 0) {
                    tablaBody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No se encontraron resultados.</td></tr>';
                } else {
                    json.data.forEach(t => {
                        const badgeClass = t.es_final == 1 ? 'badge-success' : 'badge-warning';
                        const cumplimientoClass = t.es_final == 1 ? 'text-success' : 'text-warning';
                        
                        tablaBody.innerHTML += `
                            <tr>
                                <td class="font-weight-bold text-primary">#${t.id}</td>
                                <td>${t.tecnico_nombre || 'Sin técnico'}</td>
                                <td>${t.depto_nombre || 'General'}</td>
                                <td>${t.fecha_creacion}</td>
                                <td><span class="badge ${badgeClass}">${t.estado_nombre}</span></td>
                                <td class="${cumplimientoClass} font-weight-bold">${t.cumplimiento}</td>
                            </tr>`;
                    });
                }
                actualizarContadores(json.stats);
            })
            .catch(err => {
                Swal.fire('Error', err.message, 'error');
                tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error de conexión.</td></tr>';
            });
    });

    btnLimpiar.addEventListener('click', () => {
        formFiltros.reset();
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Defina los filtros y presione "Generar Vista".</td></tr>';
        actualizarContadores({total: 0, resueltos: 0, pendientes: 0, vencidos: 0});
    });
});