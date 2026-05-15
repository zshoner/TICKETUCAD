function inicializarDashboard() {
    const mainContent = document.getElementById('main-content');

    // 1. Dibujamos la estructura HTML del Dashboard (Colores corregidos)
    mainContent.innerHTML = `
        <div class="page-title d-flex justify-content-between align-items-center">
            <div>
                <h1>Análisis de Tickets</h1>
                <p>Monitoreo de rendimiento del sistema</p>
            </div>
            <select id="filtro-tiempo" class="form-control" style="width: 200px; background: #16203a; color: white; border: 1px solid var(--border);">
                <option value="24h">Últimas 24 Horas</option>
                <option value="7d">Últimos 7 Días</option>
                <option value="30d" selected>Últimos 30 Días</option>
            </select>
        </div>

        <div class="stats-grid mt-4">
            <div class="stat-card">
                <div class="stat-info">
                    <div class="stat-val" id="kpi-abiertos">0</div>
                    <div class="stat-label">Abiertos</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <div class="stat-val" id="kpi-progreso" style="color: #fbbf24;">0</div>
                    <div class="stat-label">En Progreso</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <div class="stat-val" id="kpi-cerrados" style="color: #34d399;">0</div>
                    <div class="stat-label">Cerrados</div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header"><h3>Evolución de Tickets</h3></div>
                    <div class="card-body">
                        <div id="chart-evolucion"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header"><h3>Tiempos Promedio</h3></div>
                    <div class="card-body">
                        <div class="mb-4">
                            <label style="color: #8aa0bb; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;" class="d-block mb-2">1ra Respuesta</label>
                            <h2 id="time-respuesta" style="color: #fff;">0.0 <small style="color: #5a7a9a; font-size: 14px;">hrs</small></h2>
                        </div>
                        <hr style="border-top: 1px solid var(--border)">
                        <div>
                            <label style="color: #8aa0bb; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;" class="d-block mb-2">Resolución Final</label>
                            <h2 id="time-resolucion" style="color: #fff;">0.0 <small style="color: #5a7a9a; font-size: 14px;">hrs</small></h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 2. Función para obtener los datos
    async function actualizarDatos(periodo) {
        try {
            const response = await fetch(`/TICKETUCAD/app/controllers/dashboard/get_dashboard_data.php?periodo=${periodo}`);
            const res = await response.json();

            if (res.status === 'success') {
                document.getElementById('kpi-abiertos').innerText = res.kpis.abiertos || 0;
                document.getElementById('kpi-progreso').innerText = res.kpis.en_progreso || 0;
                document.getElementById('kpi-cerrados').innerText = res.kpis.cerrados || 0;
                
                document.getElementById('time-respuesta').innerHTML = `${res.tiempos.respuesta} <small style="color: #5a7a9a; font-size: 14px;">hrs</small>`;
                document.getElementById('time-resolucion').innerHTML = `${res.tiempos.resolucion} <small style="color: #5a7a9a; font-size: 14px;">hrs</small>`;

                renderizarGrafica(res.grafica);
            } else {
                console.error("Error del servidor:", res.message);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    }

    // 3. Configuración de ApexCharts
    let chart;
    function renderizarGrafica(datos) {
        const opciones = {
            chart: { type: 'area', height: 350, toolbar: { show: false }, background: 'transparent' },
            theme: { mode: 'dark' },
            colors: ['#2563eb', '#34d399'],
            series: [
                { name: 'Nuevos', data: datos.map(d => d.nuevos) },
                { name: 'Cerrados', data: datos.map(d => d.cerrados) }
            ],
            xaxis: { categories: datos.map(d => d.fecha) },
            stroke: { curve: 'smooth', width: 2 },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            dataLabels: { enabled: false }
        };

        if (chart) chart.destroy();
        chart = new ApexCharts(document.querySelector("#chart-evolucion"), opciones);
        chart.render();
    }

    // Escuchar el filtro de tiempo
    document.getElementById('filtro-tiempo').addEventListener('change', (e) => {
        actualizarDatos(e.target.value);
    });

    // Carga inicial en 30 Días
    actualizarDatos('30d');
}