const token = localStorage.getItem('auth_token');
const panel = document.getElementById('tutor-panel');
const apiBaseUrl = panel.dataset.apiBaseUrl;
const status = document.getElementById('tutor-panel-status');
const accessUnavailable = document.getElementById('tutor-access-unavailable');
const tutorRequestList = document.getElementById('tutor-request-list');
const tutorRequestsStatus = document.getElementById('tutor-requests-status');
const tutorSessionList = document.getElementById('tutor-session-list');
const tutorSessionsStatus = document.getElementById('tutor-sessions-status');
const openRequestsCount = document.getElementById('tutor-open-requests-count');
const tutorCurriculum = document.getElementById('tutor-curriculum');
const tutorCurriculumStatus = document.getElementById('tutor-curriculum-status');

const requestStatusLabels = {
    PENDIENTE: 'Pendiente',
    ACEPTADA: 'Aceptada',
    RECHAZADA: 'Rechazada',
    CANCELADA: 'Cancelada',
    COMPLETADA: 'Completada',
};

/**
 * Crea una tarjeta con la información que el tutor necesita para responder.
 */
function createTutorRequestCard(request) {
    const card = document.createElement('article');
    card.className = 'tutor-request-card';

    const heading = document.createElement('div');
    heading.className = 'tutor-request-heading';

    const subject = document.createElement('h3');
    subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';

    const badge = document.createElement('span');
    badge.className = `tutor-request-status status-${request.estado.toLowerCase()}`;
    badge.textContent = requestStatusLabels[request.estado] || request.estado;
    heading.append(subject, badge);

    const student = document.createElement('p');
    student.textContent = `Estudiante: ${request.estudiante?.nombre || ''} ${request.estudiante?.apellido || ''}`.trim();

    const date = document.createElement('p');
    date.textContent = `Fecha solicitada: ${new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(request.fecha_hora))}`;

    card.append(heading, student, date);

    if (request.mensaje) {
        const message = document.createElement('p');
        message.textContent = `Mensaje: ${request.mensaje}`;
        card.appendChild(message);
    }

    if (request.estado === 'PENDIENTE') {
        const actions = document.createElement('div');
        actions.className = 'tutor-request-actions';
        actions.append(
            createRequestAction(request.id, 'ACEPTADA', 'Aceptar', 'tutor-request-accept'),
            createRequestAction(request.id, 'RECHAZADA', 'Rechazar', 'tutor-request-reject'),
        );
        card.appendChild(actions);
    } else if (request.estado === 'ACEPTADA') {
        const actions = document.createElement('div');
        actions.className = 'tutor-request-actions';
        actions.append(
            createRequestAction(request.id, 'COMPLETADA', 'Marcar como completada', 'tutor-request-complete'),
        );
        card.appendChild(actions);
    }

    return card;
}

/**
 * Construye un botón que identifica el estado al que debe cambiar la solicitud.
 */
function createRequestAction(requestId, nextStatus, label, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.requestId = requestId;
    button.dataset.nextStatus = nextStatus;
    button.textContent = label;

    return button;
}

async function loadTutorCurriculum() {
    tutorCurriculumStatus.textContent = 'Cargando tu plan de estudios...';
    tutorCurriculum.replaceChildren();

    try {
        const response = await fetch(`${apiBaseUrl}/api/tutoring/profile`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.replace('/login');
            return;
        }
        if (!response.ok) {
            throw new Error(data.message || 'No se pudo cargar tu plan de estudios.');
        }

        tutorCurriculumStatus.textContent = `Carrera: ${data.carrera.nombre}. Revisa las materias que ofreces y el plan de estudios de tu carrera.`;

        const topics = document.createElement('section');
        topics.className = 'tutor-offer-topics';
        const topicsHeading = document.createElement('h3');
        topicsHeading.textContent = 'Temas que domino';
        const topicsDescription = document.createElement('p');
        topicsDescription.textContent = data.temas_dominados || 'Aún no has agregado una descripción de los temas que dominas.';
        topics.append(topicsHeading, topicsDescription);
        tutorCurriculum.appendChild(topics);

        const offeredSubjects = document.createElement('section');
        offeredSubjects.className = 'tutor-offered-subjects';
        const offeredHeading = document.createElement('h3');
        offeredHeading.textContent = 'Materias que ofrezco';
        offeredSubjects.appendChild(offeredHeading);

        if (data.materias_ofrecidas.length) {
            const offeredList = document.createElement('ul');
            data.materias_ofrecidas.forEach((subject) => {
                const item = document.createElement('li');
                item.textContent = `Semestre ${subject.semestre}: ${subject.nombre}`;
                offeredList.appendChild(item);
            });
            offeredSubjects.appendChild(offeredList);
        } else {
            const emptyOffer = document.createElement('p');
            emptyOffer.textContent = 'No hay materias seleccionadas en tu postulación.';
            offeredSubjects.appendChild(emptyOffer);
        }
        tutorCurriculum.appendChild(offeredSubjects);

        if (!data.semestres.length) {
            const emptyPlan = document.createElement('p');
            emptyPlan.textContent = `El plan de estudios de ${data.carrera.nombre} aún no está disponible.`;
            tutorCurriculum.appendChild(emptyPlan);
            return;
        }

        data.semestres.forEach((semester) => {
            const section = document.createElement('section');
            section.className = 'tutor-semester';

            const heading = document.createElement('h3');
            heading.textContent = `Semestre ${semester.numero}`;

            const subjects = document.createElement('ul');
            semester.materias.forEach((subject) => {
                const item = document.createElement('li');
                item.textContent = subject.nombre;
                subjects.appendChild(item);
            });

            section.append(heading, subjects);
            tutorCurriculum.appendChild(section);
        });
    } catch (error) {
        tutorCurriculumStatus.textContent = error.message;
    }
}

