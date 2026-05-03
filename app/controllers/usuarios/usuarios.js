$(function () {
    cargar_roles();
    listar_usuarios();

    let timer;
    $("#inp_buscar").on("keyup", function () {
        clearTimeout(timer);
        timer = setTimeout(listar_usuarios, 400);
    });

    $("#btn_agregar").click(function () {
        $("#modal_crear").modal("show");
    });

    $("#form_crear").on("submit", function (e) {
        e.preventDefault();
        crear_usuario();
    });

    $("#form_editar").on("submit", function (e) {
        e.preventDefault();
        guardar_edicion();
    });

    $("#tb_usuarios").on("click", ".edit-user", function () {
        let id      = $(this).data("id");
        let nombre  = $(this).data("nombre");
        let correo  = $(this).data("correo");
        let usuario = $(this).data("usuario");
        let rol_id  = $(this).data("rol_id");
        abrir_editar(id, nombre, correo, usuario, rol_id);
    });

    $("#tb_usuarios").on("click", ".toggle-user", function () {
        let id     = $(this).data("id");
        let estado = $(this).data("estado");
        cambiar_estado(id, estado);
    });

    $("#tb_usuarios").on("click", ".del-user", function () {
        let id     = $(this).data("id");
        let nombre = $(this).data("nombre");
        eliminar_usuario(id, nombre);
    });
});

function cargar_roles(){
    $.ajax({
        url: "../../models/usuarios/listar_roles.php",
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

function listar_usuarios(){
    $.ajax({
        url: "../../models/usuarios/listar.php",
        method: "POST",
        data: {
            busqueda: $("#inp_buscar").val()
        },
        dataType: "json",
    }).done(function (response) {
        if(response.success){
            let filas = "";
            for(let i = 0; i < response.total; i++){
                let u         = response.data[i];
                let iniciales = obtener_iniciales(u.nombre);
                let badge_rol = obtener_badge_rol(u.rol);
                let badge_est = u.estado === "activo"
                    ? '<span class="badge badge-success">Activo</span>'
                    : '<span class="badge badge-danger">Inactivo</span>';
                let fecha = u.fecha_creacion ? u.fecha_creacion.substring(0, 10) : "-";

                let botones =
                "<button class='btn btn-sm btn-outline-primary edit-user mr-1' title='Editar' "+
                    "data-id='"+ u.id +"' data-nombre='"+ u.nombre +"' data-correo='"+ u.correo +"' "+
                    "data-usuario='"+ u.usuario +"' data-rol_id='"+ u.rol_id +"'>"+
                    "<i class='fas fa-edit'></i>"+
                "</button>"+
                "<button class='btn btn-sm btn-outline-warning toggle-user mr-1' title='Cambiar estado' "+
                    "data-id='"+ u.id +"' data-estado='"+ u.estado +"'>"+
                    "<i class='fas fa-exchange-alt'></i>"+
                "</button>"+
                "<button class='btn btn-sm btn-outline-danger del-user' title='Eliminar' "+
                    "data-id='"+ u.id +"' data-nombre='"+ u.nombre +"'>"+
                    "<i class='fas fa-trash'></i>"+
                "</button>";

                filas +=
                "<tr>"+
                    "<td class='text-muted'>#"+ u.id +"</td>"+
                    "<td>"+
                        "<div class='d-flex align-items-center'>"+
                            "<span class='badge badge-primary mr-2 p-2'>"+ iniciales +"</span>"+
                            "<strong>"+ u.nombre +"</strong>"+
                        "</div>"+
                    "</td>"+
                    "<td class='text-muted'>"+ u.correo +"</td>"+
                    "<td class='text-center'>"+ badge_rol +"</td>"+
                    "<td class='text-center'>"+ badge_est +"</td>"+
                    "<td class='text-muted'>"+ fecha +"</td>"+
                    "<td class='text-right'>"+ botones +"</td>"+
                "</tr>";
            }

            if(filas === ""){
                filas = "<tr><td colspan='7' class='text-center text-muted py-3'>No se encontraron usuarios.</td></tr>";
            }

            $("#tb_usuarios").html(filas);
            $("#lbl_total").text("Mostrando "+ response.total +" usuario(s)");
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

function crear_usuario(){
    $.ajax({
        url: "../../models/usuarios/crear.php",
        method: "POST",
        data: {
            nombre:   $("#crear_nombre").val(),
            correo:   $("#crear_correo").val(),
            usuario:  $("#crear_usuario").val(),
            password: $("#crear_password").val(),
            rol_id:   $("#crear_rol").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if(response.success){
            $("#modal_crear").modal("hide");
            $("#form_crear")[0].reset();
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
    }).fail(function (jqXHR, textStatus, errorThrown) {
        Swal.fire({
            title: "¡Atención!",
            text: `Ocurrió un error al conectar con el servidor: ${textStatus}`,
            icon: "info"
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

function guardar_edicion(){
    $.ajax({
        url: "../../models/usuarios/editar.php",
        method: "POST",
        data: {
            id:       $("#editar_id").val(),
            nombre:   $("#editar_nombre").val(),
            correo:   $("#editar_correo").val(),
            usuario:  $("#editar_usuario").val(),
            password: $("#editar_password").val(),
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
    }).fail(function (jqXHR, textStatus, errorThrown) {
        Swal.fire({
            title: "¡Atención!",
            text: `Ocurrió un error al conectar con el servidor: ${textStatus}`,
            icon: "info"
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
                url: "../../models/usuarios/cambiar_estado.php",
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
                url: "../../models/usuarios/eliminar.php",
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
