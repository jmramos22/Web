const token = localStorage.getItem('auth_token');
const panel = document.getElementById('student-panel');
const apiBaseUrl = panel.dataset.apiBaseUrl;
const status = document.getElementById('panel-status');
const roleUnavailable = document.getElementById('role-unavailable');
const requestList = document.getElementById('student-request-list');
const requestsStatus = document.getElementById('student-requests-status');
const ratingList = document.getElementById('student-rating-list');
const ratingsStatus = document.getElementById('student-ratings-status');
const logoutButtons = [
    document.getElementById('student-logout-sidebar'),
];

const requestStatusLabels = {
    PENDIENTE: 'Pendiente',
    ACEPTADA: 'Aceptada',
    RECHAZADA: 'Rechazada',
    CANCELADA: 'Cancelada',
    COMPLETADA: 'Completada',
};

/**
 * Envía solicitudes autenticadas y convierte respuestas HTTP fallidas en errores visibles.
 */
async function studentApiRequest(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.body && !(options.body instanceof FormData)
                ? { 'Content-Type': 'application/json' }
                : {}),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    if (!response.ok) {
        const validationMessage = data.errors
            ? Object.values(data.errors).flat().join(' ')
            : '';
        throw new Error(validationMessage || data.message || 'No se pudo completar la solicitud.');
    }

    return data;
}

/**
 * Crea una tarjeta de solicitud usando texto seguro en lugar de insertar HTML de la API.
 */
function createStudentRequestCard(request) {
    const card = document.createElement('article');
    card.className = 'student-request-card';

    const heading = document.createElement('div');
    heading.className = 'student-request-heading';

    const subject = document.createElement('h3');
    subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';

    const statusBadge = document.createElement('span');
    statusBadge.className = `student-request-status status-${request.estado.toLowerCase()}`;
    statusBadge.textContent = requestStatusLabels[request.estado] || request.estado;
    heading.append(subject, statusBadge);

    const tutor = document.createElement('p');
    tutor.textContent = `Tutor: ${request.tutor?.nombre || ''} ${request.tutor?.apellido || ''}`.trim();

    const date = document.createElement('p');
    date.textContent = `Fecha solicitada: ${new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(request.fecha_hora))}`;

    card.append(heading, tutor, date);

    if (request.mensaje) {
        const message = document.createElement('p');
        message.textContent = `Mensaje: ${request.mensaje}`;
        card.appendChild(message);
    }

    const canCancelRequest = request.estado === 'PENDIENTE'
        || (request.estado === 'ACEPTADA' && new Date(request.fecha_hora) > new Date());

    if (canCancelRequest) {
        const cancelButton = document.createElement('button');
        cancelButton.className = 'student-request-cancel';
        cancelButton.type = 'button';
        cancelButton.dataset.requestId = request.id;
        cancelButton.dataset.nextStatus = 'CANCELADA';
        cancelButton.textContent = 'Cancelar solicitud';
        card.appendChild(cancelButton);
    }

    return card;
}

/**
 * Muestra la calificación guardada o un formulario para tutorías completadas.
 */
function createStudentRatingCard(request) {
    const card = document.createElement('article');
    card.className = 'student-request-card';

    const heading = document.createElement('div');
    heading.className = 'student-request-heading';

    const subject = document.createElement('h3');
    subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';
    heading.appendChild(subject);

    const tutor = document.createElement('p');
    tutor.textContent = `Tutor: ${request.tutor?.nombre || ''} ${request.tutor?.apellido || ''}`.trim();
    card.append(heading, tutor);

    if (request.calificacion !== null && request.calificacion !== undefined) {
        const savedRating = document.createElement('p');
        savedRating.textContent = `Tu calificación: ${request.calificacion} de 5`;
        card.appendChild(savedRating);

        if (request.comentario_calificacion) {
            const savedComment = document.createElement('p');
            savedComment.textContent = `Tu comentario: ${request.comentario_calificacion}`;
            card.appendChild(savedComment);
        }

        return card;
    }

    const form = document.createElement('form');
    form.className = 'student-rating-form';
    form.dataset.requestRating = request.id;

    const ratingLabel = document.createElement('label');
    ratingLabel.textContent = '¿Cómo calificas esta tutoría?';
    const ratingSelect = document.createElement('select');
    ratingSelect.name = 'calificacion';
    ratingSelect.required = true;
    ratingSelect.add(new Option('Selecciona una calificación', ''));
    [1, 2, 3, 4, 5].forEach((score) => {
        ratingSelect.add(new Option(`${score} de 5`, score));
    });
    ratingLabel.appendChild(ratingSelect);

    const commentLabel = document.createElement('label');
    commentLabel.textContent = 'Comentario (opcional)';
    const commentInput = document.createElement('textarea');
    commentInput.name = 'comentario_calificacion';
    commentInput.rows = 2;
    commentInput.maxLength = 1000;
    commentInput.placeholder = 'Comparte brevemente tu experiencia.';
    commentLabel.appendChild(commentInput);

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Enviar calificación';
    form.append(ratingLabel, commentLabel, submitButton);
    card.appendChild(form);

    return card;
}

