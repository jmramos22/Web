// Inicializa el panel del estudiante
const token = localStorage.getItem('auth_token');
const panel = document.getElementById('student-panel');
const apiBaseUrl = panel.dataset.apiBaseUrl;
const status = document.getElementById('panel-status');
const roleUnavailable = document.getElementById('role-unavailable');
const requestList = document.getElementById('student-request-list');
const requestsStatus = document.getElementById('student-requests-status');
const ratingList = document.getElementById('student-rating-list');
const ratingsStatus = document.getElementById('student-ratings-status');
// Elementos de la interfaz para mostrar el estado de las solicitudes y calificaciones del estudiante, incluyendo listas y mensajes de estado.
const logoutButtons = [
    document.getElementById('student-logout-sidebar'),
];

// Códigos de estado de solicitudes y sus etiquetas legibles para el usuario.
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

    // Maneja la expiración de sesión y redirige al usuario al inicio de sesión si el token es inválido o ha caducado.
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario.
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
    // Crea un elemento de tarjeta para mostrar la información de la solicitud del estudiante, incluyendo materia, tutor, fecha y estado.
    const card = document.createElement('article');
    card.className = 'student-request-card';

    // Crea un encabezado con el nombre de la materia y un distintivo de estado, mostrando si la solicitud está pendiente, aceptada, rechazada, cancelada o completada.
    const heading = document.createElement('div');
    heading.className = 'student-request-heading';

    // Crea un elemento de encabezado con el nombre de la materia y un distintivo de estado, mostrando si la solicitud está pendiente, aceptada, rechazada, cancelada o completada.
    const subject = document.createElement('h3');
    subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';

    // Crea un distintivo de estado para la solicitud, mostrando si está pendiente, aceptada, rechazada, cancelada o completada, con un estilo visual que indica el estado.
    const statusBadge = document.createElement('span');
    statusBadge.className = `student-request-status status-${request.estado.toLowerCase()}`;
    statusBadge.textContent = requestStatusLabels[request.estado] || request.estado;
    heading.append(subject, statusBadge);

    // Crea elementos de información adicionales para mostrar el tutor asignado y la fecha y hora de la solicitud, formateada según la configuración regional.
    const tutor = document.createElement('p');
    tutor.textContent = `Tutor: ${request.tutor?.nombre || ''} ${request.tutor?.apellido || ''}`.trim();

    // Crea un elemento de párrafo para mostrar la fecha y hora de la solicitud, formateada según la configuración regional.
    const date = document.createElement('p');
    date.textContent = `Fecha solicitada: ${new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(request.fecha_hora))}`;

    // Agrega los elementos de encabezado, tutor y fecha a la tarjeta de solicitud del estudiante.
    card.append(heading, tutor, date);

    // Si la solicitud tiene un mensaje adicional, crea un párrafo para mostrarlo en la tarjeta.
    if (request.mensaje) {
        const message = document.createElement('p');
        message.textContent = `Mensaje: ${request.mensaje}`;
        card.appendChild(message);
    }

    // Determina si la solicitud puede ser cancelada, ya sea porque está pendiente o porque está aceptada y la fecha de la sesión aún no ha pasado.
    const canCancelRequest = request.estado === 'PENDIENTE'
        || (request.estado === 'ACEPTADA' && new Date(request.fecha_hora) > new Date());

        // Si la solicitud puede ser cancelada, crea un botón para permitir al estudiante cancelar la solicitud, con un evento que maneja la acción de cancelación.
    if (canCancelRequest) {
        const cancelButton = document.createElement('button');
        cancelButton.className = 'student-request-cancel';
        cancelButton.type = 'button';
        cancelButton.dataset.requestId = request.id;
        cancelButton.dataset.nextStatus = 'CANCELADA';
        cancelButton.textContent = 'Cancelar solicitud';
        card.appendChild(cancelButton);
    }

    // Devuelve la tarjeta de solicitud completa para ser añadida a la lista de solicitudes del estudiante.
    return card;
}

/**
 * Muestra la calificación guardada o un formulario para tutorías completadas.
 */
