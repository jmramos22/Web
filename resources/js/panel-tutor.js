const token = localStorage.getItem('auth_token');
const panel = document.getElementById('tutor-panel');
const apiBaseUrl = panel.dataset.apiBaseUrl;
const status = document.getElementById('tutor-panel-status');
const accessUnavailable = document.getElementById('tutor-access-unavailable');

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

            if (user.rol === 'ESTUDIANTE') {
                window.location.replace('/panel');
                return;
            }

            if (user.rol !== 'TUTOR') {
                status.hidden = true;
                accessUnavailable.hidden = false;
                return;
            }

            document.getElementById('tutor-name').textContent = user.nombre ? `, ${user.nombre}` : '';
            status.hidden = true;
            panel.hidden = false;
        } catch (error) {
            console.error('Error al validar el rol del tutor:', error);
            status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
        }
    })();
}

async function logoutTutor() {
    const buttons = [
        document.getElementById('tutor-logout-button'),
        document.getElementById('tutor-logout-sidebar'),
    ];

    buttons.forEach((button) => {
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

document.getElementById('tutor-logout-button').addEventListener('click', logoutTutor);
document.getElementById('tutor-logout-sidebar').addEventListener('click', logoutTutor);
