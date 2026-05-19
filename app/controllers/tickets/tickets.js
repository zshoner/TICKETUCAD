// --- VARIABLES GLOBALES ---
let todosLosTickets = []; 
let ticketsFiltradosActuales = []; // Guarda el resultado del filtro
let modoPaginado = false; 
let paginaActual = 1;
let ticketsPorPagina = 10;

// 1. Extraer tickets (Solo al entrar a la página)
function extraerTickets() {
    let tablaTickets = document.getElementById('tabla_tickets'); 
    if (!tablaTickets) return; 

    fetch('/TICKETUCAD/app/models/php/tickets.php')
        .then(response => response.json()) 
        .then(data => {
            if (data && data.status === 'restricted') return;
            
            todosLosTickets = data; // Guardamos los datos
            
            // 1. Aplicamos el filtro que el navegador tenga seleccionado
            aplicarFiltro(); 
            
            // 2. LA SOLUCIÓN: Forzamos a JavaScript a leer los Radio Buttons 
            // para sincronizarse con lo que el navegador dejó marcado.
            cambiarModoVista(); 
        })
        .catch(error => console.error("Error al cargar:", error));
}

// 2. Lógica del Filtro
function aplicarFiltro() {
    const filtro = document.getElementById('filtro-estado').value;
    paginaActual = 1; // Si cambiamos el filtro, regresamos a la página 1
    
    if (filtro === 'all') {
        ticketsFiltradosActuales = todosLosTickets;
    } else {
        ticketsFiltradosActuales = todosLosTickets.filter(ticket => {
            if(ticket.estado_nombre) {
                return ticket.estado_nombre.toLowerCase().includes(filtro.toLowerCase());
            }
            return false;
        });
    }
    
    renderizarTickets();
}

// 3. Función Principal para dibujar la tabla
function renderizarTickets() {
    let tablaTickets = document.getElementById('tabla_tickets');
    if (!tablaTickets) return;

    let filasAcumuladas = "";
    let ticketsAMostrar = [];
    
    // Si estamos en modo paginado, calculamos qué pedazo del arreglo mostrar
    if (modoPaginado) {
        let indiceInicio = (paginaActual - 1) * ticketsPorPagina;
        let indiceFin = indiceInicio + ticketsPorPagina;
        ticketsAMostrar = ticketsFiltradosActuales.slice(indiceInicio, indiceFin);
        actualizarTextoPaginacion();
    } else {
        // Si no, mostramos todos los filtrados
        ticketsAMostrar = ticketsFiltradosActuales;
    }
        
    // Dibujamos las filas correspondientes
    for (var i = 0; i < ticketsAMostrar.length; i++) {
        filasAcumuladas +=
        `<tr onclick="verDetalleTicket(${ticketsAMostrar[i]['#']})" style="cursor: pointer;">
            <td style="padding: 10px;">${ticketsAMostrar[i]['#']}</td>
            <td>${ticketsAMostrar[i].titulo}</td>
            <td>${ticketsAMostrar[i].estado_nombre}</td>
            <td>${ticketsAMostrar[i].prioridad_id}</td>
            <td>${ticketsAMostrar[i].categoria_id}</td>
            <td>${ticketsAMostrar[i].correo}</td>
            <td>${ticketsAMostrar[i].asignado_nombre || 'Pendiente'}</td>
        </tr>`;
    }

    tablaTickets.innerHTML = filasAcumuladas;
}

// --- NUEVAS FUNCIONES DE PAGINACIÓN ---

// 4. Cambiar entre "Lista Completa" y "Paginado"

function cambiarModoVista() {
    // Buscamos cuál de los dos radio buttons está seleccionado actualmente
    const modoSeleccionado = document.querySelector('input[name="modo_vista"]:checked').value;
    const selectorSize = document.getElementById('size-pagina');
    const botonesPaginacion = document.getElementById('controles-paginacion');

    if (modoSeleccionado === 'paginado') {
        modoPaginado = true;
        // Mostramos el selector de cantidad (10, 25, 50) justo al lado
        selectorSize.style.display = 'inline-block'; 
        // Mostramos los botones de página anterior/siguiente abajo de la tabla
        botonesPaginacion.style.display = 'flex'; 
    } else {
        modoPaginado = false;
        // Ocultamos el selector de cantidad
        selectorSize.style.display = 'none'; 
        // Ocultamos los botones de página
        botonesPaginacion.style.display = 'none'; 
    }
    
    paginaActual = 1;
    renderizarTickets();
}

// 5. Cambiar cuántos se ven por página (10, 25, 50)
function cambiarSizePagina() {
    ticketsPorPagina = parseInt(document.getElementById('size-pagina').value);
    paginaActual = 1; 
    renderizarTickets();
}

// 6. Botones de Anterior y Siguiente
function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(ticketsFiltradosActuales.length / ticketsPorPagina);
    const nuevaPagina = paginaActual + direccion;

    // Solo cambiamos si la nueva página es válida
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTickets();
    }
}

// 7. Actualizar el texto que dice "Página X de Y"
function actualizarTextoPaginacion() {
    const infoPagina = document.getElementById('info-pagina');
    const totalPaginas = Math.ceil(ticketsFiltradosActuales.length / ticketsPorPagina) || 1;
    infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
}

// 8. Redirección
function verDetalleTicket(idTicket) {
    sessionStorage.setItem('ucad_ticket_id', String(idTicket));
    window.location.href = '/TICKETUCAD/vista-ticket';
}

// Arrancar el proceso
extraerTickets();