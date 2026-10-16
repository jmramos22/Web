const form = document.getElementById('login-form');
const apiBaseUrl = form.dataset.apiBaseUrl;

// Procesa el inicio de sesión, muestra los errores de la API y redirige si las credenciales son válidas.
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorContainer = document.getElementById('error-container');
    const errorList = document.getElementById('error-list');

    // Ocultar errores previos
    errorContainer.style.display = 'none';
    errorList.innerHTML = '';

    try {
        const res = await fetch(`${apiBaseUrl}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                correo_institucional: form.correo_institucional.value,
                password: form.password.value,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            // Login exitoso: guardar token y redirigir
            localStorage.setItem('auth_token', data.token);
            window.location.href = data.user?.rol === 'TUTOR' ? '/panel/tutor' : '/panel';
        } else {
            // Mostrar errores de validación o credenciales incorrectas
            errorContainer.style.display = 'block';
            if (data.errors) {
                // Convierte los errores recibidos en elementos de lista para mostrarlos al usuario.
                Object.values(data.errors).flat().forEach(msg => {
                    const li = document.createElement('li');
                    li.textContent = msg;
                    errorList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = data.message || 'Credenciales incorrectas';
                errorList.appendChild(li);
            }
        }
    } catch (err) {
        errorContainer.style.display = 'block';
        const li = document.createElement('li');
        li.textContent = 'No fue posible conectar con la API.';
        errorList.appendChild(li);
        console.error(err);
    }
});