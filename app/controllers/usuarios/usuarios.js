$.fn.dataTable.ext.errMode = 'none'; // Suprime el popup nativo de error de DataTables


async function sha256(text) {// Convierte una contraseña en un codigo ilegible antes de enviar al servido
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));// Encripta el texto con SHA-256
    return Array.from(new Uint8Array(buffer))// Convierte esos datos a una lista de numeros
        .map(b => b.toString(16).padStart(2, '0'))// Pasa cada numero a hexadecimal con 2 digitos
        .join('');// Junta todo en un texto de 64 caracteres
}

$(function () {
    // Estado actual del toggle: 'activo' o 'inactivo'
    let estadoActual = 'activo';

    // Inicializar Select2 con AJAX
    function initSelect2() {
        $('#buscador_usuario').select2({
            placeholder: 'Escribí para buscar un usuario...',
            allowClear: true,
            dropdownParent: $('.usr-wrap'),
            ajax: {
                url: '/TICKETUCAD/app/models/usuarios/listar_select2.php',
                type: 'POST',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        query:  params.term || '',
                        estado: estadoActual
                    };
                },
                processResults: function (response) {
                    return { results: response.success ? response.data : [] };
                }
            }
        });
    }

    initSelect2();

    // Cuando se selecciona un usuario del Select2, filtrar la tabla
    $('#buscador_usuario').on('select2:select', function (e) {
        let usuarioId = e.params.data.id;
        $("#tabla_usuarios").DataTable().ajax.reload();
        $("#tabla_usuarios").DataTable().settings()[0].ajax.data = function (d) {
            d.filtro_estado = estadoActual;
            d.usuario_id    = usuarioId;
        };
        $("#tabla_usuarios").DataTable().ajax.reload();
    });

    // Cuando se "limpia" el Select2 desde su X, mostrar todos
    $('#buscador_usuario').on('select2:clear', function () {
        $("#tabla_usuarios").DataTable().settings()[0].ajax.data = function (d) {
            d.filtro_estado = estadoActual;
            d.usuario_id    = 0;
        };
        $("#tabla_usuarios").DataTable().ajax.reload();
    });

    // Botón "Limpiar filtro" — reinicia todo
    $('#btn_limpiar').on('click', function () {
        $('#buscador_usuario').val(null).trigger('change');
        $("#tabla_usuarios").DataTable().settings()[0].ajax.data = function (d) {
            d.filtro_estado = estadoActual;
            d.usuario_id    = 0;
        };
        $("#tabla_usuarios").DataTable().ajax.reload();
    });

    // Toggle Activos / Inactivos
    $('#btn_activos, #btn_inactivos').on('click', function () {
        let nuevoEstado = $(this).attr('id') === 'btn_activos' ? 'activo' : 'inactivo';
        if (nuevoEstado === estadoActual) return;

        estadoActual = nuevoEstado;

        // Actualizar visual del toggle
        $('#btn_activos, #btn_inactivos').removeClass('active');
        $(this).addClass('active');

        // Limpiar el Select2 (los resultados son del estado anterior)
        $('#buscador_usuario').val(null).trigger('change');

        // Recargar la tabla con el nuevo estado
        $("#tabla_usuarios").DataTable().settings()[0].ajax.data = function (d) {
            d.filtro_estado = estadoActual;
            d.usuario_id    = 0;
        };
        $("#tabla_usuarios").DataTable().ajax.reload();
    });

    cargar_roles();
    listar_usuarios();

    $("#form_crear").on("submit", function (e) {
        e.preventDefault();
        crear_usuario();
    });

    $("#form_editar").on("submit", function (e) {
        e.preventDefault();
        guardar_edicion();
    });

    $(document).on("click", ".edit-user", function () {
        let id      = $(this).data("id");
        let nombre  = $(this).data("nombre");
        let correo  = $(this).data("correo");
        let usuario = $(this).data("usuario");
        let rol_id  = $(this).data("rol_id");
        abrir_editar(id, nombre, correo, usuario, rol_id);
    });

    $(document).on("click", ".toggle-user", function () {
        let id     = $(this).data("id");
        let estado = $(this).data("estado");
        cambiar_estado(id, estado);
    });

    $(document).on("click", ".del-user", function () {
        let id     = $(this).data("id");
        let nombre = $(this).data("nombre");
        eliminar_usuario(id, nombre);
    });
});

