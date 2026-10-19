// Valida la sesión del tutor y muestra el panel o redirige según el rol recibido de la API.
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

// Define los estados de las solicitudes y sus etiquetas legibles para el usuario.
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
    // Crea un elemento de tarjeta que muestra la información de la solicitud, incluyendo materia, estudiante, fecha, mensaje y botones de acción según el estado de la solicitud.
    const card = document.createElement('article');
    card.className = 'tutor-request-card';

    // Encabezado con materia y estado de la solicitud
    const heading = document.createElement('div');
    heading.className = 'tutor-request-heading';

    // Muestra la materia y el estado de la solicitud en la tarjeta, utilizando etiquetas legibles para el usuario.
    const subject = document.createElement('h3');
    subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';

    // Crea un badge que indica el estado de la solicitud con un estilo visual distintivo.
    const badge = document.createElement('span');
    badge.className = `tutor-request-status status-${request.estado.toLowerCase()}`;
    badge.textContent = requestStatusLabels[request.estado] || request.estado;
    heading.append(subject, badge);

    // Muestra el nombre del estudiante y la fecha solicitada en la tarjeta, proporcionando información clave para que el tutor pueda tomar decisiones informadas.
    const student = document.createElement('p');
    student.textContent = `Estudiante: ${request.estudiante?.nombre || ''} ${request.estudiante?.apellido || ''}`.trim();

    // Muestra la fecha solicitada en un formato legible para el usuario, utilizando la configuración regional de México.
    const date = document.createElement('p');
    date.textContent = `Fecha solicitada: ${new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(request.fecha_hora))}`;

    // Agrega los elementos de encabezado, estudiante y fecha a la tarjeta, proporcionando una vista completa de la solicitud para que el tutor pueda revisarla y tomar decisiones.
    card.append(heading, student, date);

    // Agrega un mensaje adicional si el estudiante proporcionó uno, y muestra botones de acción según el estado de la solicitud, permitiendo al tutor aceptar, rechazar o marcar como completada la solicitud según corresponda.
    if (request.mensaje) {
        const message = document.createElement('p');
        message.textContent = `Mensaje: ${request.mensaje}`;
        card.appendChild(message);
    }

    // Agrega botones de acción según el estado de la solicitud, permitiendo al tutor aceptar, rechazar o marcar como completada la solicitud según corresponda.
    if (request.estado === 'PENDIENTE') {
        const actions = document.createElement('div');
        actions.className = 'tutor-request-actions';
        actions.append(
            createRequestAction(request.id, 'ACEPTADA', 'Aceptar', 'tutor-request-accept'),
            createRequestAction(request.id, 'RECHAZADA', 'Rechazar', 'tutor-request-reject'),
        );
        // Agrega los botones de acción a la tarjeta, permitiendo al tutor aceptar o rechazar la solicitud según corresponda.
        card.appendChild(actions);
        // Agrega un mensaje adicional para indicar que la solicitud está pendiente de revisión por el tutor, proporcionando contexto adicional para el tutor al revisar la solicitud.
    } else if (request.estado === 'ACEPTADA') {
        const actions = document.createElement('div');
        actions.className = 'tutor-request-actions';
        actions.append(
            createRequestAction(request.id, 'COMPLETADA', 'Marcar como completada', 'tutor-request-complete'),
        );
        // Agrega los botones de acción a la tarjeta, permitiendo al tutor marcar la solicitud como completada según corresponda.
        card.appendChild(actions);
    }

    // Devuelve la tarjeta completa con toda la información y los botones de acción correspondientes, lista para ser agregada a la lista de solicitudes del tutor.
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

