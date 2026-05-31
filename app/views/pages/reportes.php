<style>
    /* ── Estilos de integración con el Dashboard ── */
    .header-banner { 
        background: linear-gradient(135deg, #0d1528 0%, #0a0f1e 100%); 
        border-radius: 16px; 
        padding: 1.8rem; 
        margin-bottom: 2rem; 
        border: 1px solid rgba(255,255,255,0.08); 
        border-left: 5px solid #2563eb; 
    }

    .card-custom { 
        border: 1px solid rgba(255,255,255,0.08); 
        border-radius: 16px; 
        background: rgba(255,255,255,0.03); 
        backdrop-filter: blur(12px); 
        margin-bottom: 1.5rem; 
    }

    /* ── Widgets de Estadísticas (Estilo Pro) ── */
    .stat-box { 
        background: rgba(255,255,255,0.04); 
        padding: 1.8rem 1.5rem; 
        border-radius: 18px; 
        border: 1px solid rgba(255,255,255,0.08);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        height: 100%;
        cursor: pointer;
    }

    .stat-box:hover {
        background: rgba(255,255,255,0.07);
        transform: translateY(-5px);
        border-color: rgba(255,255,255,0.2);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .stat-icon { font-size: 1.4rem; margin-bottom: 0.8rem; opacity: 0.8; }

    .stat-label {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #94a3b8; /* Gris legible */
        margin-bottom: 0.4rem;
    }

    .stat-number { font-size: 2.4rem; font-weight: 800; line-height: 1; margin: 0; }

    .text-total { color: #f8fafc; }
    .text-success { color: #10b981 !important; text-shadow: 0 0 15px rgba(16,185,129,0.2); }
    .text-warning { color: #f59e0b !important; text-shadow: 0 0 15px rgba(245,158,11,0.2); }
    .text-danger { color: #ef4444 !important; text-shadow: 0 0 15px rgba(239,68,68,0.2); }

    /* ── Ajustes de la Tabla Transparentes ── */
    .table-custom { color: #e2e8f0 !important; background-color: transparent !important; margin-bottom: 0; }

    .table-custom thead th { 
        background-color: rgba(255,255,255,0.02); 
        color: #60a5fa; 
        border-bottom: 1px solid rgba(255,255,255,0.08); 
        border-top: none;
        text-transform: uppercase; 
        font-size: 0.75rem; 
        padding: 1.2rem 1rem;
    }

    .table-custom tbody td { 
        background-color: transparent !important; 
        border-top: 1px solid rgba(255,255,255,0.05); 
        color: #e2e8f0 !important;
        padding: 1.2rem 1rem;
        vertical-align: middle;
    }

    .table-custom tbody tr:hover td { background-color: rgba(255, 255, 255, 0.03) !important; }

    /* ── Formularios y etiquetas generales ── */
    .section-label { 
        font-size: 0.7rem; font-weight: 800; text-transform: uppercase; 
        color: #60a5fa; display: flex; align-items: center; 
        margin-bottom: 1.2rem; letter-spacing: 1px; 
    }
    
    .section-label::before { 
        content: ""; 
        display: inline-block; 
        width: 3px; 
        height: 15px; 
        background: #2563eb; 
        margin-right: 10px; 
        vertical-align: middle;
        border-radius: 4px;
    }

    .text-muted {
        color: #94a3b8 !important; /* Gris azulado para que no se pierda */
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 5px;
        display: inline-block;
    }

    label.text-muted { color: #94a3b8 !important; font-weight: 700; }

    /* Inputs estándar y selectores nativos */
    .form-control-custom { 
        background-color: rgba(255,255,255,0.05) !important; 
        border: 1px solid rgba(255,255,255,0.1) !important; 
        color: #f1f5f9 !important; 
        border-radius: 10px; 
        padding: 0.6rem 1rem;
        cursor: pointer;
        appearance: none; /* Elimina estilos nativos para mayor control */
    }

    .form-control-custom option {
        background-color: #111827 !important; /* Azul muy oscuro/negro sólido */
        color: #ffffff !important;
        padding: 10px;
    }

    .form-control-custom:focus {
        background-color: rgba(255,255,255,0.08) !important;
        border-color: #2563eb !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        outline: none;
    }

    /* Inputs de tipo fecha específicos */
    input[type="date"].form-control-custom {
        color-scheme: dark; /* Fuerza al navegador a usar el picker oscuro nativo */
        background-color: #1f2937 !important;
        color: #ffffff !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        padding: 0.6rem 1rem;
        border-radius: 10px;
        cursor: pointer;
    }

    input[type="date"].form-control-custom::-webkit-calendar-picker-indicator {
        filter: invert(1); /* Cambia el icono negro por blanco */
        opacity: 0.7;
        cursor: pointer;
    }

    input[type="date"].form-control-custom::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
    }

    /* Botones de acción */
    .btn-export { 
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
        color: #fff; padding: 0.7rem 1.5rem; border-radius: 10px; font-weight: 600; border: none; 
    }

    .btn-generate { background-color: #f8fafc; color: #0f172a; font-weight: 800; border-radius: 10px; border: none; transition: 0.2s; }
    .btn-generate:hover { background-color: #ffffff; transform: translateY(-2px); }

    /* Estilos para el SLA en la tabla */
    .badge-sla-danger {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 800;
        display: inline-block;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .badge-sla-success {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 800;
        display: inline-block;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    /* Avatar minimalista para técnicos */
    .avatar-mini {
        width: 24px;
        height: 24px;
        background: #2563eb;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    /* =========================================================================
       NUEVOS ESTILOS OPTIMIZADOS PARA LOS BOTONES DE PAGINACIÓN (TICKET UCAD)
       ========================================================================= */
    .btn-custom-nav {
        background-color: #2563eb !important; /* Azul Cobalto Institucional */
        color: #ffffff !important;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 0.82rem;
        padding: 6px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .btn-custom-nav:hover:not(:disabled) {
        background-color: #1d4ed8 !important; /* Azul un toque más oscuro al hacer hover */
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
    }

    .btn-custom-nav:active:not(:disabled) {
        transform: translateY(1px);
    }

    /* Estado inhabilitado (Se funde de forma elegante con tu fondo general #111827) */
    .btn-custom-nav:disabled {
        background-color: #111827 !important; 
        color: #4b5563 !important; /* Gris oscuro apagado */
        border-color: rgba(255, 255, 255, 0.03) !important;
        box-shadow: none;
        cursor: not-allowed;
        opacity: 0.6;
    }

    /* =========================================================================
       ESTILOS PERSONALIZADOS PARA EL DESPLEGABLE DE SELECT2 (ABIERTO)
       ========================================================================= */
    .select2-container--bootstrap4 .select2-dropdown {
        background-color: #1f2937 !important; /* Mismo fondo de tus tarjetas */
        border-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
    }

    .select2-container--bootstrap4 .select2-search--dropdown {
        background-color: #1f2937 !important;
        padding: 8px !important;
    }

    .select2-container--bootstrap4 .select2-search--dropdown .select2-search__field {
        background-color: #111827 !important; /* Fondo más oscuro para contraste */
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #ffffff !important; /* Texto blanco al escribir */
        border-radius: 4px !important;
    }

    .select2-container--bootstrap4 .select2-results__option {
        background-color: #1f2937 !important;
        color: #94a3b8 !important; /* Texto gris claro/azulado legible */
        padding: 6px 12px !important;
    }

    .select2-container--bootstrap4 .select2-results__option--highlighted[aria-selected],
    .select2-container--bootstrap4 .select2-results__option[aria-selected=true] {
        background-color: #2563eb !important; /* Azul Cobalto institucional */
        color: #ffffff !important; /* Texto blanco */
    }

    .select2-container--bootstrap4 .select2-results__message {
        background-color: #1f2937 !important;
        color: #64748b !important;
    }

    /* =========================================================================
       VISIBILIDAD MÁXIMA PARA SELECT2 (CERRADO)
       ========================================================================= */
    /* 1. Marco contenedor base cuando está inactivo */
    .select2-container--bootstrap4 .select2-selection--single {
        background-color: #1f2937 !important; /* Acoplado a tus inputs de fecha */
        border: 1px solid rgba(255, 255, 255, 0.2) !important; /* Grosor unificado */
        height: calc(1.5em + 0.75rem + 2px) !important; /* Simetría perfecta de altura */
        display: flex !important;
        align-items: center !important;
        border-radius: 10px !important; /* Redondeado igual a tus campos */
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    /* 2. Forzar texto blanco brillante cuando YA hay un elemento seleccionado */
    .select2-container--bootstrap4 .select2-selection--single .select2-selection__rendered {
        color: #ffffff !important; 
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        padding-left: 1rem !important;
    }

    /* 3. Forzar texto gris claro visible para el Placeholder ("Seleccione una opción") */
    .select2-container--bootstrap4 .select2-selection--single .select2-selection__rendered .select2-selection__placeholder {
        color: #94a3b8 !important; /* Gris idéntico al de tus etiquetas de formulario */
        font-weight: 500 !important;
    }

    /* 4. Aclarar la flechita nativa del Select2 */
    .select2-container--bootstrap4 .select2-selection--single .select2-selection__arrow b {
        border-color: #94a3b8 transparent transparent transparent !important;
    }

    /* 5. Comportamiento visual de enfoque activo */
    .select2-container--bootstrap4.select2-container--focus .select2-selection--single {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
    }
</style>

<div class="container-fluid py-4" id="moduloReportesCompleto">
    <div class="header-banner d-flex justify-content-between align-items-center flex-wrap shadow-sm">
        <div>
            <h2 class="mb-0 font-weight-bold text-white">Reportes del Sistema</h2>
            <p class="mb-0 small text-muted">TICKET UCAD</p>
        </div>
        <div class="mt-2 mt-md-0">
            <button type="button" id="btnLimpiar" class="btn btn-sm btn-outline-secondary text-white mr-2">
                <i class="fas fa-undo mr-1"></i> Limpiar
            </button>
            <button type="button" id="btnGenerarVista" class="btn btn-sm btn-generate shadow-sm">
                <i class="fas fa-search mr-1"></i> Generar Vista
            </button>
        </div>
    </div>

    <div id="filtrosContenedor">
        <div class="row">
            <div class="col-md-4">
                <div class="card card-custom p-4">
                    <div class="section-label">Rango de fechas</div>
                    <div class="row">
                        <div class="col-6">
                            <label class="small text-muted">Desde</label>
                            <input type="date" id="fecha_inicio" class="form-control form-control-custom">
                        </div>
                        <div class="col-6">
                            <label class="small text-muted">Hasta</label>
                            <input type="date" id="fecha_fin" class="form-control form-control-custom">
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-8">
                <div class="card card-custom p-4">
                    <div class="section-label">Filtros específicos</div>
                    <div class="row">
                        <div class="col-4 d-flex flex-column">
                            <label class="small text-muted">Técnico</label>
                            <select id="sel_tecnico" style="width: 100%;">
                                <option value="">Todos los técnicos</option>
                            </select>
                        </div>
                        <div class="col-4 d-flex flex-column">
                            <label class="small text-muted">Departamento</label>
                            <select id="sel_depto" style="width: 100%;">
                                <option value="">Cualquier Departamento</option>
                            </select>
                        </div>
                        <div class="col-4">
                            <label class="small text-muted">Estado</label>
                            <select id="sel_estado" class="form-control form-control-custom">
                                <option value="">Todos los estados</option>
                                <option value="Completado">Completado</option>
                                <option value="En progreso">En progreso</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row mb-4">
        <div class="col-md-3 col-6 mb-3">
            <div class="stat-box">
                <i class="fas fa-layer-group stat-icon text-muted"></i>
                <span class="stat-label">Total Tickets</span>
                <span class="stat-number text-total" id="countTotal">0</span>
            </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
            <div class="stat-box">
                <i class="fas fa-check-double stat-icon text-success"></i>
                <span class="stat-label">Resueltos</span>
                <span class="stat-number text-success" id="countResueltos">0</span>
            </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
            <div class="stat-box">
                <i class="fas fa-clock stat-icon text-warning"></i>
                <span class="stat-label">Pendientes</span>
                <span class="stat-number text-warning" id="countPendientes">0</span>
            </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
            <div class="stat-box">
                <i class="fas fa-fire-alt stat-icon text-danger"></i>
                <span class="stat-label">Vencidos</span>
                <span class="stat-number text-danger" id="countVencidos">0</span>
            </div>
        </div>
    </div>

    <div class="card card-custom shadow-sm overflow-hidden">
        <div class="table-responsive">
            <table class="table table-custom mb-0">
                <thead>
                    <tr>
                        <th>ID Ticket</th><th>Técnico</th><th>Departamento</th><th>Fecha</th><th>Estado</th><th>SLA</th>
                    </tr>
                </thead>
                <tbody id="tablaReportesBody">
                    <tr><td colspan="6" class="text-center py-5 text-muted">Defina los filtros y presione "Generar Vista".</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="d-flex justify-content-between align-items-center flex-wrap p-3 border-top" style="background-color: rgba(255, 255, 255, 0.02); border-color: rgba(255, 255, 255, 0.05) !important;">
            <div class="small text-muted my-1">
                Mostrando <span id="paginacionInfo" class="font-weight-bold text-white">0 a 0</span> de <span id="paginacionTotal" class="font-weight-bold text-white">0</span> registros
            </div>
            
            <div class="d-flex align-items-center my-1" style="gap: 15px;">
                <button type="button" id="btnPaginaAnterior" class="btn btn-custom-nav" disabled>Anterior</button>
                
                <span class="text-white font-weight-bold" style="font-size: 0.88rem; font-family: 'Segoe UI', sans-serif; min-width: 90px; text-align: center;">
                    Página <span id="paginaActualTxt">1</span> de <span id="totalPaginasTxt">1</span>
                </span>
                
                <button type="button" id="btnPaginaSiguiente" class="btn btn-custom-nav" disabled>Siguiente</button>
            </div>
        </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-4 card-custom p-3">
        <form id="formExportar" action="/TICKETUCAD/app/models/reportes/reporte_pdf.php" method="POST" target="_blank" class="d-flex align-items-center w-100">
            <input type="hidden" name="h_inicio" id="h_inicio">
            <input type="hidden" name="h_fin" id="h_fin">
            <input type="hidden" name="h_tecnico" id="h_tecnico">
            <input type="hidden" name="h_depto" id="h_depto">
            <input type="hidden" name="h_estado" id="h_estado">
            
            <div class="d-flex align-items-center">
                <label class="mb-0 mr-3 small font-weight-bold text-muted">FORMATO:</label>
                <select name="formato_export" class="form-control form-control-sm form-control-custom" style="width: 140px;">
                    <option value="pdf">Documento PDF</option>
                </select>
            </div>
            <button type="submit" class="btn btn-export ml-auto">
                <i class="fas fa-download mr-2"></i> EXPORTAR REPORTE
            </button>
        </form>
    </div>
</div>

<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script src="app/controllers/reportes/reportes.js"></script>