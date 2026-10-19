// Obtener el token de autenticacion guardado en el navegador 
const token = localStorage.getItem('auth_token');

// Elementos del DOM para la estructura general de la vista y mensajes globales
const page = document.getElementById('session-request-page');
const status = document.getElementById('session-page-status');

// Elementos del formulario de solicitud  y contenedor del mensaje de estado
const form = document.getElementById('session-request-form');
const formStatus = document.getElementById('session-form-status');

// Elementos de seleccion (desplegables) del formulario
const semesterSelect = document.getElementById('session-semester');
const subjectSelect = document.getElementById('session-subject');
const tutorSelect = document.getElementById('session-tutor');

// Campo de entrada de fecha y boton de envio del formulario
const dateInput = document.getElementById('session-date');
const submitButton = document.getElementById('session-submit');

// URL bas de la API obtenida desde lo atributos data- del contenedor principal
const apiBaseUrl = page.dataset.apiBaseUrl;

// Variable global oara almacenar el listado de materias disponibles
let availableSubjects = [];

// Filtra y actualiza el desplegable de materias segun el semestre seleccionado
function filterSubjectsBySemester() {
    // Obtener el valor del semestre seleccionado por el usuario
    const selectedSemester = semesterSelect.value;

    // Limpiar el selector de materias y establecer la opcion por defecto segun el estado del semestre 
    subjectSelect.replaceChildren(new Option(
        selectedSemester ? 'Selecciona una materia' : 'Primero selecciona un semestre',
        '',
    ));

    // Filtrar la lista global de materias para obtener solo con las que correspondan con el semestre selecionado
    const semesterSubjects = availableSubjects.filter(
        (subject) => String(subject.semestre) === selectedSemester,
    );

    // Recorrer las materias filtradas y agregarlas como opciones al desplegable (nombre como texto, ID como valor )
    semesterSubjects.forEach((subject) => {
        subjectSelect.add(new Option(subject.nombre, subject.id));
    });

    // Deshabilitar el selector de la materia si no hay asignaturas disponibles para el semestre elegido
    subjectSelect.disabled = semesterSubjects.length === 0;
}

/**
 * Envía solicitudes autenticadas y presenta errores de validación de la API.
 */

