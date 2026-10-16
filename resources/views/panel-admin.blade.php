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
                <li><a href="#" id="nav-carreras"><span class="icon">●</span> Materias de Tutoría</a></li>
            </ul>
            <ul>
                <li class="logout-item"><a href="#" id="logout-btn"><span class="icon">●</span> Cerrar sesión</a></li>
            </ul>
        </div>
    </aside>

    <!-- Área Principal -->
    <main class="main-content">
        
        <!-- SECCIÓN 1: USUARIOS (Visible por defecto) -->
        <section id="section-usuarios">
            <header>
                <h2>GESTIÓN DE ROLES</h2>
                <h1>Usuarios del Sistema</h1>
                <p>Promueve estudiantes a tutores o asigna permisos administrativos.</p>
            </header>
            <div class="card">
                <ul id="lista-usuarios" class="data-list">
                    <!-- Llenado dinámicamente por JS -->
                </ul>
            </div>
        </section>

        <!-- SECCIÓN 2: CARRERAS/MATERIAS (Oculta por defecto) -->
        <section id="section-carreras" style="display: none;">
            <header>
                <h2>GESTIÓN DEL CATÁLOGO</h2>
                <h1>Materias de tutoría</h1>
                <p>Mantén actualizado el catálogo base de carreras/materias.</p>
            </header>
            
            <div class="card add-card">
                <form id="form-carrera">
                    <input type="text" id="nombre-carrera" placeholder="Nombre de la carrera o materia..." required>
                    <button type="submit" class="btn-primary">+ Agregar</button>
                </form>
            </div>

            <div class="card">
                <ul id="lista-carreras" class="data-list">
                    <!-- Llenado dinámicamente por JS -->
                </ul>
            </div>
        </section>

    </main>
</body>
</html>