// Carga el currículum del tutor desde la API y lo muestra en la interfaz.
async function loadTutorCurriculum() {
    tutorCurriculumStatus.textContent = 'Cargando tu plan de estudios...';
    tutorCurriculum.replaceChildren();

    // Intenta obtener la información del currículum del tutor desde la API y maneja los errores de autenticación y otros errores de la API, mostrando mensajes claros al usuario si ocurre un problema durante la carga del currículum.
    try {
        // Realiza una solicitud a la API para obtener el perfil del tutor, incluyendo la carrera, materias ofrecidas y plan de estudios.
        const response = await fetch(`${apiBaseUrl}/api/tutoring/profile`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        //
        const data = await response.json();

        // Maneja la expiración de sesión y redirige al usuario al inicio de sesión si el token es inválido o ha caducado.
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.replace('/login');
            return;
        }
        // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario si no se puede cargar el plan de estudios del tutor.
        if (!response.ok) {
            throw new Error(data.message || 'No se pudo cargar tu plan de estudios.');
        }

        // Muestra la información del currículum del tutor en la interfaz, incluyendo la carrera, materias ofrecidas y plan de estudios, proporcionando una vista completa del perfil del tutor para que pueda revisarlo y actualizarlo según sea necesario.
        tutorCurriculumStatus.textContent = `Carrera: ${data.carrera.nombre}. Revisa las materias que ofreces y el plan de estudios de tu carrera.`;

        // Muestra los temas que el tutor domina y las materias que ofrece, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
        const topics = document.createElement('section');
        topics.className = 'tutor-offer-topics';

        // Muestra los temas que el tutor domina y las materias que ofrece, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
        const topicsHeading = document.createElement('h3');
        topicsHeading.textContent = 'Temas que domino';

        // Muestra la descripción de los temas que el tutor domina, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
        const topicsDescription = document.createElement('p');
        topicsDescription.textContent = data.temas_dominados || 'Aún no has agregado una descripción de los temas que dominas.';
        topics.append(topicsHeading, topicsDescription);
        tutorCurriculum.appendChild(topics);

        // Muestra las materias que el tutor ofrece, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
        const offeredSubjects = document.createElement('section');
        offeredSubjects.className = 'tutor-offered-subjects';

        // Muestra un encabezado para la sección de materias ofrecidas, proporcionando contexto adicional para el tutor al revisar su perfil.
        const offeredHeading = document.createElement('h3');
        offeredHeading.textContent = 'Materias que ofrezco';
        offeredSubjects.appendChild(offeredHeading);

        // Muestra la lista de materias ofrecidas por el tutor, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
        if (data.materias_ofrecidas.length) {
            // Crea una lista de materias ofrecidas por el tutor y la agrega a la sección correspondiente, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
            const offeredList = document.createElement('ul');
            data.materias_ofrecidas.forEach((subject) => {
                const item = document.createElement('li');
                item.textContent = `Semestre ${subject.semestre}: ${subject.nombre}`;
                offeredList.appendChild(item);
            });
            // Agrega la lista de materias ofrecidas a la sección correspondiente, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
            offeredSubjects.appendChild(offeredList);

            // Muestra un mensaje adicional si el tutor no ha agregado ninguna materia ofrecida, proporcionando contexto adicional para el tutor al revisar su perfil.
        } else {
            const emptyOffer = document.createElement('p');
            emptyOffer.textContent = 'No hay materias seleccionadas en tu postulación.';
            offeredSubjects.appendChild(emptyOffer);
        }
        tutorCurriculum.appendChild(offeredSubjects);

        // Muestra un mensaje si no hay semestres disponibles, proporcionando contexto adicional para el tutor al revisar su perfil.
        if (!data.semestres.length) {
            const emptyPlan = document.createElement('p');
            emptyPlan.textContent = `El plan de estudios de ${data.carrera.nombre} aún no está disponible.`;
            tutorCurriculum.appendChild(emptyPlan);
            return;
        }

        // Muestra el plan de estudios del tutor, incluyendo los semestres y las materias correspondientes, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
        data.semestres.forEach((semester) => {
            // Crea una sección para cada semestre del plan de estudios, mostrando las materias correspondientes y proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
            const section = document.createElement('section');
            section.className = 'tutor-semester';

            // Muestra el número de semestre y las materias correspondientes, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
            const heading = document.createElement('h3');
            heading.textContent = `Semestre ${semester.numero}`;


            // Muestra la lista de materias correspondientes a cada semestre del plan de estudios, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
            const subjects = document.createElement('ul');
            semester.materias.forEach((subject) => {
                const item = document.createElement('li');
                item.textContent = subject.nombre;
                subjects.appendChild(item);
            });

            // Agrega la sección del semestre al currículum del tutor, proporcionando información clave para que el tutor pueda actualizar su perfil y ofrecer sus servicios de manera efectiva.
            section.append(heading, subjects);
            tutorCurriculum.appendChild(section);
        });
        // Oculta el mensaje de estado después de cargar correctamente el currículum del tutor, proporcionando una experiencia de usuario más limpia y clara.
    } catch (error) {
        tutorCurriculumStatus.textContent = error.message;
    }
}

/**
 * Carga las solicitudes asignadas al tutor y actualiza el contador de pendientes.
 */
