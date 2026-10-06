<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario - Tutorías UAS</title>
    @vite('resources/css/registerblade.css')
</head>
<body>

    <main class="register-page">
        <section class="register-intro" aria-label="Información de Tutorías UAS">
            <p class="brand-label">UNIVERSIDAD AUTÓNOMA DE SINALOA</p>
            <h1>Únete a Tutorías UAS</h1>
            <p class="intro-copy">Crea tu cuenta para conectar con tutores, compartir conocimientos y avanzar en tu formación académica.</p>
        </section>

        <section class="register-card" aria-labelledby="register-title">
            <p class="card-eyebrow">COMUNIDAD ACADÉMICA</p>
            <h2 id="register-title">Crear cuenta</h2>
            <p class="card-copy">Completa tus datos para comenzar.</p>

            {{-- Contenedor para errores de la API --}}
            <div id="error-container" class="error-list" style="display: none;">
                <ul id="error-list"></ul>
            </div>

            {{-- Contenedor para éxito --}}
            <div id="success-container" class="success-list" style="display: none;">
                ¡Registro exitoso! Redirigiendo...
            </div>

            <form id="register-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" autocomplete="given-name" placeholder="Tu nombre" required>
                    </div>

                    <div class="form-group">
                        <label for="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido" autocomplete="family-name" placeholder="Tu apellido" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="correo_institucional">Correo institucional</label>
                    <input type="email" id="correo_institucional" name="correo_institucional" autocomplete="email" placeholder="nombre@uas.edu.mx" required>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña <span class="label-hint">(mínimo 8 caracteres)</span></label>
                    <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Crea una contraseña" required minlength="8">
                </div>

                <div class="form-group">
                    <label for="carrera">Carrera</label>
                    <select id="carrera" name="carrera" required>
                        <option value="">-- Cargando carreras... --</option>
                    </select>
                </div>

                <button type="submit">Crear cuenta</button>
            </form>

            <div class="links">
                <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></p>
            </div>
        </section>
    </main>

    <script>
    // =============================================
    // 1. Cargar carreras desde la API (con el diseño intacto)
    // =============================================
    // Consulta las carreras disponibles y las agrega como opciones del selector del formulario.
    (async () => {
        try {
            const res = await fetch('http://127.0.0.1:8001/api/carreras', {
                headers: { 'Accept': 'application/json' }
            });
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
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const errorContainer = document.getElementById('error-container');
        const errorList = document.getElementById('error-list');
        const successContainer = document.getElementById('success-container');

        // Ocultar mensajes previos
        errorContainer.style.display = 'none';
        successContainer.style.display = 'none';
        errorList.innerHTML = '';

        try {
            const res = await fetch('http://127.0.0.1:8001/api/register', {
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

            if (res.ok) {
                // Éxito: guardar token y redirigir
                localStorage.setItem('auth_token', data.token);
                successContainer.style.display = 'block';
                // Da tiempo para que el usuario vea el mensaje de éxito antes de abrir el panel.
                setTimeout(() => window.location.href = '/dashboard', 1500);
            } else {
                // Error de validación: mostrar lista de errores
                errorContainer.style.display = 'block';
                if (data.errors) {
                    // Muestra por separado cada mensaje de validación devuelto por la API.
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
            li.textContent = 'Error de conexión con la API. ¿Está corriendo en el puerto 8001?';
            errorList.appendChild(li);
            console.error(err);
        }
    });
    </script>

</body>
</html>