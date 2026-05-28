$.fn.dataTable.ext.errMode = 'none';
$(document).ready(function () {
    listar_categorias();
    
    $("#form_crear_cat").on("submit", function (e) { e.preventDefault(); crear_categoria(); });
    $("#form_editar_cat").on("submit", function (e) { e.preventDefault(); guardar_edicion_categoria(); });

    $("#form_crear_est").on("submit", function (e) { e.preventDefault(); crear_estado(); });
    $("#form_editar_est").on("submit", function (e) { e.preventDefault(); guardar_edicion_estado(); });

    $("#form_crear_pri").on("submit", function (e) { e.preventDefault(); crear_prioridad(); });
    $("#form_editar_pri").on("submit", function (e) { e.preventDefault(); guardar_edicion_prioridad(); });

    $(document).on("click", ".edit-cat", function () {
        abrir_editar_categoria($(this).data("id"), $(this).data("nombre"));
    });
    $(document).on("click", ".edit-est", function () {
        abrir_editar_estado($(this).data("id"), $(this).data("nombre"));
    });
    $(document).on("click", ".edit-pri", function () {
        abrir_editar_prioridad($(this).data("id"), $(this).data("nombre"), $(this).data("nivel"));
    });
});



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
           $("#tabla_categorias").DataTable().ajax.reload();
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
            $("#tabla_categorias").DataTable().ajax.reload(); 
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
function listar_categorias() {
    if ($.fn.DataTable.isDataTable("#tabla_categorias")) {
        $("#tabla_categorias").DataTable().clear();
        $("#tabla_categorias").DataTable().destroy();
    }
    $("#tabla_categorias").DataTable({
        destroy: true,
        info: true,
        filter: true,
        lengthChange: false,
        pageLength: 3,
        responsive: true,
        processing: true, // Activa el indicador "Cargando..." mientras espera datos
        language: {
            search: "Buscar:",
            processing: "Cargando...",
            info: "Mostrando _START_ a _END_ de _TOTAL_ categorías",
            infoEmpty: "Sin categorías",
            paginate: { previous: "Anterior", next: "Siguiente" },
            zeroRecords: "No se encontraron categorías"
        },
        ajax: {
            url: "/TICKETUCAD/app/models/configuraciones/categoria/listar.php",
            method: "POST",
            dataSrc: "data",
            error: function () {
                Swal.fire({ title: "¡Atención!", text: "Error de conexión. Por favor refresca la página.", icon: "warning" });
            }
        },
        columns: [
            { data: "nombre",
              render: function (v) { return "<strong>" + v + "</strong>"; }
            },
            { data: "id", orderable: false, className: "text-right",
              render: function (v, t, row) {
                return "<button class='btn btn-sm btn-outline-primary edit-cat' " +
                       "data-id='" + row.id + "' data-nombre='" + row.nombre + "'>" +
                       "<i class='fas fa-edit'></i></button>";
              }
            }
        ],
        // Cuando categorias termina de cargar, dispara estados (carga secuencial)
        initComplete: function () { listar_estados(); }
    });
}
function listar_estados() {
    if ($.fn.DataTable.isDataTable("#tabla_estados")) {
        $("#tabla_estados").DataTable().clear();
        $("#tabla_estados").DataTable().destroy();
    }
    $("#tabla_estados").DataTable({
        destroy: true,
        info: true,
        filter: true,
        lengthChange: false,
        pageLength: 3,
        responsive: true,
        processing: true, // Activa el indicador "Cargando..." mientras espera datos
        language: {
            search: "Buscar:",
            processing: "Cargando...",
            info: "Mostrando _START_ a _END_ de _TOTAL_ estados",
            infoEmpty: "Sin estados",
            paginate: { previous: "Anterior", next: "Siguiente" },
            zeroRecords: "No se encontraron estados"
        },
        ajax: {
            url: "/TICKETUCAD/app/models/configuraciones/estados/listar.php",
            method: "POST",
            dataSrc: "data",
            error: function () {
                Swal.fire({ title: "¡Atención!", text: "Error de conexión. Por favor refresca la página.", icon: "warning" });
            }
        },
        columns: [
            { data: "nombre",
              render: function (v) { return "<strong>" + v + "</strong>"; }
            },
            { data: "id", orderable: false, className: "text-right",
              render: function (v, t, row) {
                return "<button class='btn btn-sm btn-outline-primary edit-est' " +
                       "data-id='" + row.id + "' data-nombre='" + row.nombre + "'>" +
                       "<i class='fas fa-edit'></i></button>";
              }
            }
        ],
        // Cuando estados termina de cargar, dispara prioridades (carga secuencial)
        initComplete: function () { listar_prioridades(); }
    });
}