/**
 * Carga las solicitudes asignadas al tutor y actualiza el contador de pendientes.
 */
async function loadTutorRequests() {
    tutorRequestsStatus.textContent = 'Cargando solicitudes...';
    tutorRequestsStatus.hidden = false;
    tutorRequestList.replaceChildren();
    tutorSessionsStatus.textContent = 'Cargando sesiones...';
    tutorSessionsStatus.hidden = false;
    tutorSessionList.replaceChildren();

    try {
        const response = await fetch(`${apiBaseUrl}/api/tutoring/requests`, {
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

        const requests = await response.json();
        if (!response.ok) {
            throw new Error(requests.message || 'No se pudieron cargar las solicitudes.');
        }

        openRequestsCount.textContent = requests
            .filter((request) => request.estado === 'PENDIENTE')
            .length.toString();

        if (requests.length === 0) {
            tutorRequestsStatus.textContent = 'Todavía no tienes solicitudes de tutoría.';
            tutorSessionsStatus.textContent = 'Aún no tienes sesiones confirmadas.';
            return;
        }

        tutorRequestsStatus.hidden = true;
        requests.forEach((request) => {
            tutorRequestList.appendChild(createTutorRequestCard(request));
        });

        const sessions = requests.filter((request) => (
            request.estado === 'ACEPTADA' || request.estado === 'COMPLETADA'
        ));
        if (sessions.length === 0) {
            tutorSessionsStatus.textContent = 'Aún no tienes sesiones confirmadas.';
            return;
        }

        tutorSessionsStatus.hidden = true;
        sessions.forEach((request) => {
            tutorSessionList.appendChild(createTutorRequestCard(request));
        });
    } catch (error) {
        tutorRequestsStatus.textContent = error.message;
        tutorSessionsStatus.textContent = error.message;
    }
}

/**
 * Envía al servidor la decisión del tutor y vuelve a cargar la lista actualizada.
 */
async function updateTutorRequest(requestId, nextStatus, actionButton) {
    const actionLabels = {
        ACEPTADA: 'aceptar',
        RECHAZADA: 'rechazar',
        COMPLETADA: 'marcar como completada',
    };

    if (!window.confirm(`¿Quieres ${actionLabels[nextStatus]} esta solicitud?`)) {
        return;
    }

    actionButton.disabled = true;

    try {
        const response = await fetch(`${apiBaseUrl}/api/tutoring/requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ estado: nextStatus }),
        });
        const result = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.replace('/login');
            return;
        }

        if (!response.ok) {
            throw new Error(result.message || 'No se pudo actualizar la solicitud.');
        }

        await loadTutorRequests();
    } catch (error) {
        tutorRequestsStatus.hidden = false;
        tutorRequestsStatus.textContent = error.message;
    } finally {
        if (actionButton?.isConnected) {
            actionButton.disabled = false;
        }
    }
}

// Delega las acciones de respuesta para todas las tarjetas de solicitudes.
tutorRequestList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-next-status]');
    if (actionButton) {
        updateTutorRequest(
            actionButton.dataset.requestId,
            actionButton.dataset.nextStatus,
            actionButton
        );
    }
});

if (!token) {
    window.location.replace('/login');
} else {
    // Comprueba la sesión y el rol antes de mostrar el panel exclusivo para tutores.
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
            await Promise.all([loadTutorRequests(), loadTutorCurriculum()]);
        } catch (error) {
            console.error('Error al validar el rol del tutor:', error);
            status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
        }
    })();
}

// Cierra la sesión en la API y elimina el token local antes de volver al inicio de sesión.
async function logoutTutor() {
    const buttons = [document.getElementById('tutor-logout-sidebar')];

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

document.getElementById('tutor-logout-sidebar').addEventListener('click', logoutTutor);
