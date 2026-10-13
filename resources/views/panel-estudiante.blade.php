<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de estudiante - Tutorías UAS</title>
    @vite('resources/css/panel-estudiante.css')
</head>
<body>
    <p id="panel-status" class="panel-status" role="status">Verificando tu cuenta...</p>

    <section id="role-unavailable" class="access-message" aria-live="polite" hidden>
        <h1>Este panel todavía no está disponible</h1>
        <p>El panel actual es exclusivo para estudiantes. Estamos trabajando en los paneles de los demás roles.</p>
        <a class="profile-link" href="/dashboard">Ir a mi perfil</a>
    </section>

    <main id="student-panel" class="panel-page" hidden>
        <header class="panel-header">
            <div>
                <p class="panel-eyebrow">UNIVERSIDAD AUTÓNOMA DE SINALOA</p>
                <h1>Panel de estudiante</h1>
                <p>Encuentra apoyo académico y administra tus tutorías.</p>
            </div>

            <a class="profile-link" href="/dashboard" aria-label="Ir a mi perfil">
                Mi perfil
            </a>
        </header>

        <nav class="panel-nav" aria-label="Navegación del panel">
            <a href="#resumen">Resumen</a>
            <a href="#buscar-tutores">Buscar tutores</a>
            <a href="#mis-tutorias">Mis tutorías</a>
        </nav>

        <section id="resumen" class="panel-section">
            <h2>Resumen</h2>
            <p>Desde aquí podrás encontrar tutores y dar seguimiento a tus solicitudes.</p>
        </section>

        <section id="buscar-tutores" class="panel-section">
            <h2>Buscar tutores</h2>
            <p>La búsqueda por materia y disponibilidad se conectará cuando esté lista la API.</p>
        </section>

        <section id="mis-tutorias" class="panel-section">
            <h2>Mis tutorías</h2>
            <p>Aquí aparecerán tus solicitudes y sesiones.</p>
        </section>
    </main>

    <script>
        const token = localStorage.getItem('auth_token');
        const panel = document.getElementById('student-panel');
        const status = document.getElementById('panel-status');
        const roleUnavailable = document.getElementById('role-unavailable');

        if (!token) {
            window.location.replace('/login');
        } else {
            (async () => {
                try {
                    const response = await fetch('http://127.0.0.1:8001/api/user', {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.replace('/login');
                        return;
                    }

                    if (!response.ok) {
                        throw new Error(`No se pudo validar la cuenta (HTTP ${response.status}).`);
                    }

                    const user = await response.json();
                    status.hidden = true;

                    if (user.rol !== 'ESTUDIANTE') {
                        roleUnavailable.hidden = false;
                        return;
                    }

                    panel.hidden = false;
                } catch (error) {
                    console.error('Error al validar el rol del usuario:', error);
                    status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
                }
            })();
        }
    </script>
</body>
</html>