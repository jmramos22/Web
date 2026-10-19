// Inicializa el token de autenticación y los elementos del DOM
const token = localStorage.getItem('auth_token');
const page = document.getElementById('tutor-application-page');
const pageStatus = document.getElementById('tutor-application-page-status');
const applicationStatus = document.getElementById('tutor-application-status');
const applicationForm = document.getElementById('tutor-application-form');
const submitButton = document.getElementById('tutor-application-submit');
const subjectOptions = document.getElementById('tutor-application-subject-options');
const apiBaseUrl = page.dataset.apiBaseUrl;

// Función para realizar solicitudes a la API con manejo de errores y autenticación
async function applicationApiRequest(path, options = {}) {
    // Realiza una solicitud a la API con el token de autenticación y maneja errores de validación y autenticación.
    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.body && !(options.body instanceof FormData)
                ? { 'Content-Type': 'application/json' }
                : {}),
        },
    });
    // Analiza la respuesta de la API y maneja errores de autenticación y validación, lanzando excepciones con mensajes claros para el usuario.
    const data = await response.json();

    // Maneja errores de autenticación y validación, lanzando excepciones con mensajes claros para el usuario.
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }    // Maneja errores de validación y otros errores de la API, mostrando mensajes claros al usuario si no se puede completar la solicitud.
    if (!response.ok) {
        const validationMessage = data.errors
            ? Object.values(data.errors).flat().join(' ')
            : '';
        throw new Error(validationMessage || data.message || 'No se pudo completar la solicitud.');
    }
    // Devuelve los datos de la respuesta de la API si la solicitud fue exitosa.
    return data;
}
// Función para cargar el estado de la postulación del tutor y actualizar la interfaz de usuario en consecuencia
async function loadApplicationStatus() {
    applicationStatus.textContent = 'Consultando el estado de tu postulación...';
    // Intenta obtener el estado de la postulación del tutor y actualizar la interfaz de usuario en consecuencia, mostrando mensajes claros al usuario si ocurre un error durante la solicitud.
    try {
        const application = await applicationApiRequest('/api/tutoring/application');

        // Maneja el estado de la postulación y actualiza la interfaz de usuario en consecuencia, mostrando mensajes claros al usuario si ocurre un error durante la solicitud.
        if (application?.status === 'PENDIENTE') {
            applicationForm.hidden = true;
            applicationStatus.textContent = 'Tu postulación está pendiente de revisión por el administrador.';
            return;
        }
        // Maneja el estado de la postulación y actualiza la interfaz de usuario en consecuencia, mostrando mensajes claros al usuario si ocurre un error durante la solicitud.
        applicationStatus.textContent = application?.status === 'RECHAZADA'
            ? 'Tu postulación anterior fue rechazada. Puedes enviar una nueva con un kardex actualizado.'
            : 'Completa la información para solicitar la revisión del administrador.';

        await loadApplicationSubjects();
        applicationForm.hidden = false;
        // Muestra el formulario de postulación si no hay una postulación pendiente o rechazada, permitiendo al tutor enviar una nueva solicitud.
    } catch (error) {
        applicationForm.hidden = true;
        applicationStatus.textContent = error.message;
    }
}

// Función para cargar las materias disponibles para la postulación del tutor y actualizar la interfaz de usuario en consecuencia
async function loadApplicationSubjects() {
    // Intenta obtener las materias disponibles para la postulación del tutor y actualizar la interfaz de usuario en consecuencia, mostrando mensajes claros al usuario si ocurre un error durante la solicitud.
    const options = await applicationApiRequest('/api/tutoring/options');
    subjectOptions.replaceChildren();

    // Maneja el caso en que no hay materias disponibles para la carrera del tutor, mostrando un mensaje claro al usuario y evitando que envíe una solicitud sin materias seleccionadas.
    if (!Array.isArray(options.materias) || !options.materias.length) {
        throw new Error('No hay materias disponibles para la carrera de tu perfil. Contacta al administrador.');
    }

    // Agrupa las materias por semestre y las ordena, creando elementos de interfaz de usuario para cada grupo y materia, permitiendo al tutor seleccionar las materias que desea asesorar.
    const subjectsBySemester = new Map();
    options.materias.forEach((subject) => {
        const semesterSubjects = subjectsBySemester.get(subject.semestre) || [];
        semesterSubjects.push(subject);
        subjectsBySemester.set(subject.semestre, semesterSubjects);
    });

    // Ordena los semestres y crea elementos de interfaz de usuario para cada grupo de materias, permitiendo al tutor seleccionar las materias que desea asesorar.
    [...subjectsBySemester.entries()]
        .sort(([firstSemester], [secondSemester]) => firstSemester - secondSemester)
        .forEach(([semester, subjects]) => {
            // Crea un grupo de materias para cada semestre y agrega elementos de interfaz de usuario para cada materia, permitiendo al tutor seleccionar las materias que desea asesorar.
            const group = document.createElement('div');
            group.className = 'student-subject-semester';

            // Crea un encabezado para el grupo de materias y agrega elementos de interfaz de usuario para cada materia, permitiendo al tutor seleccionar las materias que desea asesorar.
            const heading = document.createElement('h3');
            heading.textContent = `Semestre ${semester}`;
            group.appendChild(heading);

            // Crea elementos de interfaz de usuario para cada materia y los agrega al grupo de materias, permitiendo al tutor seleccionar las materias que desea asesorar.
            subjects.forEach((subject) => {
                // Crea un elemento de etiqueta para cada materia y agrega un checkbox y el nombre de la materia, permitiendo al tutor seleccionar las materias que desea asesorar.
                const label = document.createElement('label');
                label.className = 'student-subject-option';

                // Crea un checkbox para cada materia y lo agrega al elemento de etiqueta, permitiendo al tutor seleccionar las materias que desea asesorar.
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'materias[]';
                checkbox.value = subject.id;

                // Crea un elemento de texto para el nombre de la materia y lo agrega al elemento de etiqueta, permitiendo al tutor seleccionar las materias que desea asesorar.
                const name = document.createElement('span');
                name.textContent = subject.nombre;
                label.append(checkbox, name);
                group.appendChild(label);
            });

            // Agrega el grupo de materias al contenedor de opciones de materias, permitiendo al tutor seleccionar las materias que desea asesorar.
            subjectOptions.appendChild(group);
        });
}