function crear_estado() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/estados/crear.php",
        method: "POST",
        data: {
            nombre: $("#crear_est_nombre").val()
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_crear_est").modal("hide");
            $("#form_crear_est")[0].reset();
            Swal.fire({ title: "¡Éxito!", text: response.msg, icon: "success" });
            $("#tabla_estados").DataTable().ajax.reload();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}

function abrir_editar_estado(id, nombre) {
    $("#editar_est_id").val(id);
    $("#editar_est_nombre").val(nombre);
    $("#modal_editar_est").modal("show");
}

function guardar_edicion_estado() {
    $.ajax({
        url: "/TICKETUCAD/app/models/configuraciones/estados/editar.php",
        method: "POST",
        data: {
            id:     $("#editar_est_id").val(),
            nombre: $("#editar_est_nombre").val()
        },
        dataType: "json",
    }).done(function (response) {
        if (response.success) {
            $("#modal_editar_est").modal("hide");
            Swal.fire({ title: "¡Éxito!", text: response.msg, icon: "success" });
            $("#tabla_estados").DataTable().ajax.reload();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}
function listar_prioridades() {
    if ($.fn.DataTable.isDataTable("#tabla_prioridades")) {
        $("#tabla_prioridades").DataTable().clear();
        $("#tabla_prioridades").DataTable().destroy();
    }
    $("#tabla_prioridades").DataTable({
        destroy: true,
        info: true,
        filter: true,
        lengthChange: false,
        pageLength: 3,
        responsive: true,
        processing: true, // Activa el indicador "Cargando..." mientras espera datos
        language: {
            search: "Buscar:",
            processing: "Cargando...",
            info: "Mostrando _START_ a _END_ de _TOTAL_ prioridades",
            infoEmpty: "Sin prioridades",
            paginate: { previous: "Anterior", next: "Siguiente" },
            zeroRecords: "No se encontraron prioridades"
        },
        ajax: {
            url: "/TICKETUCAD/app/models/configuraciones/prioridades/listar.php",
            method: "POST",
            dataSrc: "data",
            error: function () {
                Swal.fire({ title: "¡Atención!", text: "Error de conexión. Por favor refresca la página.", icon: "warning" });
            }
        },
        columns: [
            { data: "nombre",
              render: function (v) { return "<strong>" + v + "</strong>"; }
            },
            { data: "nivel", className: "text-muted" },
            { data: "id", orderable: false, className: "text-right",
              render: function (v, t, row) {
                return "<button class='btn btn-sm btn-outline-primary edit-pri' " +
                       "data-id='" + row.id + "' data-nombre='" + row.nombre + "' " +
                       "data-nivel='" + row.nivel + "'>" +
                       "<i class='fas fa-edit'></i></button>";
              }
            }
        ]
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
            $("#tabla_prioridades").DataTable().ajax.reload();
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
            $("#tabla_prioridades").DataTable().ajax.reload();
        } else {
            Swal.fire({ title: "¡Atención!", text: response.error, icon: "info" });
        }
    }).fail(function (jqXHR, textStatus) {
        Swal.fire({ title: "¡Atención!", text: `Error: ${textStatus}`, icon: "info" });
    });
}