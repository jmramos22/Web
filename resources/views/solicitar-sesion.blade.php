<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitar sesión - Tutorías UAS</title>
    @vite('resources/css/panel-estudiante.css')
    @vite('resources/js/solicitar-sesion.js')
</head>
<body>
    <p id="session-page-status" class="panel-status" role="status">Verificando tu cuenta...</p>

    <main
        id="session-request-page"
        class="panel-page"
        data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}"
        hidden
    >
        <header class="panel-header">
            <a class="student-brand" href="/panel" aria-label="Volver al panel de estudiante">
                <span class="student-brand-mark" aria-hidden="true">E</span>
                <span>
                    <span class="panel-eyebrow">PANEL DE</span>
                    <strong>Estudiante</strong>
                </span>
                <span class="student-brand-university">UAS</span>
            </a>
        </header>

        <section class="student-content-section student-session-page">
            <a class="student-back-link" href="/panel">← Volver al panel</a>
            <p class="student-section-label">NUEVA SOLICITUD</p>
            <h1>Solicitar una sesión de tutoría</h1>
            <p class="student-request-intro">Filtra las materias por semestre, elige un tutor y selecciona uno de sus horarios libres (hora local de Mazatlán). El horario quedará reservado mientras el tutor responde a tu solicitud.</p>

            <form id="session-request-form" class="student-request-form">
                <div class="student-request-fields">
                    <label>
                        Semestre
                        <select id="session-semester" required disabled>
                            <option value="">Cargando semestres...</option>
                        </select>
                    </label>
                    <label>
                        Materia
                        <select id="session-subject" name="materia_id" required>
                            <option value="">Primero selecciona un semestre</option>
                        </select>
                    </label>
                    <label>
                        Tutor
                        <select id="session-tutor" required>
                            <option value="">Cargando tutores...</option>
                        </select>
                    </label>
                    <label>
                        Horario disponible
                        <select id="session-availability" name="disponibilidad_id" required disabled>
                            <option value="">Primero selecciona un tutor</option>
                        </select>
                    </label>
                </div>
                <p id="session-availability-status" class="student-inline-status" role="status" aria-live="polite" hidden></p>
                <label class="student-request-message">
                    Mensaje para el tutor <span>(opcional)</span>
                    <textarea name="mensaje" rows="4" maxlength="1000" placeholder="Cuéntale brevemente qué tema necesitas repasar."></textarea>
                </label>
                <div class="student-request-submit-row">
                    <button id="session-submit" type="submit" disabled>Enviar solicitud</button>
                    <p id="session-form-status" class="student-inline-status" role="status" aria-live="polite" hidden></p>
                </div>
            </form>
        </section>
    </main>
</body>
</html>
