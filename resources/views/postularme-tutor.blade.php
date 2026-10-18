<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Postulación a tutor - Tutorías UAS</title>
    @vite('resources/css/panel-estudiante.css')
    @vite('resources/js/postularme-tutor.js')
</head>
<body>
    <p id="tutor-application-page-status" class="panel-status" role="status">Verificando tu cuenta...</p>

    <main
        id="tutor-application-page"
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
            <p class="student-section-label">COMPARTE TUS CONOCIMIENTOS</p>
            <h1>Postulación para ser tutor</h1>
            <p class="student-request-intro">
                Envía tu kardex académico, selecciona las materias de tu carrera que quieres asesorar y cuéntanos qué temas dominas.
                Tu cuenta seguirá siendo de estudiante hasta que tu postulación sea aprobada.
            </p>

            <p id="tutor-application-status" class="student-inline-status" role="status" aria-live="polite">
                Consultando el estado de tu postulación...
            </p>
            <form id="tutor-application-form" class="student-request-form" enctype="multipart/form-data" hidden>
                <fieldset class="student-application-subjects">
                    <legend>Materias que quieres asesorar</legend>
                    <p>Las materias corresponden al plan de estudios de tu carrera y están agrupadas por semestre.</p>
                    <div id="tutor-application-subject-options" class="student-subject-options"></div>
                </fieldset>
                <label>
                    ¿Qué temas dominas? <span>(máximo 1,000 caracteres)</span>
                    <textarea name="temas_dominados" rows="4" maxlength="1000" required placeholder="Describe los temas en los que puedes apoyar a otros estudiantes."></textarea>
                </label>
                <label>
                    Kardex académico (PDF, JPG o PNG; máximo 10 MB)
                    <input name="kardex" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required>
                </label>
                <button id="tutor-application-submit" type="submit">Enviar postulación al administrador</button>
            </form>
        </section>
    </main>
</body>
</html>
