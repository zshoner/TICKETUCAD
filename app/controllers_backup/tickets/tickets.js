// --- VARIABLES GLOBALES ---
let todosLosTickets = []; 
let ticketsFiltradosActuales = []; 
let modoPaginado = false; 
let paginaActual = 1;
let ticketsPorPagina = 10;

// 1. Extraer tickets (Consulta a la base de datos)
function extraerTickets() {
    fetch('/TICKETUCAD/app/models/php/tickets.php', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.status === 'restricted') return;
            todosLosTickets = data; 
            actualizarVistaSilenciosa(); 
        })
        .catch(error => console.error("Error al cargar tickets:", error));
}

// 2. Lógica de actualización silenciosa 
function actualizarVistaSilenciosa() {
    const filtroEl = document.getElementById('filtro-estado');
    if (!filtroEl) return; 
    const filtro = filtroEl.value;
    
    if (filtro === 'all') {
        ticketsFiltradosActuales = todosLosTickets;
    } else {
        ticketsFiltradosActuales = todosLosTickets.filter(ticket => {
            return ticket.estado_nombre && ticket.estado_nombre.toLowerCase().includes(filtro.toLowerCase());
        });
    }
    
    const radioSeleccionado = document.querySelector('input[name="modo_vista"]:checked');
    if (radioSeleccionado) {
        modoPaginado = (radioSeleccionado.value === 'paginado');
    }
    
    renderizarTickets();
}

// 3. Función cuando el USUARIO cambia el filtro manualmente
function aplicarFiltro() {
    paginaActual = 1; 
    actualizarVistaSilenciosa();
}

// 4. Función Principal para dibujar la tabla
function renderizarTickets() {
    let tablaTickets = document.getElementById('tabla_tickets');
    if (!tablaTickets) return;

    let filasAcumuladas = "";
    let ticketsAMostrar = [];
    
    if (modoPaginado) {
        let indiceInicio = (paginaActual - 1) * ticketsPorPagina;
        let indiceFin = indiceInicio + ticketsPorPagina;
        ticketsAMostrar = ticketsFiltradosActuales.slice(indiceInicio, indiceFin);
        actualizarTextoPaginacion();
    } else {
        ticketsAMostrar = ticketsFiltradosActuales;
    }
        
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

// (Radio Buttons)
function cambiarModoVista() {
    const selectorSize = document.getElementById('size-pagina'); // CAMBIO AQUÍ
    const botonesPaginacion = document.getElementById('controles-paginacion');
    const radioSeleccionado = document.querySelector('input[name="modo_vista"]:checked');

    if (!selectorSize || !botonesPaginacion || !radioSeleccionado) return; 

    if (radioSeleccionado.value === 'paginado') {
        selectorSize.style.display = 'inline-block'; // CAMBIO AQUÍ
        botonesPaginacion.style.display = 'flex'; 
        modoPaginado = true;
    } else {
        selectorSize.style.display = 'none'; // CAMBIO AQUÍ
        botonesPaginacion.style.display = 'none'; 
        modoPaginado = false;
    }
    
    paginaActual = 1;
    actualizarVistaSilenciosa();
}


function cambiarSizePagina() {
    const selector = document.getElementById('size-pagina'); // CAMBIO AQUÍ
    if(selector) {
        ticketsPorPagina = parseInt(selector.value);
        paginaActual = 1; 
        actualizarVistaSilenciosa();
    }
}

// 7. Botones Anterior/Siguiente
function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(ticketsFiltradosActuales.length / ticketsPorPagina);
    const nuevaPagina = paginaActual + direccion;

    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTickets();
    }
}

// 8. Texto de Paginación
function actualizarTextoPaginacion() {
    const infoPagina = document.getElementById('info-pagina');
    if(infoPagina) {
        const totalPaginas = Math.ceil(ticketsFiltradosActuales.length / ticketsPorPagina) || 1;
        infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    }
}

// 9. Redirección
function verDetalleTicket(idTicket) {
    sessionStorage.setItem('ucad_ticket_id', String(idTicket));
    window.location.href = '/TICKETUCAD/vista-ticket';
}

// --- ARRANQUE Y TEMPORIZADOR BLINDADO ---

document.addEventListener('DOMContentLoaded', () => {
    extraerTickets();
    cambiarModoVista(); 
    
    // Ejecutamos la búsqueda silenciosa cada 10 segundos
    setInterval(extraerTickets, 10000);
});