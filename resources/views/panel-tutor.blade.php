<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de tutor - Tutorías UAS</title>
    @vite('resources/css/panel-tutor.css')
    @vite('resources/js/panel-tutor.js')
</head>
<body>
    <p id="tutor-panel-status" class="tutor-panel-status" role="status">Verificando tu cuenta...</p>

    <section id="tutor-access-unavailable" class="tutor-access-message" aria-live="polite" hidden>
        <h1>Este panel es exclusivo para tutores</h1>
        <p>Tu cuenta no tiene acceso al panel de tutor.</p>
        <a class="tutor-profile-link" href="/dashboard">Volver a mi perfil</a>
    </section>

    <main id="tutor-panel" class="tutor-panel-page" data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}" hidden>
        <header class="tutor-panel-header">
            <a class="tutor-brand" href="/panel/tutor" aria-label="Panel de tutor UAS">
                <span class="tutor-brand-mark" aria-hidden="true">T</span>
                <span>
                    <span class="tutor-brand-eyebrow">PANEL DE</span>
                    <strong>Tutor</strong>
                </span>
                <span class="tutor-brand-university">UAS</span>
            </a>
            
        </header>

        <div class="tutor-dashboard-layout">
            <aside class="tutor-sidebar">
                <p class="tutor-section-label">MI ESPACIO</p>
                <nav aria-label="Navegación del panel de tutor">
                    <a class="tutor-nav-link is-active" href="#resumen">Resumen</a>
                    <a class="tutor-nav-link" href="/dashboard">Mi perfil tutor</a>
                    <a class="tutor-nav-link" href="#disponibilidad">Disponibilidad</a>
                    <a class="tutor-nav-link" href="#solicitudes">Solicitudes</a>
                    <a class="tutor-nav-link" href="#sesiones">Mis sesiones</a>
                </nav>
                <button id="tutor-logout-sidebar" class="tutor-nav-logout" type="button">Cerrar sesión</button>
            </aside>

            <div class="tutor-dashboard-content">
                <section id="resumen" class="tutor-welcome-card">
                    <p class="tutor-section-label">PANEL DEL TUTOR</p>
                    <h1>Comparte lo que sabes<span id="tutor-name"></span></h1>
                    <p>Administra tu oferta académica y da seguimiento a tus sesiones.</p>

                    <div class="tutor-metrics" aria-label="Resumen de actividad">
                        <article class="tutor-metric">
                            <strong>—</strong>
                            <span>Horarios libres</span>
                        </article>
                        <article class="tutor-metric">
                            <strong id="tutor-open-requests-count">0</strong>
                            <span>Solicitudes</span>
                        </article>
                    </div>
                </section>

                <section class="tutor-quick-actions" aria-labelledby="quick-actions-title">
                    <h2 id="quick-actions-title">Gestión rápida</h2>
                    <a class="tutor-action-card" href="#disponibilidad">
                        <span class="tutor-action-icon" aria-hidden="true">+</span>
                        <span>
                            <strong>Publicar disponibilidad</strong>
                            <small>Próximamente podrás crear bloques para tus tutorías.</small>
                        </span>
                    </a>
                    <a class="tutor-action-card" href="#solicitudes">
                        <span class="tutor-action-icon tutor-action-icon-warm" aria-hidden="true">✓</span>
                        <span>
                            <strong>Atender solicitudes</strong>
                            <small>Revisa las solicitudes y responde a tus estudiantes.</small>
                        </span>
                    </a>
                    <a class="tutor-action-card" href="#perfil-tutor">
                        <span class="tutor-action-icon tutor-action-icon-blue" aria-hidden="true">✎</span>
                        <span>
                            <strong>Consultar mi carrera y materias</strong>
                            <small>Revisa el plan de estudios de la carrera en la que estás registrado.</small>
                        </span>
                    </a>
                </section>

                <section id="perfil-tutor" class="tutor-content-section">
                    <div>
                        <p class="tutor-section-label">TU OFERTA</p>
                        <h2>Mi perfil tutor</h2>
                    </div>
                    <p id="tutor-curriculum-status" class="tutor-inline-status" role="status" aria-live="polite">Cargando tu plan de estudios...</p>
                    <div id="tutor-curriculum" class="tutor-curriculum"></div>
                </section>

                <section id="disponibilidad" class="tutor-content-section">
                    <div>
                        <p class="tutor-section-label">HORARIOS</p>
                        <h2>Disponibilidad</h2>
                    </div>
                    <p>Aún no hay horarios para mostrar. La publicación y consulta de disponibilidad requiere endpoints que todavía no están implementados.</p>
                </section>

                <section id="solicitudes" class="tutor-content-section">
                    <div>
                        <p class="tutor-section-label">SOLICITUDES RECIBIDAS</p>
                        <h2>Solicitudes</h2>
                    </div>
                    <p id="tutor-requests-status" class="tutor-inline-status" role="status" aria-live="polite">Cargando solicitudes...</p>
                    <div id="tutor-request-list" class="tutor-request-list"></div>
                </section>

                <section id="sesiones" class="tutor-content-section">
                    <div>
                        <p class="tutor-section-label">SEGUIMIENTO</p>
                        <h2>Sesiones confirmadas</h2>
                    </div>
                    <p id="tutor-sessions-status" class="tutor-inline-status" role="status" aria-live="polite">Cargando sesiones...</p>
                    <div id="tutor-session-list" class="tutor-request-list"></div>
                </section>
            </div>
        </div>
    </main>
</body>
</html>