function cargar_roles(intento = 1){
    $.ajax({
        url: "/TICKETUCAD/app/models/usuarios/listar_roles.php",
        method: "POST",
        data: {},
        dataType: "json",
    }).done(function (response) {
        if(response.success){
            let opts = '<option value="">-- Selecciona un rol --</option>';
            for(let i = 0; i < response.total; i++){
                opts += "<option value='"+ response.data[i].id +"'>"+ response.data[i].nombre +"</option>";
            }
            $("#crear_rol").html(opts);
            $("#editar_rol").html(opts);
        } else if (intento < 3) {
            setTimeout(function () { cargar_roles(intento + 1); }, 2000);
        } else {
            Swal.fire({
                title: "¡Atención!",
                text: response.error + ". Por favor refresca la página.",
                icon: "warning"
            });
        }
    }).fail(function () {
        if (intento < 3) {
            setTimeout(function () { cargar_roles(intento + 1); }, 2000);
        } else {
            Swal.fire({
                title: "¡Atención!",
                text: "Error de conexión. Por favor refresca la página.",
                icon: "warning"
            });
        }
    });
}

function listar_usuarios() {
    if ($.fn.DataTable.isDataTable("#tabla_usuarios")) {
        $("#tabla_usuarios").DataTable().clear();
        $("#tabla_usuarios").DataTable().destroy();
    } 
    $("#tabla_usuarios").DataTable({
        destroy: true,
        info: true,
        filter: true,
        lengthChange: false,
        pageLength: 5,
        responsive: true,
        processing: true,
        serverSide: true,
        searchDelay: 500,
        // Desactiva la busqueda nativa (ya tenemos el Select2 arriba)
        searching: false,
        language: {
            search: "Buscar:",
            info: "Mostrando _START_ a _END_ de _TOTAL_ usuarios",
            infoEmpty: "Sin usuarios",
            paginate: { previous: "Anterior", next: "Siguiente" },
            processing: "Cargando...",
            zeroRecords: "No se encontraron usuarios"
        },
       ajax: {
    url: "/TICKETUCAD/app/models/usuarios/mostrar.php",
    method: "POST",
    dataType: "json",
    data: function (d) {
        // Estado por defecto = 'activo' (al primer load)
        d.filtro_estado = $('#btn_inactivos').hasClass('active') ? 'inactivo' : 'activo';
        d.usuario_id    = 0;
    },
    error: function () {
        setTimeout(function () {
            $("#tabla_usuarios").DataTable().ajax.reload();
        }, 2000);
    }
},
        columns: [
            { data: "id", orderable: true,
              render: function (value) { return "<span style='color:#cbd5e1;'>#" + value + "</span>"; }
            },
            { data: "nombre", orderable: true,
              render: function (value, type, row) {
                let iniciales = obtener_iniciales(value);
                return "<div class='d-flex align-items-center'><span class='badge badge-primary mr-2 p-2'>" + iniciales + "</span><strong>" + value + "</strong></div>";
              }
            },
            { data: "correo", orderable: true,
              render: function (value) { return "<span style='color:#cbd5e1;'>" + value + "</span>"; }
            },
            { data: "rol", orderable: true,
              render: function (value, type, row) { return obtener_badge_rol(value); }
            },
            { data: "estado", orderable: true,
              render: function (value) {
                return value === "activo"
                    ? "<span class='badge badge-success'>Activo</span>"
                    : "<span class='badge badge-danger'>Inactivo</span>";
              }
            },
            { data: "fecha_creacion", orderable: true,
              render: function (value) { return value ? value.substring(0, 10) : "-"; }
            },
            { data: "id", orderable: false,
              render: function (value, type, row) {
                return "<button class='btn btn-sm btn-outline-primary edit-user mr-1' title='Editar' " +
                    "data-id='" + row.id + "' data-nombre='" + row.nombre + "' data-correo='" + row.correo + "' " +
                    "data-usuario='" + row.usuario + "' data-rol_id='" + row.rol_id + "'>" +
                    "<i class='fas fa-edit'></i></button>" +
                "<button class='btn btn-sm btn-outline-warning toggle-user mr-1' title='Cambiar estado' " +
                    "data-id='" + row.id + "' data-estado='" + row.estado + "'>" +
                    "<i class='fas fa-exchange-alt'></i></button>" +
                "<button class='btn btn-sm btn-outline-danger del-user' title='Eliminar' " +
                    "data-id='" + row.id + "' data-nombre='" + row.nombre + "'>" +
                    "<i class='fas fa-trash'></i></button>";
              }
            },
        ]
    });
}

