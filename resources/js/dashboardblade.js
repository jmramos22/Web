const apiBaseUrl = document.querySelector('.dashboard-page').dataset.apiBaseUrl;

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
const avatarInput = document.getElementById('avatar-input');
const avatarImage = document.getElementById('user-avatar');
const avatarFallback = document.getElementById('avatar-fallback');
const avatarMessage = document.getElementById('avatar-message');
const removeAvatarButton = document.getElementById('remove-avatar-btn');

// Mantiene el avatar predeterminado visible si la imagen guardada no está disponible.
avatarImage.addEventListener('error', () => {
    avatarImage.hidden = true;
    avatarFallback.hidden = false;
});

// Consulta el perfil autenticado y muestra los datos y la fotografía del usuario.
(async () => {
    try {
        const res = await fetch(`${apiBaseUrl}/api/user`, {
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

        // Muestra la fotografía guardada; si no existe, permanece visible el icono predeterminado.
        if (user.image_url) {
            avatarImage.src = user.image_url;
            avatarImage.hidden = false;
            avatarFallback.hidden = true;
            removeAvatarButton.hidden = false;
        }
    } catch (err) {
        console.error('Error al cargar usuario:', err);
        document.getElementById('user-nombre').textContent = 'Error al cargar datos';
    }
})();

// =============================================
// 3. Subir fotografía a Laravel + MongoDB
// =============================================
// Valida la imagen seleccionada, muestra una vista previa y la sube a la API.
avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    
    // Limpiar estilos previos
    avatarMessage.classList.remove('error');
    avatarMessage.classList.remove('success');

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    // Validaciones en cliente
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

    // Vista previa inmediata (Feedback rápido para el usuario)
    const temporaryUrl = URL.createObjectURL(file);
    avatarImage.src = temporaryUrl;
    avatarImage.hidden = false;
    avatarFallback.hidden = true;
    avatarMessage.textContent = 'Subiendo fotografía...';

    // Preparar datos para enviar (Multipart/form-data)
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${apiBaseUrl}/api/user/image`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                // ATENCIÓN: No poner 'Content-Type'. Fetch lo calcula automáticamente con el Boundary para FormData.
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            const errors = data.errors ? Object.values(data.errors).flat().join(' ') : data.message;
            throw new Error(errors || 'Error al subir la imagen.');
        }

        // Éxito
        avatarMessage.textContent = data.message; // "Fotografía actualizada correctamente."
        avatarMessage.classList.add('success');
        
        // Reemplazar la vista temporal por la URL real guardada en MongoDB
        avatarImage.src = data.image_url;
        removeAvatarButton.hidden = false;

    } catch (error) {
        avatarMessage.textContent = error.message;
        avatarMessage.classList.add('error');
        // Si falla, se queda la imagen temporal cargada, pero le avisa al usuario.
    } finally {
        // Liberar memoria del navegador
        URL.revokeObjectURL(temporaryUrl);
    }
});

// Pide confirmación y elimina la fotografía tanto en la API como en la vista del perfil.
removeAvatarButton.addEventListener('click', async () => {
    if (!window.confirm('¿Quieres eliminar tu fotografía de perfil?')) {
        return;
    }

    removeAvatarButton.disabled = true;
    avatarInput.disabled = true;
    avatarMessage.classList.remove('error', 'success');
    avatarMessage.textContent = 'Eliminando fotografía...';

    try {
        const res = await fetch(`${apiBaseUrl}/api/user/image`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });
        const data = await res.json();

        if (!res.ok) {
            const errors = data.errors ? Object.values(data.errors).flat().join(' ') : data.message;
            throw new Error(errors || 'No se pudo eliminar la fotografía.');
        }

        avatarImage.removeAttribute('src');
        avatarImage.hidden = true;
        avatarFallback.hidden = false;
        removeAvatarButton.hidden = true;
        avatarInput.value = '';
        avatarMessage.textContent = data.message;
        avatarMessage.classList.add('success');
    } catch (error) {
        avatarMessage.textContent = error.message || 'Error de conexión con la API.';
        avatarMessage.classList.add('error');
    } finally {
        removeAvatarButton.disabled = false;
        avatarInput.disabled = false;
    }
});

// =============================================
// 4. Actualizar Contraseña
// =============================================
// Envía la contraseña actual y la nueva; muestra el resultado y limpia el formulario al tener éxito.
document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.getElementById('password-message');
    message.textContent = '';
    message.className = 'password-message';

    try {
        const res = await fetch(`${apiBaseUrl}/api/user/password`, {
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
// 5. Cerrar sesión
// =============================================
// Intenta cerrar la sesión en la API y siempre limpia el token antes de redirigir al acceso.
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch(`${apiBaseUrl}/api/logout`, {
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
