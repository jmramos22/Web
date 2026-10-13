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
            <a class="logout-button dashboard-panel-link" href="/panel">Volver al panel</a>
            <button id="logout-btn" class="logout-button" type="button">Cerrar sesión</button>
        </header>

        <div class="dashboard-grid">
            <section class="user-card" aria-labelledby="profile-title">
                <p class="card-eyebrow">TU CUENTA</p>
                <h2 id="profile-title">Información de perfil</h2>
                <div class="avatar-section">
                    <div class="avatar-frame">
                        <span id="avatar-fallback" class="avatar-fallback" aria-hidden="true">E</span>
                        <img id="user-avatar" class="user-avatar" alt="Fotografía de perfil" hidden>
                    </div>
                    <div class="avatar-controls">
                        <label class="avatar-button" for="avatar-input">Elegir fotografía</label>
                        <input
                            id="avatar-input"
                            class="avatar-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            aria-describedby="avatar-help avatar-message"
                        >
                        <p id="avatar-help" class="avatar-help">JPG, PNG o WebP · máximo 5 MB</p>
                        <p id="avatar-message" class="avatar-message" role="status" aria-live="polite">
                            La vista previa es local; los cambios no se guardan todavía.
                        </p>
                    </div>
                </div>
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

            const initials = [user.nombre, user.apellido]
                .filter(Boolean)
                .map(name => name.trim().charAt(0))
                .join('')
                .toUpperCase();
            document.getElementById('avatar-fallback').textContent = initials || 'E';

            // CONEXIÓN CON LA API: cuando el backend devuelva la ruta/URL del avatar
            // (por ejemplo, user.avatar_url), asignarla aquí a user-avatar.src y
            // ocultar avatar-fallback si la URL existe.
        } catch (err) {
            console.error('Error al cargar usuario:', err);
            document.getElementById('user-nombre').textContent = 'Error al cargar datos';
        }
    })();

    // Esta vista previa solo existe en el navegador y no persiste al recargar.
    // CONEXIÓN CON LA API: al definir el endpoint de avatar, enviar el archivo
    // seleccionado en FormData con el token de autenticación y mostrar aquí
    // los mensajes de éxito/error devueltos por el backend.
    const avatarInput = document.getElementById('avatar-input');
    const avatarImage = document.getElementById('user-avatar');
    const avatarFallback = document.getElementById('avatar-fallback');
    const avatarMessage = document.getElementById('avatar-message');
    let temporaryAvatarUrl = null;

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        avatarMessage.classList.remove('error');

        if (!file) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            avatarInput.value = '';
            avatarMessage.textContent = 'Elige una imagen JPG, PNG o WebP.';
            avatarMessage.classList.add('error');
            return;
        }

        if (file.size > maxSize) {
            avatarInput.value = '';
            avatarMessage.textContent = 'La imagen debe pesar 5 MB o menos.';
            avatarMessage.classList.add('error');
            return;
        }

        if (temporaryAvatarUrl) {
            URL.revokeObjectURL(temporaryAvatarUrl);
        }

        temporaryAvatarUrl = URL.createObjectURL(file);
        avatarImage.src = temporaryAvatarUrl;
        avatarImage.hidden = false;
        avatarFallback.hidden = true;
        avatarMessage.textContent = 'Vista previa actualizada. Aún no se ha guardado en tu cuenta.';
    });

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