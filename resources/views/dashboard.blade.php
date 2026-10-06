<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Principal - Tutorías UAS</title>
    @vite('resources/css/dashboardblade.css')
    
</head>
<body>

    <h2>Bienvenido al Sistema de Tutorías UAS</h2>

    <div class="user-card">
        <p><strong>Usuario:</strong> <span id="user-nombre">Cargando...</span></p>
        <p><strong>Correo:</strong> <span id="user-correo">Cargando...</span></p>
        <p><strong>Carrera:</strong> <span id="user-carrera">Cargando...</span></p>
        <p><strong>Rol:</strong> <span id="user-rol">Cargando...</span></p>
    </div>

    <button id="logout-btn">Cerrar Sesión</button>

    <script>
    // =============================================
    // 1. Verificar token. Si no hay, al login.
    // =============================================
    const token = localStorage.getItem('auth_token');

    if (!token) {
        window.location.href = '/login';
    }

    // =============================================
    // 2. Cargar datos del usuario desde la API
    // =============================================
    // Solicita el perfil autenticado y actualiza los datos visibles en el panel.
    (async () => {
        try {
            const res = await fetch('http://127.0.0.1:8001/api/user', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });

            if (!res.ok) {
                // Token inválido o expirado → al login
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
                return;
            }

            const user = await res.json();

            document.getElementById('user-nombre').textContent  = (user.nombre || '') + ' ' + (user.apellido || '');
            document.getElementById('user-correo').textContent  = user.correo_institucional || '';
            document.getElementById('user-carrera').textContent = user.carrera || '';
            document.getElementById('user-rol').textContent     = user.rol || '';
        } catch (err) {
            console.error('Error al cargar usuario:', err);
            document.getElementById('user-nombre').textContent = 'Error al cargar datos';
        }
    })();

    // =============================================
    // 3. Cerrar sesión (API + limpiar token)
    // =============================================
    // Invalida la sesión en la API, elimina el token local y vuelve al formulario de acceso.
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await fetch('http://127.0.0.1:8001/api/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        }

        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    });
    </script>

</body>
</html>