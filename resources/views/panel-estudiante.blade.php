<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de estudiante - Tutorías UAS</title>
    @vite('resources/css/panel-estudiante.css')
    @vite('resources/js/panel-estudianteblade.js')
</head>
<body>
    <p id="panel-status" class="panel-status" role="status">Verificando tu cuenta...</p>

    <section id="role-unavailable" class="access-message" aria-live="polite" hidden>
        <h1>Este panel es exclusivo para estudiantes</h1>
        <p>Tu cuenta no tiene acceso al panel de estudiante.</p>
        <a class="profile-link" href="/dashboard">Volver a mi perfil</a>
    </section>

    <main
        id="student-panel"
        class="panel-page"
        data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}"
        hidden
    >
        <header class="panel-header">
            <a class="student-brand" href="/panel" aria-label="Panel de estudiante UAS">
                <span class="student-brand-mark" aria-hidden="true">E</span>
                <span>
                    <span class="panel-eyebrow">PANEL DE</span>
                    <strong>Estudiante</strong>
                </span>
                <span class="student-brand-university">UAS</span>
            </a>
            <div class="panel-header-actions">
                <a class="profile-link" href="/dashboard">Mi perfil</a>
                <button id="student-logout-button" class="student-logout-button" type="button">Cerrar sesión</button>
            </div>
        </header>

        <div class="student-dashboard-layout">
            <aside class="student-sidebar">
                <p class="student-section-label">MI ESPACIO</p>
                <nav aria-label="Navegación del panel de estudiante">
                    <a class="student-nav-link is-active" href="#resumen">Resumen</a>
                    <a class="student-nav-link" href="#buscar-tutores">Buscar tutor</a>
                    <a class="student-nav-link" href="#mis-tutorias">Mis tutorías</a>
                    <a class="student-nav-link" href="/dashboard">Mi perfil</a>
                </nav>
                <button id="student-logout-sidebar" class="student-nav-logout" type="button">Cerrar sesión</button>
            </aside>

            <div class="student-dashboard-content">
                <section id="resumen" class="student-welcome-card">
                    <p class="student-section-label">BIENVENIDO<span id="student-name"></span></p>
                    <h1>Encuentra apoyo académico</h1>
                    <p>Busca acompañamiento en las materias que necesitas.</p>

                    <form id="tutor-search-form" class="student-search-form">
                        <label class="visually-hidden" for="tutor-search">Buscar tutor por materia</label>
                        <input
                            id="tutor-search"
                            type="search"
                            placeholder="Buscar por materia..."
                            disabled
                            aria-describedby="tutor-search-note"
                        >
                        <button type="submit" disabled>Ver tutores</button>
                    </form>
                    <p id="tutor-search-note" class="student-feature-note">
                        La búsqueda estará disponible cuando se implemente el catálogo de tutores en la API.
                    </p>
                </section>

                <section id="mis-tutorias" class="student-quick-actions" aria-labelledby="tutoring-actions-title">
                    <p class="student-section-label">MIS TUTORÍAS</p>
                    <h2 id="tutoring-actions-title">Da seguimiento a tu aprendizaje</h2>

                    <a class="student-action-card" href="#buscar-tutores">
                        <span class="student-action-icon" aria-hidden="true">+</span>
                        <span>
                            <strong>Solicitar una sesión</strong>
                            <small>Elige materia, tutor y horario disponible cuando esta opción esté habilitada.</small>
                        </span>
                    </a>
                    <a class="student-action-card" href="#solicitudes">
                        <span class="student-action-icon student-action-icon-muted" aria-hidden="true">↗</span>
                        <span>
                            <strong>Revisar mis solicitudes</strong>
                            <small>Consulta estados y cancelaciones cuando la API de tutorías esté disponible.</small>
                        </span>
                    </a>
                    <a class="student-action-card" href="#calificaciones">
                        <span class="student-action-icon student-action-icon-warm" aria-hidden="true">★</span>
                        <span>
                            <strong>Calificar una tutoría</strong>
                            <small>Podrás evaluar una sesión después de que se complete.</small>
                        </span>
                    </a>
                </section>

                <section id="buscar-tutores" class="student-content-section">
                    <div>
                        <p class="student-section-label">ENCUENTRA APOYO</p>
                        <h2>Buscar tutor</h2>
                    </div>
                    <p>La búsqueda de tutores por materia, calificación y disponibilidad aún no tiene un endpoint en la API.</p>
                </section>

                <section id="solicitudes" class="student-content-section">
                    <div>
                        <p class="student-section-label">SEGUIMIENTO</p>
                        <h2>Mis solicitudes y sesiones</h2>
                    </div>
                    <p>Tus solicitudes y sesiones aparecerán aquí cuando se implemente su consulta en la API.</p>
                </section>

                <section id="calificaciones" class="student-content-section">
                    <div>
                        <p class="student-section-label">TU EXPERIENCIA</p>
                        <h2>Calificaciones</h2>
                    </div>
                    <p>La calificación de tutorías se habilitará cuando existan endpoints para sesiones completadas y reseñas.</p>
                </section>

                <section class="student-profile-callout">
                    <div>
                        <p class="student-section-label">TU PERFIL</p>
                        <h2>Mantén actualizada tu información</h2>
                        <p>Consulta tu perfil y administra la fotografía y seguridad de tu cuenta.</p>
                    </div>
                    <a class="student-profile-cta" href="/dashboard">Ir a mi perfil</a>
                </section>
            </div>
        </div>
    </main>
</body>
</html>
