<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Tutorías UAS</title>
    @vite('resources/css/loginblade.css')

</head>
<body>

    <main class="login-page">
        <section class="login-intro" aria-label="Información de Tutorías UAS">
            <p class="brand-label">UNIVERSIDAD AUTÓNOMA DE SINALOA</p>
            <h1>Tutorías UAS</h1>
            <p class="intro-copy">Conecta con el conocimiento. Encuentra apoyo académico y comparte lo que sabes con nuestra comunidad.</p>
        </section>

        <section class="login-card" aria-labelledby="login-title">
            <p class="card-eyebrow">PLATAFORMA ACADÉMICA</p>
            <h2 id="login-title">Bienvenido de nuevo</h2>
            <p class="card-copy">Inicia sesión para continuar con tus tutorías.</p>

            {{-- Contenedor para errores que vienen de la API --}}
            <div id="error-container" class="error-list" style="display: none;">
                <ul id="error-list"></ul>
            </div>

            <form id="login-form">
                <div class="form-group">
                    <label for="correo_institucional">Correo institucional</label>
                    <input type="email" id="correo_institucional" name="correo_institucional" autocomplete="username" placeholder="nombre@uas.edu.mx" required autofocus>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" autocomplete="current-password" placeholder="Ingresa tu contraseña" required>
                </div>

                <button type="submit">Iniciar sesión</button>
            </form>

            <div class="links">
                <p>¿Aún no tienes cuenta? <a href="/register">Regístrate aquí</a></p>
            </div>
        </section>
    </main>

    <script>
    // Procesa el inicio de sesión, muestra los errores de la API y redirige si las credenciales son válidas.
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const errorContainer = document.getElementById('error-container');
        const errorList = document.getElementById('error-list');

        // Ocultar errores previos
        errorContainer.style.display = 'none';
        errorList.innerHTML = '';

        try {
            const res = await fetch('http://127.0.0.1:8001/api/login', {
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
                window.location.href = '/dashboard';
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
            li.textContent = 'Error de conexión con la API. ¿Está corriendo en el puerto 8001?';
            errorList.appendChild(li);
            console.error(err);
        }
    });
    </script>

</body>
</html>