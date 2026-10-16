<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Principal - Tutorías UAS</title>
    @vite('resources/css/dashboardblade.css')
    @vite('resources/js/dashboardblade.js')
</head>
<body>

    <main class="dashboard-page" data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}">
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
                        <label class="avatar-button" for="avatar-input">Subir fotografía</label>
                        <input
                            id="avatar-input"
                            class="avatar-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            aria-describedby="avatar-help avatar-message"
                        >
                        <button id="remove-avatar-btn" class="avatar-remove-button" type="button" hidden>
                            Eliminar fotografía
                        </button>
                        <p id="avatar-help" class="avatar-help">JPG, PNG o WebP · máximo 5 MB</p>
                        <p id="avatar-message" class="avatar-message" role="status" aria-live="polite">
                            Puedes cambiar o eliminar tu fotografía cuando quieras.
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


</body>
</html>