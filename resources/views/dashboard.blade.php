<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Principal - Tutorías UAS</title>
    @vite('resources/css/dashboardblade.css')
    
</head>
<body>

    <main class="dashboard-page">
        <header class="dashboard-header">
            <div>
                <p class="brand-label">UNIVERSIDAD AUTÓNOMA DE SINALOA</p>
                <h1>Tu espacio académico</h1>
                <p class="dashboard-intro">Consulta tu perfil y mantén segura tu cuenta de Tutorías UAS.</p>
            </div>
            <button id="logout-btn" class="logout-button" type="button">Cerrar sesión</button>
        </header>

        <div class="dashboard-grid">
            <section class="user-card" aria-labelledby="profile-title">
                <p class="card-eyebrow">TU CUENTA</p>
                <h2 id="profile-title">Información de perfil</h2>
                <div class="profile-details">
                    <div class="profile-detail">
                        <span class="detail-label">Nombre</span>
                        <span class="detail-value" id="user-nombre">Cargando...</span>
                    </div>
                    <div class="profile-detail">
                        <span class="detail-label">Correo institucional</span>
                        <span class="detail-value" id="user-correo">Cargando...</span>
                    </div>
                    <div class="profile-detail">
                        <span class="detail-label">Carrera</span>
                        <span class="detail-value" id="user-carrera">Cargando...</span>
                    </div>
                    <div class="profile-detail">
                        <span class="detail-label">Rol</span>
                        <span class="detail-value" id="user-rol">Cargando...</span>
                    </div>
                </div>
            </section>

            <section class="password-card" aria-labelledby="password-title">
                <p class="card-eyebrow">PROTEGE TU ACCESO</p>
                <h2 id="password-title">Seguridad de la cuenta</h2>
                <p class="password-description">Actualiza tu contraseña cuando lo necesites. Debe incluir al menos 12 caracteres, mayúsculas, minúsculas, números y símbolos.</p>
                <div id="password-message" class="password-message" role="status" aria-live="polite"></div>
                <form id="password-form">
                    <div class="form-group">
                        <label for="current-password">Contraseña actual</label>
                        <input type="password" id="current-password" autocomplete="current-password" placeholder="Ingresa tu contraseña actual" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-password">Nueva contraseña</label>
                            <input type="password" id="new-password" autocomplete="new-password" minlength="12" placeholder="Crea una contraseña segura" required>
                        </div>
                        <div class="form-group">
                            <label for="new-password-confirmation">Confirma la nueva contraseña</label>
                            <input type="password" id="new-password-confirmation" autocomplete="new-password" minlength="12" placeholder="Escríbela nuevamente" required>
                        </div>
                    </div>
                    <button type="submit" class="update-button">Actualizar contraseña</button>
                </form>
            </section>
        </div>
    </main>

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

    // Envía el cambio de contraseña usando el token de la sesión actual.
    document.getElementById('password-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const message = document.getElementById('password-message');
        message.textContent = '';
        message.className = 'password-message';

        try {
            const res = await fetch('http://127.0.0.1:8001/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    current_password: form.querySelector('#current-password').value,
                    password: form.querySelector('#new-password').value,
                    password_confirmation: form.querySelector('#new-password-confirmation').value,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                const errors = data.errors ? Object.values(data.errors).flat().join(' ') : data.message;
                throw new Error(errors || 'No se pudo actualizar la contraseña.');
            }

            form.reset();
            message.textContent = data.message;
            message.classList.add('success');
        } catch (error) {
            message.textContent = error.message || 'Error de conexión con la API.';
            message.classList.add('error');
        }
    });

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