function createStudentRatingCard(request) {
    // Crea un elemento de tarjeta para mostrar la calificación del estudiante para una tutoría completada, incluyendo la materia, el tutor y un formulario para enviar la calificación si aún no se ha hecho.
    const card = document.createElement('article');
    card.className = 'student-request-card';

    // Crea un encabezado con el nombre de la materia y el nombre del tutor, mostrando la información relevante de la tutoría completada.
    const heading = document.createElement('div');
    heading.className = 'student-request-heading';

    // Crea un elemento de encabezado con el nombre de la materia y el nombre del tutor, mostrando la información relevante de la tutoría completada.
    const subject = document.createElement('h3');
    subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';
    heading.appendChild(subject);

    // Crea un párrafo para mostrar el nombre del tutor asignado a la tutoría completada, incluyendo su nombre y apellido.
    const tutor = document.createElement('p');
    tutor.textContent = `Tutor: ${request.tutor?.nombre || ''} ${request.tutor?.apellido || ''}`.trim();
    card.append(heading, tutor);

    // Si la solicitud ya tiene una calificación guardada, muestra la calificación y el comentario del estudiante; de lo contrario, muestra un formulario para enviar la calificación.
    if (request.calificacion !== null && request.calificacion !== undefined) {
        const savedRating = document.createElement('p');
        savedRating.textContent = `Tu calificación: ${request.calificacion} de 5`;
        card.appendChild(savedRating);

        // Si hay un comentario guardado, crea un párrafo para mostrar el comentario del estudiante sobre la tutoría completada.
        if (request.comentario_calificacion) {
            const savedComment = document.createElement('p');
            savedComment.textContent = `Tu comentario: ${request.comentario_calificacion}`;
            card.appendChild(savedComment);
        }

        // Si la solicitud ya tiene una calificación guardada, no se muestra el formulario de calificación.
        return card;
    }

    // Si la solicitud no tiene calificación, crea un formulario para que el estudiante pueda enviar su calificación y comentario sobre la tutoría completada.
    const form = document.createElement('form');
    form.className = 'student-rating-form';
    form.dataset.requestRating = request.id;

    // Crea un elemento de etiqueta y un menú desplegable para que el estudiante seleccione su calificación de 1 a 5, con una opción predeterminada que indica que debe seleccionar una calificación.
    const ratingLabel = document.createElement('label');
    ratingLabel.textContent = '¿Cómo calificas esta tutoría?';

    // Crea un menú desplegable para que el estudiante seleccione su calificación de 1 a 5, con una opción predeterminada que indica que debe seleccionar una calificación.
    const ratingSelect = document.createElement('select');
    ratingSelect.name = 'calificacion';
    ratingSelect.required = true;
    ratingSelect.add(new Option('Selecciona una calificación', ''));
    [1, 2, 3, 4, 5].forEach((score) => {
        ratingSelect.add(new Option(`${score} de 5`, score));
    });
    ratingLabel.appendChild(ratingSelect);

    // Crea un elemento de etiqueta y un área de texto para que el estudiante pueda escribir un comentario opcional sobre la tutoría completada, con un límite de caracteres y un mensaje de ayuda.
    const commentLabel = document.createElement('label');
    commentLabel.textContent = 'Comentario (opcional)';

    // Crea un área de texto para que el estudiante pueda escribir un comentario opcional sobre la tutoría completada, con un límite de caracteres y un mensaje de ayuda.
    const commentInput = document.createElement('textarea');
    commentInput.name = 'comentario_calificacion';
    commentInput.rows = 2;
    commentInput.maxLength = 1000;
    commentInput.placeholder = 'Comparte brevemente tu experiencia.';
    commentLabel.appendChild(commentInput);

    // Crea un botón de envío para que el estudiante pueda enviar su calificación y comentario sobre la tutoría completada, con un texto que indica la acción de enviar la calificación.
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Enviar calificación';
    form.append(ratingLabel, commentLabel, submitButton);
    card.appendChild(form);

    // Devuelve la tarjeta de calificación completa para ser añadida a la lista de calificaciones del estudiante.
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

    // Consulta la API para obtener las solicitudes del estudiante y actualiza la interfaz con las tarjetas de solicitud y calificación correspondientes.
    try {
        // Realiza una solicitud a la API para obtener las solicitudes del estudiante y actualiza la interfaz con las tarjetas de solicitud y calificación correspondientes.
        const requests = await studentApiRequest('/api/tutoring/requests');
        
        // Si no hay solicitudes, muestra un mensaje indicando que no se han enviado solicitudes de tutoría; de lo contrario, crea tarjetas para cada solicitud y las añade a la lista.
        if (requests.length === 0) {
            requestsStatus.textContent = 'Todavía no has enviado solicitudes de tutoría.';
            // Si no hay solicitudes, muestra un mensaje indicando que no se han enviado solicitudes de tutoría; de lo contrario, crea tarjetas para cada solicitud y las añade a la lista.
        } else {
            requestsStatus.hidden = true;
            requests.forEach((request) => {
                requestList.appendChild(createStudentRequestCard(request));
            });
        }

        // Filtra las solicitudes completadas y muestra un mensaje si no hay tutorías completadas; de lo contrario, crea tarjetas de calificación para cada solicitud completada y las añade a la lista.
        const completedRequests = requests.filter((request) => request.estado === 'COMPLETADA');
        if (!completedRequests.length) {
            ratingsStatus.textContent = 'Aún no hay tutorías completadas. Cuando el tutor marque una sesión como completada, podrás calificarla aquí.';
            // Filtra las solicitudes completadas y muestra un mensaje si no hay tutorías completadas; de lo contrario, crea tarjetas de calificación para cada solicitud completada y las añade a la lista.
        } else {
            ratingsStatus.hidden = true;
            completedRequests.forEach((request) => {
                ratingList.appendChild(createStudentRatingCard(request));
            });
        }
        // Oculta el mensaje de estado al completar la carga de solicitudes y calificaciones, y desplaza la vista hacia la lista para mostrar el resultado al usuario.
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

    // Muestra un mensaje de estado mientras se procesa la cancelación de la solicitud.
    try {
        await studentApiRequest(`/api/tutoring/requests/${requestId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: 'CANCELADA' }),
        });
        await loadStudentRequests();
        // Muestra un mensaje de éxito al cancelar la solicitud y actualiza la lista de solicitudes del estudiante.
    } catch (error) {
        requestsStatus.hidden = false;
        requestsStatus.textContent = error.message;

        // Muestra un mensaje de error si la cancelación falla y mantiene el botón de cancelación deshabilitado para evitar múltiples intentos.
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

    // Intenta cerrar la sesión en la API y maneja cualquier error, asegurando que el token local se elimine y el usuario sea redirigido al inicio de sesión.
    try {
        const response = await fetch(`${apiBaseUrl}/api/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        // Maneja errores de cierre de sesión, mostrando un mensaje en la consola si la solicitud falla, pero asegurando que el token local se elimine y el usuario sea redirigido al inicio de sesión.
        if (!response.ok && response.status !== 401) {
            throw new Error(`No se pudo cerrar la sesión (HTTP ${response.status}).`);
        }
        // Elimina el token local y redirige al usuario al inicio de sesión, independientemente del resultado de la solicitud de cierre de sesión.
    } catch (error) {
        console.error('Error al cerrar sesión:', error);

        // Asegura que el token local se elimine y el usuario sea redirigido al inicio de sesión, incluso si ocurre un error durante la solicitud de cierre de sesión.
    } finally {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
    }
}

// Agrega eventos a los botones de cierre de sesión y a los botones de cancelación de solicitudes, así como al formulario de calificación, para manejar las acciones del estudiante en el panel.
logoutButtons.forEach((button) => {
    button.addEventListener('click', logoutStudent);
});

// Agrega un evento al contenedor de solicitudes para manejar la cancelación de solicitudes cuando se hace clic en un botón de cancelación, utilizando delegación de eventos para capturar el evento en el contenedor padre.
requestList.addEventListener('click', (event) => {
    const cancelButton = event.target.closest('[data-next-status="CANCELADA"]');
    if (cancelButton) {
        cancelStudentRequest(cancelButton.dataset.requestId, cancelButton);
    }
});

// Agrega un evento al contenedor de calificaciones para manejar el envío de calificaciones cuando se envía un formulario de calificación, utilizando delegación de eventos para capturar el evento en el contenedor padre.
ratingList.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-request-rating]');
    if (!form) {
        return;
    }
    // Evita el envío predeterminado del formulario y deshabilita el botón de envío mientras se procesa la calificación, mostrando un mensaje de estado al usuario.
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    ratingsStatus.hidden = false;
    ratingsStatus.textContent = 'Guardando tu calificación...';

    // Envía la calificación y el comentario a la API, actualiza la lista de solicitudes y maneja cualquier error que ocurra durante el proceso.
    try {
        const formData = new FormData(form);
        // Envía la calificación y el comentario a la API, actualiza la lista de solicitudes y maneja cualquier error que ocurra durante el proceso.
        await studentApiRequest(`/api/tutoring/requests/${form.dataset.requestRating}/rating`, {
            method: 'POST',
            body: JSON.stringify({
                calificacion: Number(formData.get('calificacion')),
                comentario_calificacion: formData.get('comentario_calificacion'),
            }),
        });
        // Actualiza la lista de solicitudes y calificaciones del estudiante después de enviar la calificación, mostrando un mensaje de éxito al usuario.
        await loadStudentRequests();

        // Muestra un mensaje de éxito al enviar la calificación y actualiza la lista de solicitudes y calificaciones del estudiante.
    } catch (error) {
        ratingsStatus.hidden = false;
        ratingsStatus.textContent = error.message;
        submitButton.disabled = false;
    }
});