// Maneja el envío del formulario de postulación del tutor, validando que se haya seleccionado al menos una materia y enviando la solicitud a la API, mostrando mensajes claros al usuario si ocurre un error durante la solicitud.
applicationForm.addEventListener('submit', async (event) => {
    // Evita que el formulario se envíe de forma predeterminada y valida que se haya seleccionado al menos una materia antes de enviar la solicitud a la API.
    event.preventDefault();
    if (!applicationForm.querySelector('input[name="materias[]"]:checked')) {
        applicationStatus.textContent = 'Selecciona al menos una materia que quieras asesorar.';
        return;
    }

    // Deshabilita el botón de envío y muestra un mensaje de estado mientras se procesa la solicitud, evitando que el tutor haga clic varias veces y cause problemas de sincronización.
    submitButton.disabled = true;
    applicationStatus.textContent = 'Enviando tu postulación...';

    // Intenta enviar la solicitud de postulación del tutor a la API y manejar errores de validación y otros errores de la API, mostrando mensajes claros al usuario si ocurre un problema durante la solicitud.
    try {
        const result = await applicationApiRequest('/api/tutoring/application', {
            method: 'POST',
            body: new FormData(applicationForm),
        });
        // Maneja la respuesta de la API y actualiza la interfaz de usuario en consecuencia, mostrando mensajes claros al usuario si ocurre un error durante la solicitud.
        applicationForm.reset();
        applicationForm.hidden = true;
        applicationStatus.textContent = result.message;
        // Muestra un mensaje de éxito indicando que la postulación se envió correctamente y está pendiente de revisión por el administrador.
    } catch (error) {
        applicationStatus.textContent = error.message;
        // Muestra un mensaje de error indicando que no se pudo enviar la postulación, proporcionando retroalimentación clara sobre el problema ocurrido.
    } finally {
        submitButton.disabled = false;
    }
});

// Verifica si hay un token de autenticación en el almacenamiento local; si no lo hay, redirige al usuario a la página de inicio de sesión. Si hay un token, intenta obtener la información del usuario y verificar su rol para mostrar la interfaz de postulación del tutor o redirigirlo a su panel correspondiente.
if (!token) {
    window.location.replace('/login');
    // Redirige al usuario a la página de inicio de sesión si no hay un token de autenticación en el almacenamiento local.
} else {
    // Intenta obtener la información del usuario y verificar su rol para mostrar la interfaz de postulación del tutor o redirigirlo a su panel correspondiente.
    (async () => {
        try {
            const user = await applicationApiRequest('/api/user');
            if (user.rol !== 'ESTUDIANTE') {
                window.location.replace(user.rol === 'TUTOR' ? '/panel/tutor' : '/panel-admin');
                return;
            }

            // Muestra la página de postulación del tutor y carga el estado de la postulación si el usuario tiene el rol de estudiante, permitiéndole enviar una solicitud para convertirse en tutor.
            pageStatus.hidden = true;
            page.hidden = false;
            await loadApplicationStatus();
            // Muestra un mensaje de estado indicando que la información del usuario se cargó correctamente, ocultando cualquier mensaje de error previo.
        } catch (error) {
            pageStatus.textContent = error.message;
        }
    })();
}
