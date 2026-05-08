$(function () {

    $("#formCambiarPassword").on("submit", function (e) {
        e.preventDefault();

        let nueva     = $("#nueva_password").val();
        let confirmar = $("#confirmar_password").val();

        if (nueva !== confirmar) {
            Swal.fire({
                icon: 'warning',
                title: 'Las contraseñas no coinciden',
                text: 'Verifica que ambas contraseñas sean iguales.',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        if (nueva.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña muy corta',
                text: 'La contraseña debe tener mínimo 8 caracteres.',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        $.ajax({
            url: "/TICKETUCAD/app/models/login/cambiar_password.php",
            method: "POST",
            data: { nueva_password: nueva },
            dataType: "json",
        }).done(function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Contraseña actualizada!',
                    text: 'Ya puedes usar tu nueva contraseña.',
                    confirmButtonText: 'Continuar'
                }).then(() => {
                    window.location.href = '/TICKETUCAD/panel-administrador';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'Cerrar'
                });
            }
        }).fail(function (jqXHR, textStatus) {
            Swal.fire({
                title: "¡Atención!",
                text: `Ocurrió un error al conectar con el servidor: ${textStatus}`,
                icon: "info"
            });
        });
    });

});