// Valida la sesión del estudiante y muestra el panel o redirige según el rol recibido de la API.
if (!token) {
    window.location.replace('/login');
} else {
    // Valida la sesión y muestra el panel o redirige según el rol recibido de la API.
    (async () => {
        // Intenta obtener la información del usuario desde la API y maneja la redirección según el rol del usuario, mostrando mensajes de error si ocurre un problema durante la validación.
        try {
            const response = await fetch(`${apiBaseUrl}/api/user`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Maneja la expiración de sesión y redirige al usuario al inicio de sesión si el token es inválido o ha caducado.
            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }

            // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario si no se puede validar la cuenta.
            if (!response.ok) {
                throw new Error(`No se pudo validar la cuenta (HTTP ${response.status}).`);
            }

            // Analiza la respuesta de la API para obtener la información del usuario y determina si el rol es válido para acceder al panel de estudiante, mostrando mensajes de error si el rol no es adecuado.
            const user = await response.json();
            status.hidden = true;

            // Redirige a los usuarios con rol de tutor al panel de tutor y muestra un mensaje de error para roles no disponibles, asegurando que solo los estudiantes puedan acceder al panel de estudiante.
            if (user.rol === 'TUTOR') {
                window.location.replace('/panel/tutor');
                return;
            }

            // Redirige a los usuarios con rol de administrador al panel de administrador y muestra un mensaje de error para roles no disponibles, asegurando que solo los estudiantes puedan acceder al panel de estudiante.
            if (user.rol !== 'ESTUDIANTE') {
                roleUnavailable.hidden = false;
                return;
            }

            // Muestra el nombre del estudiante en la interfaz y hace visible el panel de estudiante, cargando las solicitudes y calificaciones correspondientes desde la API.
            document.getElementById('student-name').textContent = user.nombre ? `, ${user.nombre}` : '';
            panel.hidden = false;

            // Carga las solicitudes y calificaciones del estudiante desde la API y actualiza la interfaz con las tarjetas correspondientes.
            await loadStudentRequests();

            // Muestra un mensaje de estado indicando que las solicitudes y calificaciones se han cargado correctamente, ocultando cualquier mensaje de error previo.
        } catch (error) {
            console.error('Error al validar el rol del usuario:', error);
            status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
        }
    })();
}
