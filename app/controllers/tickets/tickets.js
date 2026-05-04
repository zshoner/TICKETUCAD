async function extraerTickets() {
    try {
        const resUsuarios = await fetch('/TICKETUCAD/app/models/php/obtener_usuarios.php');
        const usuarios = await resUsuarios.json();

        const resTickets = await fetch('/TICKETUCAD/app/models/php/tickets.php');
        const tickets = await resTickets.json();

        let tablaTickets = document.getElementById('tabla_tickets'); 
        if (!tablaTickets) return;
        
        tablaTickets.innerHTML = "";

        tickets.forEach(ticket => {
            
            let opcionesHTML = '<option value="" style="background-color: #0f172a; color: #f8fafc;">❌ Sin asignar</option>';
            
            usuarios.forEach(user => {
                let seleccionado = (ticket.asignado_id == user.id) ? 'selected' : '';
                opcionesHTML += `<option value="${user.id}" ${seleccionado} style="background-color: #0f172a; color: #f8fafc; padding: 5px;">
                                    👤 ${user.nombre}
                                 </option>`;
            });

            // Agregamos un efecto hover (para que se ilumine al pasar el mouse) y el onclick para ir al detalle
            tablaTickets.innerHTML += `
                <tr style="cursor: pointer; transition: background 0.2s;" 
                    onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 0.05)'" 
                    onmouseout="this.style.backgroundColor='transparent'" 
                    onclick="verDetalleTicket(${ticket['#']})">
                    
                    <td class="ticket-id">${ticket['#']}</td>
                    <td class="ticket-subject">${ticket.titulo}</td>
                    <td>${ticket.descripcion}</td>
                    <td><span class="badge-status badge-open">${ticket.estado_id}</span></td>
                    <td>${ticket.prioridad_id}</td>
                    <td>${ticket.categoria_id}</td>
                    <td>
                        <select class="form-select form-select-sm" 
                                style="background-color: #1e293b; color: #f8fafc; border: 1px solid #455fd4; border-radius: 6px; padding: 6px 10px; cursor: pointer; outline: none; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" 
                                onclick="event.stopPropagation();" 
                                onchange="cambiarAsignacion(${ticket['#']}, this.value)">
                            ${opcionesHTML}
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}

function cambiarAsignacion(idTicket, idNuevoUsuario) {
    let formData = new FormData();
    formData.append('ticket_id', idTicket);
    formData.append('usuario_id', idNuevoUsuario);

    fetch('/TICKETUCAD/app/models/php/actualizar_asignacion.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => console.log("Servidor:", data))
    .catch(err => console.error("Error actualizando:", err));
}



function verDetalleTicket(idTicket) {
    // AQUI VA EL ARCHIVO DE VISTA DEL TICKET, POR AHORA SOLO REDIRIGE A UNA VISTA EN BLANCO
    window.location.href = `/TICKETUCAD/pages/vista_ticket.html?id=${idTicket}`;
}