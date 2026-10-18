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
            <div class="dashboard-header-actions">
                <a class="logout-button dashboard-panel-link" href="/panel">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M10 5H5v14h5M13 16l4-4-4-4m4 4H9" />
                    </svg>
                    <span>Volver al panel</span>
                </a>
                <button id="logout-btn" class="logout-button" type="button">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M10 5H5v14h5m4-4 4-3-4-3m4 3H9m8-8h3v16h-3" />
                    </svg>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </header>

        <div class="dashboard-grid">
            <section class="user-card" aria-labelledby="profile-title">
                <p class="card-eyebrow">TU CUENTA</p>
                <h2 id="profile-title">Información de perfil</h2>
                <div class="avatar-section">
                    <div class="avatar-frame">
                        <span id="avatar-fallback" class="avatar-fallback" aria-hidden="true">
                            <svg viewBox="0 0 48 48" focusable="false">
                                <path d="M24 24a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 4c-9.2 0-16 4.7-16 10.5V42h32v-3.5C40 32.7 33.2 28 24 28Z" />
                            </svg>
                        </span>
                        <img id="user-avatar" class="user-avatar" alt="Fotografía de perfil" hidden>
                    </div>
                    <div class="avatar-controls">
                        <div class="avatar-actions">
                            <label class="avatar-button" for="avatar-input">
                                <svg aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" />
                                </svg>
                                <span>Subir fotografía</span>
                            </label>
                            <input
                                id="avatar-input"
                                class="avatar-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                aria-describedby="avatar-help avatar-message"
                            >
                            <button id="remove-avatar-btn" class="avatar-remove-button" type="button" hidden>
                                <svg aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
                                </svg>
                                <span>Eliminar fotografía</span>
                            </button>
                        </div>
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
                    <button type="submit" class="update-button">
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M6 10h12v10H6zM9 10V7a3 3 0 0 1 6 0v3m-3 4v2" />
                        </svg>
                        <span>Actualizar contraseña</span>
                    </button>
                </form>
            </section>
        </div>
    </main>


</body>
</html>