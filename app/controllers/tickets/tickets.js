function extraerTickets() {
    
    fetch('/TICKETUCAD/app/models/php/tickets.php')
        .then(response => response.json()) // Convierte el paquete recibido en algo que JS entiende
        .then(data => {


            let tablaTickets = document.getElementById('tabla_tickets'); 

            tablaTickets.innerHTML = "";

                
                for (var i = 0; i < data.length; i++) {
                  
                    tablaTickets.innerHTML +=

                    `<tr onclick="verDetalleTicket(${data[i]['#']})" style="cursor: pointer;">
                        <td style="padding: 10px;">${data[i]['#']}</td>
                        <td>${data[i].titulo}</td>
                        <td>${data[i].estado_nombre}</td>
                        <td>${data[i].prioridad_id}</td>
                        <td>${data[i].categoria_id}</td>
                        <td>${data[i].correo}</td>
                        <td>${data[i].asignado_nombre || 'Pendiente'}</td>
                    </tr>`;

                    }



    })
    .catch(error => console.error("Error al cargar:", error));

}

function verDetalleTicket(idTicket) {
    sessionStorage.setItem('ucad_ticket_id', String(idTicket));
    window.location.href = '/TICKETUCAD/vista-ticket';
}
extraerTickets();
