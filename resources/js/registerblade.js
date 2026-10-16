const form = document.getElementById('register-form');
const apiBaseUrl = form.dataset.apiBaseUrl;

// =============================================
// 1. Cargar carreras desde la API (con el diseño intacto)
// =============================================
// Consulta las carreras disponibles y las agrega como opciones del selector del formulario.
(async () => {
    try {
        const res = await fetch(`${apiBaseUrl}/api/carreras`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) {
            throw new Error(`No se pudieron cargar las carreras (HTTP ${res.status}).`);
        }

        const carreras = await res.json();
        const select = document.getElementById('carrera');
        select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
        // Crea una opción seleccionable por cada carrera recibida de la API.
        carreras.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.nombre;
            opt.textContent = c.nombre;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Error al cargar carreras:', err);
        document.getElementById('carrera').innerHTML =
            '<option value="">-- Error al cargar carreras --</option>';
    }
})();

// =============================================
// 2. Enviar el formulario a la API
// =============================================
// Envía los datos de registro, presenta la respuesta y guarda el token cuando hay éxito.
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorContainer = document.getElementById('error-container');
    const errorList = document.getElementById('error-list');
    const successContainer = document.getElementById('success-container');
    const submitButton = form.querySelector('button[type="submit"]');

    // Ocultar mensajes previos
    errorContainer.style.display = 'none';
    successContainer.style.display = 'none';
    errorList.innerHTML = '';
    submitButton.disabled = true;

    try {
        const res = await fetch(`${apiBaseUrl}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                nombre: form.nombre.value,
                apellido: form.apellido.value,
                correo_institucional: form.correo_institucional.value,
                password: form.password.value,
                carrera: form.carrera.value,
            }),
        });

        const data = await res.json();

        if (res.ok && !data.token) {
            errorContainer.style.display = 'block';
            const li = document.createElement('li');
            li.textContent = 'La API no devolvió el token de acceso. Intenta nuevamente o contacta al administrador.';
            errorList.appendChild(li);
        } else if (res.ok) {
            localStorage.setItem('auth_token', data.token);
            form.style.display = 'none';
            successContainer.style.display = 'block';
        } else {
            // Mostrar errores de validación o registro.
            errorContainer.style.display = 'block';
            if (data.errors) {
                Object.values(data.errors).flat().forEach(msg => {
                    const li = document.createElement('li');
                    li.textContent = msg;
                    errorList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = data.message || 'Error al registrarse';
                errorList.appendChild(li);
            }
        }
    } catch (err) {
        // Error de conexión con la API
        errorContainer.style.display = 'block';
        const li = document.createElement('li');
        li.textContent = 'No fue posible conectar con la API.';
        errorList.appendChild(li);
        console.error(err);
    } finally {
        submitButton.disabled = false;
    }
});

// El usuario continúa al perfil después de crear la cuenta.
document.getElementById('continue-btn').addEventListener('click', () => {
    window.location.href = '/dashboard';
});
