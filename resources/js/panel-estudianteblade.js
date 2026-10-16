const token = localStorage.getItem('auth_token');
const panel = document.getElementById('student-panel');
const apiBaseUrl = panel.dataset.apiBaseUrl;
const status = document.getElementById('panel-status');
const roleUnavailable = document.getElementById('role-unavailable');
const logoutButtons = [
    document.getElementById('student-logout-button'),
    document.getElementById('student-logout-sidebar'),
];

async function logoutStudent() {
    logoutButtons.forEach((button) => {
        button.disabled = true;
    });

    try {
        const response = await fetch(`${apiBaseUrl}/api/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok && response.status !== 401) {
            throw new Error(`No se pudo cerrar la sesión (HTTP ${response.status}).`);
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
    }
}

logoutButtons.forEach((button) => {
    button.addEventListener('click', logoutStudent);
});

if (!token) {
    window.location.replace('/login');
} else {
    (async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/user`, {
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

            if (user.rol === 'TUTOR') {
                window.location.replace('/panel/tutor');
                return;
            }

            if (user.rol !== 'ESTUDIANTE') {
                roleUnavailable.hidden = false;
                return;
            }

            document.getElementById('student-name').textContent = user.nombre ? `, ${user.nombre}` : '';
            panel.hidden = false;
        } catch (error) {
            console.error('Error al validar el rol del usuario:', error);
            status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
        }
    })();
}
