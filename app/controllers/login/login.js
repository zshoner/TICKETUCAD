document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const usuario  = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;

    if (!usuario || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos.',
            background: '#0d1528',
            color: '#e2e8f0',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const formData = new FormData();
    formData.append('usuario', usuario);
    formData.append('password', password);

    try {
        const res  = await fetch('/TICKETUCAD/app/models/login/login.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.success) {
            // Persistir datos del usuario para usarlos en el panel
            sessionStorage.setItem('ucad_nombre', data.nombre);
            sessionStorage.setItem('ucad_rol',    data.rol);

            Swal.fire({
                icon: 'success',
                title: `¡Bienvenido, ${data.nombre}!`,
                text: `Rol: ${data.rol}`,
                background: '#0d1528',
                color: '#e2e8f0',
                confirmButtonColor: '#2563eb',
                timer: 1400,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => {
                if (data.cambiar_password == 1) {
    window.location.href = '/TICKETUCAD/cambiar-password';
} else {
    window.location.href = '/TICKETUCAD/panel-administrador';
}
            });
        } else {
            document.getElementById('loginForm').reset();
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: data.message,
                background: '#0d1528',
                color: '#e2e8f0',
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Intentar de nuevo'
            });
        }

    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor.',
            background: '#0d1528',
            color: '#e2e8f0',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'Cerrar'
        });
    }
});

// Toggle contraseña
document.getElementById('togglePass').addEventListener('click', function () {
    const input = document.getElementById('password');
    const icon  = document.getElementById('toggleIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye-slash';
    }
});
