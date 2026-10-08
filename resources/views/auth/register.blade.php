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

            {{-- La contraseña generada solo se muestra tras el registro y no se guarda en el navegador. --}}
            <div id="success-container" class="success-list" style="display: none;">
                <p>¡Cuenta creada! Guarda esta contraseña; por seguridad solo se mostrará ahora.</p>
                <label for="generated-password">Contraseña generada</label>
                <input type="text" id="generated-password" readonly autocomplete="off">
                <button type="button" id="copy-password-btn">Copiar contraseña</button>
                <p id="copy-feedback" role="status" aria-live="polite"></p>
                <button type="button" id="continue-btn">Continuar al perfil</button>
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
        const submitButton = form.querySelector('button[type="submit"]');

        // Ocultar mensajes previos
        errorContainer.style.display = 'none';
        successContainer.style.display = 'none';
        errorList.innerHTML = '';
        submitButton.disabled = true;

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
                    carrera: form.carrera.value,
                }),
            });

            const data = await res.json();

            if (res.ok && (!data.token || !data.generated_password)) {
                // Evita presentar éxito si la API no devuelve los datos necesarios para continuar.
                errorContainer.style.display = 'block';
                const li = document.createElement('li');
                li.textContent = 'La API no devolvió la contraseña generada. Intenta nuevamente o contacta al administrador.';
                errorList.appendChild(li);
            } else if (res.ok) {
                // Solo persistimos el token; la clave temporal queda visible para que el usuario la guarde.
                localStorage.setItem('auth_token', data.token);
                document.getElementById('generated-password').value = data.generated_password;
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
            li.textContent = 'Error de conexión con la API. ¿Está corriendo en el puerto 8001?';
            errorList.appendChild(li);
            console.error(err);
        } finally {
            submitButton.disabled = false;
        }
    });

    // Permite guardar la clave mostrada sin volver a solicitarla a la API.
    document.getElementById('copy-password-btn').addEventListener('click', async () => {
        const passwordField = document.getElementById('generated-password');
        const feedback = document.getElementById('copy-feedback');

        try {
            await navigator.clipboard.writeText(passwordField.value);
            feedback.textContent = 'Contraseña copiada.';
        } catch (error) {
            // Si el navegador bloquea el portapapeles, deja el texto seleccionado para copiarlo manualmente.
            passwordField.select();
            feedback.textContent = 'No se pudo copiar automáticamente. Copia el texto seleccionado.';
        }
    });

    // El usuario continúa al perfil cuando ya haya guardado su contraseña.
    document.getElementById('continue-btn').addEventListener('click', () => {
        window.location.href = '/dashboard';
    });
    </script>

</body>
</html>