function crear_usuario(){
    $.ajax({
        url: "/TICKETUCAD/app/models/usuarios/crear.php",
        method: "POST",
        data: {
            nombre:  $("#crear_nombre").val(),
            correo:  $("#crear_correo").val(),
            usuario: $("#crear_usuario").val(),
            rol_id:  $("#crear_rol").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if(response.success){
            $("#modal_crear").modal("hide");
            $("#form_crear")[0].reset();
            Swal.fire({
                title: "¡Usuario creado!",
                html: response.msg + "<br><br><b>Contraseña temporal:</b> <span style='font-size:1.3rem; color:#4d9fff;'>" + response.password_temporal + "</span><br><small>Esta contraseña deberá cambiarse en el primer inicio de sesion</small>",
                icon: "success"
            });
            listar_usuarios();
        }else{
            Swal.fire({
                title: "¡Atención!",
                text: response.error,
                icon: "info"
            });
        }
    }).fail(function () {
        Swal.fire({
            title: "¡Atención!",
            text: "Error de conexión. Por favor refresca la página.",
            icon: "warning"
        });
    });
}

function abrir_editar(id, nombre, correo, usuario, rol_id){
    $("#editar_id").val(id);
    $("#editar_nombre").val(nombre);
    $("#editar_correo").val(correo);
    $("#editar_usuario").val(usuario);
    $("#editar_rol").val(rol_id);
    $("#editar_password").val("");
    $("#modal_editar").modal("show");
}

// Se marca como async porque adentro se usa await sha256()
async function guardar_edicion(){
    // Si el admin escribio una password nueva, la hasheamos con SHA-256 antes de enviar
    // Si dejo el campo vacio (no quiere cambiarla), mandamos string vacio como antes
    let passPlano = $("#editar_password").val();
    let passHash  = passPlano !== '' ? await sha256(passPlano) : '';

    $.ajax({
        url: "/TICKETUCAD/app/models/usuarios/editar.php",
        method: "POST",
        data: {
            id:       $("#editar_id").val(),
            nombre:   $("#editar_nombre").val(),
            correo:   $("#editar_correo").val(),
            usuario:  $("#editar_usuario").val(),
            password: passHash, // Va el hash SHA-256, no el texto plano
            rol_id:   $("#editar_rol").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if(response.success){
            $("#modal_editar").modal("hide");
            Swal.fire({
                title: "¡Éxito!",
                text: response.msg,
                icon: "success"
            });
            listar_usuarios();
        }else{
            Swal.fire({
                title: "¡Atención!",
                text: response.error,
                icon: "info"
            });
        }
    }).fail(function () {
        Swal.fire({
            title: "¡Atención!",
            text: "Error de conexión. Por favor refresca la página.",
            icon: "warning"
        });
    });
}

function cambiar_estado(id, estado_actual){
    let nuevo = estado_actual === "activo" ? "inactivo" : "activo";
    Swal.fire({
        icon: "question",
        title: "¿Cambiar estado?",
        text: "El usuario pasará a "+ nuevo +".",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Sí, cambiar",
        denyButtonText: `Cancelar`,
    }).then((result) => {
        if(result.isConfirmed){
            $.ajax({
                url: "/TICKETUCAD/app/models/usuarios/cambiar_estado.php",
                method: "POST",
                data: { id: id },
                dataType: "json",
            }).done(function (response) {
                if(response.success){
                    listar_usuarios();
                    Swal.fire({
                        title: "¡Éxito!",
                        text: response.msg,
                        icon: "success"
                    });
                }else{
                    Swal.fire({
                        title: "¡Atención!",
                        text: response.error,
                        icon: "info"
                    });
                }
            }).fail(function () {
                Swal.fire({
                    title: "¡Atención!",
                    text: "Error de conexión. Por favor refresca la página.",
                    icon: "warning"
                });
            });
        }
    });
}

function eliminar_usuario(id, nombre){
    Swal.fire({
        icon: "question",
        title: "¿Estás seguro de eliminar este usuario?",
        text: 'Se eliminará a "'+ nombre +'" de forma permanente.',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Sí, eliminar",
        denyButtonText: `Cancelar`,
    }).then((result) => {
        if(result.isConfirmed){
            $.ajax({
                url: "/TICKETUCAD/app/models/usuarios/eliminar.php",
                method: "POST",
                data: { id: id },
                dataType: "json",
            }).done(function (response) {
                if(response.success){
                    listar_usuarios();
                    Swal.fire({
                        title: "¡Éxito!",
                        text: response.msg,
                        icon: "success"
                    });
                }else{
                    Swal.fire({
                        title: "¡Atención!",
                        text: response.error,
                        icon: "info"
                    });
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                Swal.fire({
                    title: "¡Atención!",
                    text: `Ocurrió un error al conectar con el servidor: ${textStatus}`,
                    icon: "info"
                });  
            });
        }
    });
}

function obtener_iniciales(nombre){
    return nombre.split(" ")
        .map(function (p) { return p[0]; })
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function obtener_badge_rol(rol){
    let clases = {
        "Administrador": "badge-primary",
        "Técnico":       "badge-secondary",
        "Usuario":       "badge-light",
    };
    let cls = clases[rol] || "badge-light";
    return "<span class='badge "+ cls +"'>"+ (rol || "Sin rol") +"</span>";
}
