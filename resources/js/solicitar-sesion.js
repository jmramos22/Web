const token = localStorage.getItem('auth_token');
const page = document.getElementById('session-request-page');
const status = document.getElementById('session-page-status');
const form = document.getElementById('session-request-form');
const formStatus = document.getElementById('session-form-status');
const semesterSelect = document.getElementById('session-semester');
const subjectSelect = document.getElementById('session-subject');
const tutorSelect = document.getElementById('session-tutor');
const dateInput = document.getElementById('session-date');
const submitButton = document.getElementById('session-submit');
const apiBaseUrl = page.dataset.apiBaseUrl;
let availableSubjects = [];

function filterSubjectsBySemester() {
    const selectedSemester = semesterSelect.value;
    subjectSelect.replaceChildren(new Option(
        selectedSemester ? 'Selecciona una materia' : 'Primero selecciona un semestre',
        '',
    ));

    const semesterSubjects = availableSubjects.filter(
        (subject) => String(subject.semestre) === selectedSemester,
    );
    semesterSubjects.forEach((subject) => {
        subjectSelect.add(new Option(subject.nombre, subject.id));
    });
    subjectSelect.disabled = semesterSubjects.length === 0;
}

/**
 * Envía solicitudes autenticadas y presenta errores de validación de la API.
 */
async function sessionApiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    let response;

    try {
        response = await fetch(`${apiBaseUrl}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            },
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('La API tardó demasiado en responder. Verifica que esté activa y que API_BASE_URL apunte a ella.');
        }
        if (error instanceof TypeError) {
            throw new Error('No se pudo conectar con la API. Verifica que esté activa y que API_BASE_URL apunte a ella.');
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(`La API devolvió una respuesta no válida (HTTP ${response.status}).`);
    }

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
 * Carga las materias y tutores necesarios para completar la solicitud.
 */
async function loadSessionOptions() {
    try {
        const data = await sessionApiRequest('/api/tutoring/options');
        if (!Array.isArray(data.materias) || !Array.isArray(data.tutores)) {
            throw new Error('La API respondió sin el catálogo de materias y tutores esperado.');
        }

        availableSubjects = data.materias.sort(
            (first, second) => first.semestre - second.semestre || first.nombre.localeCompare(second.nombre, 'es'),
        );
        semesterSelect.replaceChildren(new Option('Selecciona un semestre', ''));
        tutorSelect.replaceChildren(new Option('Selecciona un tutor', ''));

        const semesters = [...new Set(availableSubjects.map((subject) => subject.semestre))];
        semesters.forEach((semester) => {
            semesterSelect.add(new Option(`Semestre ${semester}`, semester));
        });
        semesterSelect.disabled = semesters.length === 0;
        filterSubjectsBySemester();

        data.tutores.forEach((tutor) => {
            tutorSelect.add(new Option(`${tutor.nombre} ${tutor.apellido}`.trim(), tutor.id_usuario));
        });

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

        const localNow = new Date();
        localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
        dateInput.min = localNow.toISOString().slice(0, 16);
        formStatus.hidden = true;
        submitButton.disabled = false;
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

semesterSelect.addEventListener('change', filterSubjectsBySemester);

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    formStatus.hidden = false;
    formStatus.textContent = 'Enviando solicitud...';

    try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const result = await sessionApiRequest('/api/tutoring/requests', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        form.reset();
        semesterSelect.value = '';
        filterSubjectsBySemester();
        formStatus.textContent = `${result.message} Puedes revisar el estado en tus solicitudes.`;
        const requestsLink = document.createElement('a');
        requestsLink.href = '/panel#solicitudes';
        requestsLink.textContent = 'Ver mis solicitudes';
        formStatus.append(' ', requestsLink);
    } catch (error) {
        formStatus.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

if (!token) {
    window.location.replace('/login');
} else {
    (async () => {
        try {
            const user = await sessionApiRequest('/api/user');
            if (user.rol !== 'ESTUDIANTE') {
                window.location.replace(user.rol === 'TUTOR' ? '/panel/tutor' : '/panel-admin');
                return;
            }

            status.hidden = true;
            page.hidden = false;
            await loadSessionOptions();
        } catch (error) {
            page.hidden = true;
            status.hidden = false;
            status.textContent = error.message;
        }
    })();
}
