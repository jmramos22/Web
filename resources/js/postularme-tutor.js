const token = localStorage.getItem('auth_token');
const page = document.getElementById('tutor-application-page');
const pageStatus = document.getElementById('tutor-application-page-status');
const applicationStatus = document.getElementById('tutor-application-status');
const applicationForm = document.getElementById('tutor-application-form');
const submitButton = document.getElementById('tutor-application-submit');
const subjectOptions = document.getElementById('tutor-application-subject-options');
const apiBaseUrl = page.dataset.apiBaseUrl;

async function applicationApiRequest(path, options = {}) {
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

async function loadApplicationStatus() {
    applicationStatus.textContent = 'Consultando el estado de tu postulación...';

    try {
        const application = await applicationApiRequest('/api/tutoring/application');

        if (application?.status === 'PENDIENTE') {
            applicationForm.hidden = true;
            applicationStatus.textContent = 'Tu postulación está pendiente de revisión por el administrador.';
            return;
        }

        applicationStatus.textContent = application?.status === 'RECHAZADA'
            ? 'Tu postulación anterior fue rechazada. Puedes enviar una nueva con un kardex actualizado.'
            : 'Completa la información para solicitar la revisión del administrador.';

        await loadApplicationSubjects();
        applicationForm.hidden = false;
    } catch (error) {
        applicationForm.hidden = true;
        applicationStatus.textContent = error.message;
    }
}

async function loadApplicationSubjects() {
    const options = await applicationApiRequest('/api/tutoring/options');
    subjectOptions.replaceChildren();

    if (!Array.isArray(options.materias) || !options.materias.length) {
        throw new Error('No hay materias disponibles para la carrera de tu perfil. Contacta al administrador.');
    }

    const subjectsBySemester = new Map();
    options.materias.forEach((subject) => {
        const semesterSubjects = subjectsBySemester.get(subject.semestre) || [];
        semesterSubjects.push(subject);
        subjectsBySemester.set(subject.semestre, semesterSubjects);
    });

    [...subjectsBySemester.entries()]
        .sort(([firstSemester], [secondSemester]) => firstSemester - secondSemester)
        .forEach(([semester, subjects]) => {
            const group = document.createElement('div');
            group.className = 'student-subject-semester';

            const heading = document.createElement('h3');
            heading.textContent = `Semestre ${semester}`;
            group.appendChild(heading);

            subjects.forEach((subject) => {
                const label = document.createElement('label');
                label.className = 'student-subject-option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'materias[]';
                checkbox.value = subject.id;

                const name = document.createElement('span');
                name.textContent = subject.nombre;
                label.append(checkbox, name);
                group.appendChild(label);
            });

            subjectOptions.appendChild(group);
        });
}

applicationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!applicationForm.querySelector('input[name="materias[]"]:checked')) {
        applicationStatus.textContent = 'Selecciona al menos una materia que quieras asesorar.';
        return;
    }

    submitButton.disabled = true;
    applicationStatus.textContent = 'Enviando tu postulación...';

    try {
        const result = await applicationApiRequest('/api/tutoring/application', {
            method: 'POST',
            body: new FormData(applicationForm),
        });
        applicationForm.reset();
        applicationForm.hidden = true;
        applicationStatus.textContent = result.message;
    } catch (error) {
        applicationStatus.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

if (!token) {
    window.location.replace('/login');
} else {
    (async () => {
        try {
            const user = await applicationApiRequest('/api/user');
            if (user.rol !== 'ESTUDIANTE') {
                window.location.replace(user.rol === 'TUTOR' ? '/panel/tutor' : '/panel-admin');
                return;
            }

            pageStatus.hidden = true;
            page.hidden = false;
            await loadApplicationStatus();
        } catch (error) {
            pageStatus.textContent = error.message;
        }
    })();
}
