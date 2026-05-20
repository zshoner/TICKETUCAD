const POR_PAGINA = 5;
let _categorias  = [];
let _estados     = [];
let _prioridades = [];
$(document).ready(function () {
    listar_categorias();
    

    $("#form_crear_cat").on("submit", function (e) { e.preventDefault(); crear_categoria(); });
    $("#form_editar_cat").on("submit", function (e) { e.preventDefault(); guardar_edicion_categoria(); });

    $("#form_crear_est").on("submit", function (e) { e.preventDefault(); crear_estado(); });
    $("#form_editar_est").on("submit", function (e) { e.preventDefault(); guardar_edicion_estado(); });

    $("#form_crear_pri").on("submit", function (e) { e.preventDefault(); crear_prioridad(); });
    $("#form_editar_pri").on("submit", function (e) { e.preventDefault(); guardar_edicion_prioridad(); });

    $("#tb_categorias").on("click", ".edit-cat", function () {
        let id     = $(this).data("id");
        let nombre = $(this).data("nombre");
        abrir_editar_categoria(id, nombre);
    });
});
function listar_categorias() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/categoria/listar.php",
        method: "POST",
        dataType: "json",
        }).done(function (r) {
        if (!r.success) { Swal.fire({ title: "¡Atención!", text: r.error, icon: "info" }); return; }
        _categorias = r.data;
        renderCategorias(1);
        listar_estados();
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}

function crear_categoria() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/categoria/crear.php",
        method: "POST",
        data: {
            nombre: $("#crear_cat_nombre").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_crear_cat").modal("hide");
            $("#form_crear_cat")[0].reset();
            Swal.fire({
                title: "¡Éxito!",
                text: response.msg,
                icon: "success"
            });
            listar_categorias();
        } else {
            Swal.fire({
                title: "¡Atención!",
                text: response.error,
                icon: "info"
            });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({
            title: "¡Atención!",
            text: `Ocurrió un error al conectar con el servidor: ${textStatus}`,
            icon: "info"
        });
    });
}
function abrir_editar_categoria(id, nombre) {
    $("#editar_cat_id").val(id);
    $("#editar_cat_nombre").val(nombre);
    $("#modal_editar_cat").modal("show");

   
}

function guardar_edicion_categoria() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/categoria/editar.php",
        method: "POST",
        data: {
            id:     $("#editar_cat_id").val(),
            nombre: $("#editar_cat_nombre").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_editar_cat").modal("hide");
            Swal.fire({
                title: "¡Éxito!",
                text: response.msg,
                icon: "success"
            });
            listar_categorias();
        } else {
            Swal.fire({
                title: "¡Atención!",
                text: response.error,
                icon: "info"
            });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({
            title: "¡Atención!",
            text: `Ocurrió un error al conectar con el servidor: ${textStatus}`,
            icon: "info"
        });
    });

}
function renderCategorias(pag) {
    let slice = _categorias.slice((pag - 1) * POR_PAGINA, pag * POR_PAGINA);
    let filas = "";
    slice.forEach(function (c) {
        filas += "<tr><td><strong>" + c.nombre + "</strong></td>" +
                 "<td><button class='btn btn-sm btn-info edit-cat mr-1' data-id='" + c.id + "' data-nombre='" + c.nombre + "'><i class='fas fa-edit'></i></button></td></tr>";
    });
    $("#tb_categorias").html(filas);
    renderPaginacion("#pag_categorias", _categorias.length, pag, renderCategorias);
}

