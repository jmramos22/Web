<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Tutorías UAS</title>
    @vite('resources/css/loginblade.css')
    @vite('resources/js/loginblade.js')

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

            <form id="login-form" data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}">
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

</body>
</html>