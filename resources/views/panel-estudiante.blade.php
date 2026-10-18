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

    <!-- Mensaje de acceso denegado para usuarios no estudiantes -->
    <section id="role-unavailable" class="access-message" aria-live="polite" hidden>
        <h1>Este panel es exclusivo para estudiantes</h1>
        <p>Tu cuenta no tiene acceso al panel de estudiante.</p>
    </section>


    <main
        id="student-panel"
        class="panel-page"
        data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}"
        hidden
    >
        <!-- Contenido del panel de estudiante -->
        <header class="panel-header">
            <a class="student-brand" href="#resumen" aria-label="Panel de estudiante UAS">
                <span class="student-brand-mark" aria-hidden="true">E</span>
                <span>
                    <span class="panel-eyebrow">PANEL DE</span>
                    <strong>Estudiante</strong>
                </span>
                <span class="student-brand-university">UAS</span>
            </a>
        </header>

        <div class="student-dashboard-layout">
            <aside class="student-sidebar">
                <p class="student-section-label">MI ESPACIO</p>
                <nav aria-label="Navegación del panel de estudiante">
                    <a class="student-nav-link is-active" href="#resumen">Resumen</a>
                    <a class="student-nav-link" href="/panel/solicitar-sesion">Solicitar sesión</a>
                    <a class="student-nav-link" href="#mis-tutorias">Mis tutorías</a>
                    <a class="student-nav-link" href="/panel/postularme-tutor">Postularme como tutor</a>
                    <a class="student-nav-link" href="/dashboard">Mi perfil</a>
                </nav>
                <button id="student-logout-sidebar" class="student-nav-logout" type="button">Cerrar sesión</button>
            </aside>

            <div class="student-dashboard-content">
                <section id="resumen" class="student-welcome-card">
                    <p class="student-section-label">BIENVENIDO<span id="student-name"></span></p>
                    <h1>Encuentra apoyo académico</h1>
                    <p>Elige una materia, un tutor y el horario que quieres proponer para tu sesión.</p>
                </section>

                <section id="mis-tutorias" class="student-quick-actions" aria-labelledby="tutoring-actions-title">
                    <p class="student-section-label">MIS TUTORÍAS</p>
                    <h2 id="tutoring-actions-title">Da seguimiento a tu aprendizaje</h2>

                    <a class="student-action-card" href="/panel/solicitar-sesion">
                        <span class="student-action-icon" aria-hidden="true">+</span>
                        <span>
                            <strong>Solicitar una sesión</strong>
                            <small>Elige una materia, un tutor y el horario que te gustaría solicitar.</small>
                        </span>
                    </a>
                    <a class="student-action-card" href="#solicitudes">
                        <span class="student-action-icon student-action-icon-muted" aria-hidden="true">↗</span>
                        <span>
                            <strong>Revisar mis solicitudes</strong>
                            <small>Consulta las respuestas y el estado de tus solicitudes.</small>
                        </span>
                    </a>
                    <a class="student-action-card" href="#calificaciones">
                        <span class="student-action-icon student-action-icon-warm" aria-hidden="true">★</span>
                        <span>
                            <strong>Calificar una tutoría</strong>
                            <small>Podrás evaluar una sesión después de que se complete.</small>
                        </span>
                    </a>
                    <a class="student-action-card" href="/panel/postularme-tutor">
                        <span class="student-action-icon student-action-icon-muted" aria-hidden="true">↗</span>
                        <span>
                            <strong>Postularme como tutor</strong>
                            <small>Envía tu kardex al administrador para que revise tu postulación.</small>
                        </span>
                    </a>
                </section>

                <section id="solicitudes" class="student-content-section">
                    <div>
                        <p class="student-section-label">SEGUIMIENTO</p>
                        <h2>Mis solicitudes de tutoría</h2>
                    </div>
                    <p id="student-requests-status" class="student-inline-status" role="status" aria-live="polite">Cargando solicitudes...</p>
                    <div id="student-request-list" class="student-request-list"></div>
                </section>

                <section id="calificaciones" class="student-content-section">
                    <div>
                        <p class="student-section-label">TU EXPERIENCIA</p>
                        <h2>Calificar una tutoría</h2>
                    </div>
                    <p id="student-ratings-status" class="student-inline-status" role="status" aria-live="polite">Cargando tutorías completadas...</p>
                    <div id="student-rating-list" class="student-request-list"></div>
                </section>

            </div>
        </div>
    </main>
</body>
</html>