function renderPaginacion(contenedor, total, pagActual, callback) {
    let totalPags = Math.ceil(total / POR_PAGINA);
    if (totalPags <= 1) { $(contenedor).html(""); return; }
    let html = '<ul class="pagination pagination-sm justify-content-center mt-2">';
    for (let i = 1; i <= totalPags; i++) {
        html += '<li class="page-item ' + (i === pagActual ? 'active' : '') + '">' +
                    '<a class="page-link" href="#">' + i + '</a>' +
                '</li>';
    }
    html += '</ul>';
    $(contenedor).html(html);
    $(contenedor).find(".page-link").on("click", function (e) {
        e.preventDefault();
        callback(parseInt($(this).text()));
    });
}
function listar_estados() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/estados/listar.php",
        method: "POST",
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            let filas = "";
            response.data.forEach(function (e) {
                filas +=
                "<tr>" +
                    "<td><strong>" + e.nombre + "</strong></td>" +
                    "<td class='text-right'>" +
                        "<button class='btn btn-sm btn-outline-primary' " +
                            "onclick='abrir_editar_estado(" + e.id + ", \"" + e.nombre + "\", " + e.es_final + ")'>" +
                            "<i class='fas fa-edit'></i>" +
                        "</button>" +
                    "</td>" +
                "</tr>";
            });
            $("#tb_estados").html(filas);
            listar_prioridades();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}

function crear_estado() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/estados/crear.php",
        method: "POST",
        data: {
            nombre:   $("#crear_est_nombre").val(),
            es_final: $("#crear_est_es_final").is(":checked") ? 1 : 0
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_crear_est").modal("hide");
            $("#form_crear_est")[0].reset();
            Swal.fire({ title: "¡Éxito!", text: response.msg, icon: "success" });
            listar_estados();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}

function abrir_editar_estado(id, nombre, es_final) {
    $("#editar_est_id").val(id);
    $("#editar_est_nombre").val(nombre);
    $("#editar_est_es_final").prop("checked", es_final == 1);
    $("#modal_editar_est").modal("show");
}

function guardar_edicion_estado() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/estados/editar.php",
        method: "POST",
        data: {
            id:       $("#editar_est_id").val(),
            nombre:   $("#editar_est_nombre").val(),
            es_final: $("#editar_est_es_final").is(":checked") ? 1 : 0
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_editar_est").modal("hide");
            Swal.fire({ title: "¡Éxito!", text: response.msg, icon: "success" });
            listar_estados();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}
function listar_prioridades() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/prioridades/listar.php",
        method: "POST",
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            let filas = "";
            response.data.forEach(function (p) {
                filas +=
                "<tr>" +
                    "<td><strong>" + p.nombre + "</strong></td>" +
                    "<td class='text-muted'>" + p.nivel + "</td>" +
                    "<td class='text-right'>" +
                        "<button class='btn btn-sm btn-outline-primary' " +
                            "onclick='abrir_editar_prioridad(" + p.id + ", \"" + p.nombre + "\", " + p.nivel + ")'>" +
                            "<i class='fas fa-edit'></i>" +
                        "</button>" +
                    "</td>" +
                "</tr>";
            });
            $("#tb_prioridades").html(filas);
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}

function crear_prioridad() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/prioridades/crear.php",
        method: "POST",
        data: {
            nombre: $("#crear_pri_nombre").val(),
            nivel:  $("#crear_pri_nivel").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_crear_pri").modal("hide");
            $("#form_crear_pri")[0].reset();
            Swal.fire({ title: "¡Éxito!", text: response.msg, icon: "success" });
            listar_prioridades();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}

function abrir_editar_prioridad(id, nombre, nivel) {
    $("#editar_pri_id").val(id);
    $("#editar_pri_nombre").val(nombre);
    $("#editar_pri_nivel").val(nivel);
    $("#modal_editar_pri").modal("show");
}

function guardar_edicion_prioridad() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/prioridades/editar.php",
        method: "POST",
        data: {
            id:     $("#editar_pri_id").val(),
            nombre: $("#editar_pri_nombre").val(),
            nivel:  $("#editar_pri_nivel").val(),
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_editar_pri").modal("hide");
            Swal.fire({ title: "¡Éxito!", text: response.msg, icon: "success" });
            listar_prioridades();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}