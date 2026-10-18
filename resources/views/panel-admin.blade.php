<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administrador - UAS</title>
    @vite(['resources/css/panel-admin.css', 'resources/js/panel-admin.js'])
</head>
<body style="display: none;">
    <!-- Menú Lateral -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="avatar">A</div>
            <div class="user-info">
                <span class="role-title">PANEL DE</span>
                <span class="role-name">Administrador</span>
            </div>
            <div class="logo-uas">UAS</div>
        </div>
        <div class="sidebar-menu">
            <p class="menu-label">ADMINISTRACIÓN</p>
            <ul>
                <li><a href="#" class="active" id="nav-usuarios"><span class="icon">●</span> Usuarios y Roles</a></li>
                <li><a href="#" id="nav-carreras"><span class="icon">●</span> Catálogo académico</a></li>
                <li><a href="#" id="nav-solicitudes"><span class="icon">●</span> Solicitudes de Tutoría</a></li>
                <li><a href="#" id="nav-postulaciones"><span class="icon">●</span> Postulaciones a Tutor</a></li>
            </ul>
            <ul>
                <li class="logout-item"><a href="#" id="logout-btn"><span class="icon">●</span> Cerrar sesión</a></li>
            </ul>
        </div>
    </aside>

    <!-- Área Principal -->
    <main id="admin-panel" class="main-content" data-api-base-url="{{ rtrim((string) config('services.api.base_url'), '/') }}">
        
        <!-- SECCIÓN 1: USUARIOS (Visible por defecto) -->
        <section id="section-usuarios">
            <header>
                <h2>GESTIÓN DE ROLES</h2>
                <h1>Usuarios del Sistema</h1>
                <p>Administra los usuarios. Las nuevas cuentas de tutor se habilitan al aprobar una postulación.</p>
            </header>
            <div class="card">
                <p id="admin-users-status" class="admin-inline-status" role="status" aria-live="polite" hidden></p>
                <ul id="lista-usuarios" class="data-list">
                    <!-- Llenado dinámicamente por JS -->
                </ul>
            </div>
        </section>

        <section id="section-postulaciones" style="display: none;">
            <header>
                <h2>REVISIÓN ACADÉMICA</h2>
                <h1>Postulaciones para ser tutor</h1>
                <p>Revisa el kardex, las materias propuestas y los temas que domina la persona; después aprueba o rechaza la solicitud.</p>
            </header>
            <div class="card">
                <p id="admin-tutor-applications-status" role="status" aria-live="polite">Cargando postulaciones...</p>
                <ul id="lista-postulaciones-tutor" class="data-list"></ul>
            </div>
        </section>

        <!-- SECCIÓN 2: CARRERAS/MATERIAS (Oculta por defecto) -->
        <section id="section-carreras" style="display: none;">
            <header>
                <h2>GESTIÓN DEL CATÁLOGO</h2>
                <h1>Carreras, semestres y materias</h1>
                <p>Consulta el plan de estudios disponible para las asesorías.</p>
            </header>
            
            <div class="card add-card">
                <form id="form-carrera" class="career-editor">
                    <div class="career-editor-heading">
                        <h3 id="career-editor-title">Agregar carrera y plan de estudios</h3>
                        <p>Agrega cada semestre y escribe una materia por línea. Puedes dejar el plan vacío y completarlo después.</p>
                    </div>
                    <label class="career-name-field" for="nombre-carrera">Nombre de carrera</label>
                    <input type="text" id="nombre-carrera" placeholder="Nombre de carrera..." required>
                    <div class="career-plan-heading">
                        <strong>Plan de estudios</strong>
                        <button id="add-semester" class="btn-secondary" type="button">+ Agregar semestre</button>
                    </div>
                    <div id="career-semester-editor" class="career-semester-editor"></div>
                    <div class="career-editor-actions">
                        <button id="career-submit" type="submit" class="btn-primary">+ Agregar carrera</button>
                        <button id="career-cancel-edit" type="button" class="btn-secondary" hidden>Cancelar edición</button>
                    </div>
                    <p id="career-editor-status" class="admin-inline-status" role="status" aria-live="polite" hidden></p>
                </form>
            </div>

            <div class="card">
                <p id="admin-careers-status" class="admin-inline-status" role="status" aria-live="polite" hidden></p>
                <ul id="lista-carreras" class="data-list">
                    <!-- Llenado dinámicamente por JS -->
                </ul>
            </div>
        </section>

        <!-- Supervisión administrativa de solicitudes; las decisiones corresponden al tutor. -->
        <section id="section-solicitudes" style="display: none;">
            <header>
                <h2>SEGUIMIENTO ACADÉMICO</h2>
                <h1>Solicitudes de tutoría</h1>
                <p>Consulta las solicitudes y sus estados. La aceptación o rechazo la realiza el tutor asignado.</p>
            </header>
            <div class="card">
                <p id="admin-requests-status" role="status" aria-live="polite">Cargando solicitudes...</p>
                <ul id="lista-solicitudes" class="data-list"></ul>
            </div>
        </section>

    </main>
</body>
</html>