// Función auxiliar para determinar el color según la palabra
function getColorEstado(nombre) {
    if (!nombre) return '#ffffff'; // Default
    const texto = nombre.toLowerCase();
    if (texto.includes('espera')) return '#f97316'; // Naranja
    if (texto.includes('cerrado')) return '#22c55e'; // Verde
    return '#ffffff'; // Blanco por defecto (Abierto)
}

async function extraerTickets() {
    let tablaTickets = document.getElementById('tabla_tickets'); 
    if (!tablaTickets) return;

    tablaTickets.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8; font-style: italic;">
                Cargando datos, por favor espera...
            </td>
        </tr>
    `;

    try {
        // Pedimos los datos secuencialmente para no saturar el límite de 5 conexiones de la base de datos
        const resUsuarios = await fetch('/TICKETUCAD/app/models/php/obtener_usuarios.php');
        const usuarios = await resUsuarios.json();

        const resEstados = await fetch('/TICKETUCAD/app/models/php/obtener_estados.php');
        const estados = await resEstados.json();

        const resTickets = await fetch('/TICKETUCAD/app/models/php/tickets.php');
        const tickets = await resTickets.json();
        
        tablaTickets.innerHTML = "";

        if (tickets.length === 0) {
            tablaTickets.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No hay tickets en la bandeja.</td></tr>`;
            return;
        }

        tickets.forEach(ticket => {
            
            // --- 1. LÓGICA PARA EL DESPLEGABLE DE USUARIOS ---
            let opcionesUsuarios = '<option value="" style="background-color: #0f172a; color: #f8fafc;">Sin asignar</option>';
            usuarios.forEach(user => {
                let seleccionado = (ticket.asignado_id == user.id) ? 'selected' : '';
                opcionesUsuarios += `<option value="${user.id}" ${seleccionado} style="background-color: #0f172a; color: #f8fafc; padding: 5px;">
                                        ${user.nombre}
                                     </option>`;
            });

            // --- 2. LÓGICA PARA EL DESPLEGABLE DE ESTADOS ---
            let colorActual = getColorEstado(ticket.estado_nombre);
            let opcionesEstados = '';
            estados.forEach(est => {
                let seleccionado = (ticket.estado_num == est.id) ? 'selected' : '';
                let colorOpcion = getColorEstado(est.nombre);
                opcionesEstados += `<option value="${est.id}" ${seleccionado} style="background-color: #0f172a; color: ${colorOpcion}; padding: 5px;">
                                        ${est.nombre}
                                    </option>`;
            });

            // OJO: Recuerda borrar el <th>Descripción</th> de tu archivo HTML para que las columnas cuadren
            tablaTickets.innerHTML += `
                <tr style="cursor: pointer; transition: background 0.2s;" 
                    onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 0.05)'" 
                    onmouseout="this.style.backgroundColor='transparent'" 
                    onclick="verDetalleTicket(${ticket['#']})">
                    
                    <td class="ticket-id">${ticket['#']}</td>
                    <td class="ticket-subject">${ticket.titulo}</td>
                    
                    <td>
                        <select class="form-select form-select-sm" 
                                style="width: 100px; background-color: transparent; color: ${colorActual}; border: 1px solid ${colorActual}; border-radius: 6px; padding: 4px; cursor: pointer; outline: none; font-weight: 500;" 
                                onclick="event.stopPropagation();" 
                                onchange="cambiarEstado(${ticket['#']}, this.value, this)">
                            ${opcionesEstados}
                        </select>
                    </td>

                    <td>${ticket.prioridad_id}</td>
                    <td>${ticket.categoria_id}</td>
                    
                    <td>
                        <!-- CAJÓN DE USUARIOS -->
                        <select class="form-select form-select-sm" 
                                style="background-color: #1e293b; color: #f8fafc; border: 1px solid #455fd4; border-radius: 6px; padding: 6px 10px; cursor: pointer; outline: none; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" 
                                onclick="event.stopPropagation();" 
                                onchange="cambiarAsignacion(${ticket['#']}, this.value)">
                            ${opcionesUsuarios}
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
        tablaTickets.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">Error al cargar los datos.</td></tr>`;
    }
}

// Función para actualizar Asignación
function cambiarAsignacion(idTicket, idNuevoUsuario) {
    let formData = new FormData();
    formData.append('ticket_id', idTicket);
    formData.append('usuario_id', idNuevoUsuario);

    fetch('/TICKETUCAD/app/models/php/actualizar_asignacion.php', { method: 'POST', body: formData })
    .catch(err => console.error("Error actualizando asignación:", err));
}

// NUEVA Función para actualizar Estado
function cambiarEstado(idTicket, idNuevoEstado, selectElement) {
    let formData = new FormData();
    formData.append('ticket_id', idTicket);
    formData.append('estado_id', idNuevoEstado);

    // Cambiamos el color de la caja inmediatamente al seleccionar una nueva opción
    let textoOpcion = selectElement.options[selectElement.selectedIndex].text;
    let nuevoColor = getColorEstado(textoOpcion);
    selectElement.style.color = nuevoColor;
    selectElement.style.borderColor = nuevoColor;

    fetch('/TICKETUCAD/app/models/php/actualizar_estado.php', { method: 'POST', body: formData })
    .catch(err => console.error("Error actualizando estado:", err));
}

// Redirección al compañero
function verDetalleTicket(idTicket) {
    window.location.href = `/TICKETUCAD/pages/vista_ticket.html?id=${idTicket}`;
}