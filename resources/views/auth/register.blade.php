<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario - Tutorías UAS</title>
    @vite('resources/css/registerblade.css')
    @vite('resources/js/registerblade.js')
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

            <div id="success-container" class="success-list" style="display: none;">
                <p>¡Cuenta creada! Inicia sesión con la contraseña que elegiste.</p>
                <button type="button" id="continue-btn">Continuar al perfil</button>
            </div>

            <form id="register-form" data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}">
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

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Crea una contraseña" required>
                </div>

                <button type="submit">Crear cuenta</button>
            </form>

            <div class="links">
                <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></p>
            </div>
        </section>
    </main>


</body>
</html>