// Funcion auxiliar asincrona para realizar peticiones HTTP autenticadas a la API
async function sessionApiRequest(path, options = {}) {
    // Crear controlador de aborto para gestionar el tiempo limite de la peticion 
    const controller = new AbortController();
    // Establecer un temporizador de 15 segundos para cancelar la solicitud si tarda demasiado
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    let response;

    try {
        // Realizar la peticion a la API cobinando las opciones recibidas y los encabezados predeterminados
        response = await fetch(`${apiBaseUrl}${path}`, {
            ...options,
            signal: controller.signal, // Asociar la señal para cancelar la peticion si vence el tiempo
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`, // Enviar el token de acceso
                ...(options.body ? { 'Content-Type': 'application/json' } : {}), // Asignar Content-Type solo si hay cuerpo en la peticion
            },
        });
        // Manejar errores de red o interrupcion de la peticion
    } catch (error) {
        // Si la peticion fue abortada por superar el tiempo limite de 15 segundos
        if (error.name === 'AbortError') {
            throw new Error('La API tardó demasiado en responder. Verifica que esté activa y que API_BASE_URL apunte a ella.');
        }
        // Si ocurre un error de red (por ejemplo, servidor caido o sin conexion a internet)
        if (error instanceof TypeError) {
            throw new Error('No se pudo conectar con la API. Verifica que esté activa y que API_BASE_URL apunte a ella.');
        }
        // Lanza cualquier otro tipo de error no contemplado
        throw error;
        // Limpiar el temporizador al finalizar la peticion (sea con exito o fallo)
    } finally {
        window.clearTimeout(timeoutId);
    }

    let data;
    try {
        // Intentar parsear la respuesta del servisor como JSON
        data = await response.json();
    } catch {
        // Si la respuesta no es un JSON valido (por ejemplo, error HTML 500 o texto plano)
        throw new Error(`La API devolvió una respuesta no válida (HTTP ${response.status}).`);
    }

    // Gestionar sesión no autorizada o token caducado (código HTTP 401)
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.replace('/login');
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    // Gestionar respuestas con errores HTTP (codigos 4xx y 5xx distintos a 401)
    if (!response.ok) {
        // Formatear los mensajes de error de validacion si existen en la respuesta
        const validationMessage = data.errors
            ? Object.values(data.errors).flat().join(' ')
            : '';
            // Lanzar le mensaje de validacion, el mensaje personalizado de la API o un mensaje generico
        throw new Error(validationMessage || data.message || 'No se pudo completar la solicitud.');
    }

    // Retornar la informacion obtenida si la respuesta fue exitosa
    return data;
}

/**
 * Carga las materias y tutores necesarios para completar la solicitud.
 */
// Cargar las opciones iniciales del formulario (materias, semestres y tutores) desde la API
async function loadSessionOptions() {
    try {
        // Solicitar el catalogo de opciones de tutoria a la API
        const data = await sessionApiRequest('/api/tutoring/options');

        // Validar que la respuesta contenga los arreglos esperados de materias y tutores
        if (!Array.isArray(data.materias) || !Array.isArray(data.tutores)) {
            throw new Error('La API respondió sin el catálogo de materias y tutores esperado.');
        }

        // Ordenar las materias primero por numero de semestre y luego alfabeticamente por nombre
        availableSubjects = data.materias.sort(
            (first, second) => first.semestre - second.semestre || first.nombre.localeCompare(second.nombre, 'es'),
        );

        // Reiniciar los selectores desplegables con su opcion por efecto
        semesterSelect.replaceChildren(new Option('Selecciona un semestre', ''));
        tutorSelect.replaceChildren(new Option('Selecciona un tutor', ''));

        // Extraer los semestres unicos disponibles a partir del listado de materias
        const semesters = [...new Set(availableSubjects.map((subject) => subject.semestre))];
       
        // Poblar el selector de semestres
        semesters.forEach((semester) => {
            semesterSelect.add(new Option(`Semestre ${semester}`, semester));
        });
        semesterSelect.disabled = semesters.length === 0;
        
        // Aplicar el filtro inicial para el selector de materias
        filterSubjectsBySemester();

        //Poblar el selector de tutores con nombre y apellido
        data.tutores.forEach((tutor) => {
            tutorSelect.add(new Option(`${tutor.nombre} ${tutor.apellido}`.trim(), tutor.id_usuario));
        });

        // Manejar el caso donde no existan materias o tutores regsitrados para la carrera del alumno
        if (!availableSubjects.length || !data.tutores.length) {
            semesterSelect.disabled = !availableSubjects.length;
            subjectSelect.disabled = true;
            tutorSelect.disabled = !data.tutores.length;
            submitButton.disabled = true;
            formStatus.hidden = false;
            formStatus.textContent = !availableSubjects.length
                ? 'No hay materias registradas para la carrera de tu perfil. Verifica tu carrera o contacta al administrador.'
                : 'No hay tutores disponibles para la carrera de tu perfil.';
            return;
        }

        // Confugurar la fecha/hora minima permitida en el campo de entrada (Fecha actual local)
        const localNow = new Date();
        localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
        dateInput.min = localNow.toISOString().slice(0, 16);

        // Ocultar mensajes de estado y habilitar el boton de envio
        formStatus.hidden = true;
        submitButton.disabled = false;

        // Capturar errores durante la carga de opciones y deshabilitar los controles del formulario
    } catch (error) {
        subjectSelect.replaceChildren(new Option('No se pudieron cargar las materias', ''));
        tutorSelect.replaceChildren(new Option('No se pudieron cargar los tutores', ''));
        semesterSelect.replaceChildren(new Option('No se pudieron cargar los semestres', ''));
        semesterSelect.disabled = true;
        subjectSelect.disabled = true;
        tutorSelect.disabled = true;
        submitButton.disabled = true;
        formStatus.hidden = false;
        formStatus.textContent = error.message;
    }
}

// Escuchar cambios en el selector de semestre para filtrar las materias dinamicamente 
semesterSelect.addEventListener('change', filterSubjectsBySemester);

// Escuchar el evento de envio (submit) del formulario
form.addEventListener('submit', async (event) => {
    // Evitar la recarga por defecto de la pagina al enviar el formulario
    event.preventDefault();

    // Deshabiliar el boton de envio y mostrar mensaje de carga
    submitButton.disabled = true;
    formStatus.hidden = false;
    formStatus.textContent = 'Enviando solicitud...';

    try {
        // Extraer todos los campos del formulario y convertirlos en un objeto JS
        const payload = Object.fromEntries(new FormData(form).entries());

        // Envair la solicitud POST a la API con los datos del formulario
        const result = await sessionApiRequest('/api/tutoring/requests', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        // Limpiar los campos del formulario y reiniciar el filtro de materias
        form.reset();
        semesterSelect.value = '';
        filterSubjectsBySemester();

        // Mostrar mensaje de exito enviado por la API
        formStatus.textContent = `${result.message} Puedes revisar el estado en tus solicitudes.`;
        
        // Crear y agregar dinamicamente un enlace hacia la seleccion de solicitudes del usuario
        const requestsLink = document.createElement('a');
        requestsLink.href = '/panel#solicitudes';
        requestsLink.textContent = 'Ver mis solicitudes';
        formStatus.append(' ', requestsLink);

        // Capturar errores ocurridos durante el proceso de envio
    } catch (error) {
        formStatus.textContent = error.message;

        // Volver a habilitar el boton de envio sin importar si la peticion fallo o fue exitosa
    } finally {
        submitButton.disabled = false;
    }
});


// Validar si existe un token de autenticacion guardado en el navegador 
if (!token) {
    // Si no hay algun token, redirigir inmediatamente al usuario a la pagina de inicio de sesion
    window.location.replace('/login');
} else {
    // Si existe el token, ejecutar una funcion asincrona autoinvocada para autenticar y cargar el panel
    (async () => {
        try {
            // Soolicitar la informacion del usuario autenticado a la API
            const user = await sessionApiRequest('/api/user');

            // Redirigir si el rol del usuario no corresponde al de ESTUDIANTE
            if (user.rol !== 'ESTUDIANTE') {
                window.location.replace(user.rol === 'TUTOR' ? '/panel/tutor' : '/panel-admin');
                return;
            }

            // Si es ESTUDIANTE, ocultar el contenedor de estado y mostrar el contenido de la pagina
            status.hidden = true;
            page.hidden = false;

            // Cargar los catalogos necesario para el formulario de solicitud 
            await loadSessionOptions();

            // Capturar errores durante la validacion de sesion o carga de datos
        } catch (error) {
            // Ocultar el formulario, mostrar ka vista de estado y presentar el mensaje de error 
            page.hidden = true;
            status.hidden = false;
            status.textContent = error.message;
        }
    })();
}