async function loadTutorRequests() {
    // Muestra un mensaje de estado mientras se cargan las solicitudes y las sesiones del tutor, proporcionando retroalimentación al usuario sobre el progreso de la carga.
    tutorRequestsStatus.textContent = 'Cargando solicitudes...';
    tutorRequestsStatus.hidden = false;
    tutorRequestList.replaceChildren();
    tutorSessionsStatus.textContent = 'Cargando sesiones...';
    tutorSessionsStatus.hidden = false;
    tutorSessionList.replaceChildren();

    // Intenta obtener las solicitudes asignadas al tutor desde la API y maneja los errores de autenticación y otros errores de la API, mostrando mensajes claros al usuario si ocurre un problema durante la carga de las solicitudes.
    try {
        const response = await fetch(`${apiBaseUrl}/api/tutoring/requests`, {
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

        // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario si no se pueden cargar las solicitudes del tutor.
        const requests = await response.json();
        if (!response.ok) {
            throw new Error(requests.message || 'No se pudieron cargar las solicitudes.');
        }

        // Actualiza el contador de solicitudes pendientes y muestra las tarjetas correspondientes para cada solicitud y sesión, proporcionando información clave para que el tutor pueda revisar y responder a las solicitudes de manera efectiva.
        openRequestsCount.textContent = requests
            .filter((request) => request.estado === 'PENDIENTE')
            .length.toString();
        // Muestra un mensaje si no hay solicitudes ni sesiones disponibles, proporcionando contexto adicional para el tutor al revisar su panel.
        if (requests.length === 0) {
            tutorRequestsStatus.textContent = 'Todavía no tienes solicitudes de tutoría.';
            tutorSessionsStatus.textContent = 'Aún no tienes sesiones confirmadas.';
            return;
        }

        // Oculta los mensajes de estado después de cargar correctamente las solicitudes y las sesiones del tutor, proporcionando una experiencia de usuario más limpia y clara.
        tutorRequestsStatus.hidden = true;
        requests.forEach((request) => {
            tutorRequestList.appendChild(createTutorRequestCard(request));
        });
        
        // Filtra las solicitudes para mostrar solo las sesiones confirmadas o completadas, proporcionando información clave para que el tutor pueda revisar y gestionar sus sesiones de manera efectiva.
        const sessions = requests.filter((request) => (
            request.estado === 'ACEPTADA' || request.estado === 'COMPLETADA'
        ));

        // Muestra un mensaje si no hay sesiones confirmadas, proporcionando contexto adicional para el tutor al revisar su panel.
        if (sessions.length === 0) {
            tutorSessionsStatus.textContent = 'Aún no tienes sesiones confirmadas.';
            return;
        }

        // Oculta el mensaje de estado después de cargar correctamente las sesiones del tutor, proporcionando una experiencia de usuario más limpia y clara.
        tutorSessionsStatus.hidden = true;
        sessions.forEach((request) => {
            tutorSessionList.appendChild(createTutorRequestCard(request));
        });
        // Muestra un mensaje si no hay solicitudes ni sesiones disponibles, proporcionando contexto adicional para el tutor al revisar su panel.
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

    // Pide confirmación al tutor antes de enviar la decisión al servidor, mostrando un mensaje claro sobre la acción que se va a realizar.
    if (!window.confirm(`¿Quieres ${actionLabels[nextStatus]} esta solicitud?`)) {
        return;
    }

    // Deshabilita el botón de acción mientras se procesa la solicitud, evitando que el tutor haga clic varias veces y cause problemas de sincronización.
    actionButton.disabled = true;

    // Intenta enviar la decisión del tutor al servidor y maneja los errores de autenticación y otros errores de la API, mostrando mensajes claros al usuario si ocurre un problema durante la actualización de la solicitud.
    try {
        // Realiza una solicitud PATCH a la API para actualizar el estado de la solicitud del tutor, enviando el nuevo estado en el cuerpo de la solicitud.
        const response = await fetch(`${apiBaseUrl}/api/tutoring/requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            // Envía el nuevo estado de la solicitud en el cuerpo de la solicitud, permitiendo al servidor actualizar la solicitud del tutor según corresponda.
            body: JSON.stringify({ estado: nextStatus }),
        });
        // Analiza la respuesta de la API y maneja los errores de validación y otros errores, mostrando mensajes claros al usuario si no se puede actualizar la solicitud del tutor.
        const result = await response.json();

        // Maneja la expiración de sesión y redirige al usuario al inicio de sesión si el token es inválido o ha caducado.
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.replace('/login');
            return;
        }

        // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario si no se puede actualizar la solicitud del tutor.
        if (!response.ok) {
            throw new Error(result.message || 'No se pudo actualizar la solicitud.');
        }

        // Vuelve a cargar la lista de solicitudes y sesiones del tutor después de actualizar el estado de la solicitud, proporcionando una vista actualizada de las solicitudes y sesiones del tutor.
        await loadTutorRequests();
        // Muestra un mensaje de éxito al tutor después de actualizar el estado de la solicitud, proporcionando retroalimentación positiva sobre la acción realizada.
    } catch (error) {
        tutorRequestsStatus.hidden = false;
        tutorRequestsStatus.textContent = error.message;
        // Muestra un mensaje de error al tutor si no se puede actualizar la solicitud, proporcionando retroalimentación clara sobre el problema ocurrido.
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

// Valida la sesión del tutor y redirige según el rol recibido de la API.
if (!token) {
    window.location.replace('/login');
    // Si no hay token, redirige al inicio de sesión y evita que el usuario acceda al panel de tutor sin autenticación.
} else {
    // Comprueba la sesión y el rol antes de mostrar el panel exclusivo para tutores.
    (async () => {
        // Intenta obtener la información del usuario desde la API y maneja la redirección según el rol del usuario, mostrando mensajes de error si ocurre un problema durante la validación.
        try {
            // Realiza una solicitud a la API para obtener la información del usuario, incluyendo su rol, y maneja los errores de autenticación y otros errores de la API, mostrando mensajes claros al usuario si ocurre un problema durante la validación del rol.
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

            const user = await response.json();

            // Redirige a los usuarios con rol de estudiante al panel de estudiante y muestra un mensaje de error para roles no disponibles, asegurando que solo los tutores puedan acceder al panel de tutor.
            if (user.rol === 'ESTUDIANTE') {
                window.location.replace('/panel');
                return;
            }

            // Redirige a los usuarios con rol de administrador al panel de administrador y muestra un mensaje de error para roles no disponibles, asegurando que solo los tutores puedan acceder al panel de tutor.
            if (user.rol !== 'TUTOR') {
                status.hidden = true;
                accessUnavailable.hidden = false;
                return;
            }

            // Muestra el nombre del tutor en la interfaz y hace visible el panel de tutor, cargando las solicitudes y el currículum correspondientes desde la API.
            document.getElementById('tutor-name').textContent = user.nombre ? `, ${user.nombre}` : '';
            status.hidden = true;
            panel.hidden = false;
            await Promise.all([loadTutorRequests(), loadTutorCurriculum()]);
            // Muestra un mensaje de estado indicando que las solicitudes y el currículum se han cargado correctamente, ocultando cualquier mensaje de error previo.
        } catch (error) {
            console.error('Error al validar el rol del tutor:', error);
            status.textContent = 'No se pudo validar tu cuenta. Comprueba la conexión e inténtalo de nuevo.';
        }
    })();
}

// Cierra la sesión en la API y elimina el token local antes de volver al inicio de sesión.
async function logoutTutor() {
    // Deshabilita el botón de cierre de sesión mientras se procesa la solicitud, evitando que el tutor haga clic varias veces y cause problemas de sincronización.
    const buttons = [document.getElementById('tutor-logout-sidebar')];

    // Deshabilita todos los botones de cierre de sesión mientras se procesa la solicitud, evitando que el tutor haga clic varias veces y cause problemas de sincronización.
    buttons.forEach((button) => {
        button.disabled = true;
    });

    // Intenta cerrar la sesión en la API y maneja los errores de autenticación y otros errores de la API, mostrando mensajes claros al usuario si ocurre un problema durante el cierre de sesión.
    try {
        const response = await fetch(`${apiBaseUrl}/api/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario si no se puede cerrar la sesión correctamente.
        if (!response.ok && response.status !== 401) {
            throw new Error(`No se pudo cerrar la sesión (HTTP ${response.status}).`);
        }
        // Redirige al usuario al inicio de sesión después de cerrar la sesión en la API, eliminando el token local para evitar que el usuario acceda al panel de tutor sin autenticación.
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Muestra un mensaje de error al tutor si no se puede cerrar la sesión correctamente, proporcionando retroalimentación clara sobre el problema ocurrido.
    } finally {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
    }
}

// Agrega un evento al botón de cierre de sesión en la barra lateral para que llame a la función de cierre de sesión del tutor cuando se haga clic.
document.getElementById('tutor-logout-sidebar').addEventListener('click', logoutTutor);