/**
 * Consulta las solicitudes del estudiante y actualiza su historial.
 */
async function loadStudentRequests() {
    requestsStatus.hidden = false;
    requestsStatus.textContent = 'Cargando solicitudes...';
    requestList.replaceChildren();
    ratingsStatus.hidden = false;
    ratingsStatus.textContent = 'Cargando tutorías completadas...';
    ratingList.replaceChildren();

    try {
        const requests = await studentApiRequest('/api/tutoring/requests');

        if (requests.length === 0) {
            requestsStatus.textContent = 'Todavía no has enviado solicitudes de tutoría.';
        } else {
            requestsStatus.hidden = true;
            requests.forEach((request) => {
                requestList.appendChild(createStudentRequestCard(request));
            });
        }

        const completedRequests = requests.filter((request) => request.estado === 'COMPLETADA');
        if (!completedRequests.length) {
            ratingsStatus.textContent = 'Aún no hay tutorías completadas. Cuando el tutor marque una sesión como completada, podrás calificarla aquí.';
        } else {
            ratingsStatus.hidden = true;
            completedRequests.forEach((request) => {
                ratingList.appendChild(createStudentRatingCard(request));
            });
        }
    } catch (error) {
        requestsStatus.textContent = error.message;
        ratingsStatus.textContent = error.message;
    }
}

/**
 * Cancela solicitudes pendientes y sesiones aceptadas antes de la fecha acordada.
 */
async function cancelStudentRequest(requestId, cancelButton) {
    if (!window.confirm('¿Quieres cancelar esta solicitud de tutoría?')) {
        return;
    }

    cancelButton.disabled = true;

    try {
        await studentApiRequest(`/api/tutoring/requests/${requestId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: 'CANCELADA' }),
        });
        await loadStudentRequests();
    } catch (error) {
        requestsStatus.hidden = false;
        requestsStatus.textContent = error.message;
    } finally {
        if (cancelButton.isConnected) {
            cancelButton.disabled = false;
        }
    }
}

// Cierra la sesión del estudiante en la API y limpia el token antes de redirigir al acceso.
async function logoutStudent() {
    // Deshabilita los botones mientras solicita el cierre de sesión y luego elimina el token local.
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

requestList.addEventListener('click', (event) => {
    const cancelButton = event.target.closest('[data-next-status="CANCELADA"]');
    if (cancelButton) {
        cancelStudentRequest(cancelButton.dataset.requestId, cancelButton);
    }
});
ratingList.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-request-rating]');
    if (!form) {
        return;
    }

    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    ratingsStatus.hidden = false;
    ratingsStatus.textContent = 'Guardando tu calificación...';

    try {
        const formData = new FormData(form);
        await studentApiRequest(`/api/tutoring/requests/${form.dataset.requestRating}/rating`, {
            method: 'POST',
            body: JSON.stringify({
                calificacion: Number(formData.get('calificacion')),
                comentario_calificacion: formData.get('comentario_calificacion'),
            }),
        });
        await loadStudentRequests();
    } catch (error) {
        ratingsStatus.hidden = false;
        ratingsStatus.textContent = error.message;
        submitButton.disabled = false;
    }
});

if (!token) {
    window.location.replace('/login');
} else {
    // Valida la sesión y muestra el panel o redirige según el rol recibido de la API.
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

            await loadStudentRequests();
        } catch (error) {
            console.error('Error al validar el rol del usuario:', error);
            status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
        }
    })();
}
