function inicializarDashboard() {
    const inlineLoadingEl = document.getElementById('inline-loading');

    async function actualizarDatos(periodo) {
        try {
            // Mostrar "Cargando..."
            if (inlineLoadingEl) {
                inlineLoadingEl.style.display = 'flex';
            }

            // Agregamos un timestamp dinámico para evitar que el navegador guarde la caché
            const timestamp = new Date().getTime();
            const url = `/TICKETUCAD/app/models/dashboard/get_dashboard_data.php?periodo=${periodo}&_t=${timestamp}`;
            
            const response = await fetch(url);
            const res = await response.json();

            if (res.status === 'success') {
                document.getElementById('kpi-abiertos').innerText = res.kpis.abiertos || 0;
                document.getElementById('kpi-progreso').innerText = res.kpis.en_progreso || 0;
                document.getElementById('kpi-cerrados').innerText = res.kpis.cerrados || 0;

                document.getElementById('time-resolucion').innerHTML = `${res.tiempos.resolucion} <small style="color: #5a7a9a; font-size: 14px;">hrs</small>`;

                renderizarGrafica(res.grafica);
            } else {
                console.error("Error del servidor:", res.message);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            // 2. Ocultar estado "Cargando..."
            if (inlineLoadingEl) {
                inlineLoadingEl.style.display = 'none';
            }
        }
    }

    function renderizarGrafica(datos) {
        const opciones = {
            chart: { 
                type: 'area', 
                height: 350, 
                toolbar: { show: false }, 
                background: 'transparent',
                events: {
                    click: async function(event, chartContext, config) {
                        const periodoActual = document.getElementById('filtro-tiempo').value;
                        const inlineLoadingEl = document.getElementById('inline-loading');
                        
                        if (inlineLoadingEl) inlineLoadingEl.style.display = 'flex';

                        try {
                            const response = await fetch(`/TICKETUCAD/app/models/dashboard/generar_reporte_tickets.php?periodo=${periodoActual}&t=${new Date().getTime()}`);
                            const textData = await response.text();
                            let res;
                            try { res = JSON.parse(textData); } catch (e) {
                                Swal.fire('Error del servidor', 'El PHP no devolvió un JSON válido.', 'error');
                                return;
                            }

                            if (res.status === 'success') {
                                const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
                                if (!jsPDF) {
                                    Swal.fire('Error', 'La librería jsPDF no cargó.', 'error');
                                    return;
                                }

                                const doc = new jsPDF('landscape'); 
                                doc.setFontSize(16);
                                doc.text(`Reporte de Tickets - ${res.periodo}`, 14, 15);
                                doc.setFontSize(10);
                                doc.setTextColor(100);
                                doc.text(`Total de tickets: ${res.data.length}`, 14, 22);

                                const tableColumn = ["ID", "Título", "Descripción", "Estado", "Prioridad", "Categoría", "Correo", "Asignado a", "Fecha"];
                                const tableRows = [];

                                res.data.forEach(t => {
                                    const ticketData = [
                                        t.id,
                                        t.titulo,
                                        t.descripcion && t.descripcion.length > 40 ? t.descripcion.substring(0, 40) + '...' : t.descripcion,
                                        t.estado,
                                        t.prioridad,
                                        t.categoria,
                                        t.correo,
                                        t.asignado_a || 'Sin asignar',
                                        t.fecha_creacion
                                    ];
                                    tableRows.push(ticketData);
                                });

                                doc.autoTable({
                                    head: [tableColumn],
                                    body: tableRows,
                                    startY: 28,
                                    theme: 'grid',
                                    styles: { fontSize: 8 },
                                    headStyles: { fillColor: [37, 99, 235] }
                                });

                                doc.save(`Reporte_Tickets_${periodoActual}.pdf`);
                                
                                Swal.fire({
                                    toast: true, position: 'top-end', icon: 'success', 
                                    title: 'Reporte descargado', showConfirmButton: false, timer: 2000
                                });
                            } else {
                                Swal.fire('Error de Base de Datos', res.message, 'error');
                            }
                        } catch (error) {
                            Swal.fire('Error JS', 'Ocurrió un error al armar el PDF.', 'error');
                        } finally {
                            if (inlineLoadingEl) inlineLoadingEl.style.display = 'none';
                        }
                    }
                }
            },
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

        if (window.dashboardChart) {
            window.dashboardChart.destroy();
        }
        
        const chartContainer = document.querySelector("#chart-evolucion");
        window.dashboardChart = new ApexCharts(chartContainer, opciones);
        window.dashboardChart.render();
        
        chartContainer.style.cursor = "pointer";

        // ── SEGUIDOR DEL CURSOR ──
        //  letrero dinámico
        let letreroFlotante = document.getElementById('grafica-helper-tooltip');
        if (!letreroFlotante) {
            letreroFlotante = document.createElement('div');
            letreroFlotante.id = 'grafica-helper-tooltip';
            letreroFlotante.innerText = 'Click para descargar PDF';
            letreroFlotante.style.position = 'fixed';
            letreroFlotante.style.display = 'none';
            letreroFlotante.style.backgroundColor = '#9db7f011'; // Azul Bootstrap
            letreroFlotante.style.color = '#ffffff88';
            letreroFlotante.style.padding = '5px 10px';
            letreroFlotante.style.borderRadius = '4px';
            letreroFlotante.style.fontSize = '11px';
            letreroFlotante.style.fontWeight = 'bold';
            letreroFlotante.style.zIndex = '9999';
            letreroFlotante.style.pointerEvents = 'none'; // Hace que el clic pase de largo hacia la gráfica
            letreroFlotante.style.boxShadow = '0px 2px 8px rgba(0,0,0,0.5)';
            document.body.appendChild(letreroFlotante);
        }

        // Cuando el mouse entra a la gráfica (Mostrar texto)
        chartContainer.addEventListener('mouseenter', () => {
            letreroFlotante.style.display = 'block';
        });

        // Persigue al cursor
        chartContainer.addEventListener('mousemove', (e) => {
            letreroFlotante.style.left = (e.clientX + 15) + 'px'; //  pixeles a la derecha del puntero
            letreroFlotante.style.top = (e.clientY + 15) + 'px';  //  pixeles abajo del puntero
        });

        // Ocultar texto
        chartContainer.addEventListener('mouseleave', () => {
            letreroFlotante.style.display = 'none';
        });
    }

    // Delegación de eventos con jQuery. Esto es para que siempre se cargue el HTML por AJAX, para que siempre funcione.
    $(document).off('change', '#filtro-tiempo').on('change', '#filtro-tiempo', function(e) {
        actualizarDatos(e.target.value);
    });

    // Carga inicial tomando el valor que tenga el select por defecto (30d)
    const filtroInicial = document.getElementById('filtro-tiempo') ? document.getElementById('filtro-tiempo').value : '30d';
    actualizarDatos(filtroInicial);
}
