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
            <div class="tutor-header-actions">
                <a class="tutor-profile-link" href="/dashboard">Mi perfil</a>
                <button id="tutor-logout-button" class="tutor-logout-button" type="button">Cerrar sesión</button>
            </div>
        </header>

        <div class="tutor-dashboard-layout">
            <aside class="tutor-sidebar">
                <p class="tutor-section-label">MI ESPACIO</p>
                <nav aria-label="Navegación del panel de tutor">
                    <a class="tutor-nav-link is-active" href="#resumen">Resumen</a>
                    <a class="tutor-nav-link" href="#perfil-tutor">Mi perfil tutor</a>
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
                            <strong>—</strong>
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
                            <small>Las solicitudes aparecerán aquí cuando esté disponible la API.</small>
                        </span>
                    </a>
                    <a class="tutor-action-card" href="#perfil-tutor">
                        <span class="tutor-action-icon tutor-action-icon-blue" aria-hidden="true">✎</span>
                        <span>
                            <strong>Actualizar perfil y materias</strong>
                            <small>Próximamente podrás editar tu biografía y materias.</small>
                        </span>
                    </a>
                </section>

                <section id="perfil-tutor" class="tutor-content-section">
                    <div>
                        <p class="tutor-section-label">TU OFERTA</p>
                        <h2>Mi perfil tutor</h2>
                    </div>
                    <p>La gestión de biografía, materias y habilidades estará disponible cuando se implemente el API de perfil de tutor.</p>
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
                        <p class="tutor-section-label">PENDIENTES</p>
                        <h2>Solicitudes</h2>
                    </div>
                    <p>Las solicitudes de tutoría se mostrarán aquí cuando esté implementado el API correspondiente.</p>
                </section>

                <section id="sesiones" class="tutor-content-section">
                    <div>
                        <p class="tutor-section-label">SEGUIMIENTO</p>
                        <h2>Mis sesiones</h2>
                    </div>
                    <p>Las sesiones aceptadas y completadas aparecerán aquí cuando se implemente su gestión en el API.</p>
                </section>
            </div>
        </div>
    </main>
</body>
</html>
