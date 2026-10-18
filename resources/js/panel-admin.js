// Inicializa la sesión, la navegación y las operaciones de administración al cargar la página.
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('auth_token'); 
    if (!token) {
        window.location.href = '/login';
        return;
    }

    document.body.style.display = 'flex';

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const apiBaseUrl = document.getElementById('admin-panel').dataset.apiBaseUrl;
    const careerForm = document.getElementById('form-carrera');
    const careerNameInput = document.getElementById('nombre-carrera');
    const semesterEditor = document.getElementById('career-semester-editor');
    const careerEditorTitle = document.getElementById('career-editor-title');
    const careerSubmit = document.getElementById('career-submit');
    const careerCancelEdit = document.getElementById('career-cancel-edit');
    const careerEditorStatus = document.getElementById('career-editor-status');

    // --- LÓGICA DE PESTAÑAS (MENÚ LATERAL) ---
    const navUsuarios = document.getElementById('nav-usuarios');
    const navCarreras = document.getElementById('nav-carreras');
    const navSolicitudes = document.getElementById('nav-solicitudes');
    const navPostulaciones = document.getElementById('nav-postulaciones');
    const secUsuarios = document.getElementById('section-usuarios');
    const secCarreras = document.getElementById('section-carreras');
    const secSolicitudes = document.getElementById('section-solicitudes');
    const secPostulaciones = document.getElementById('section-postulaciones');

    const adminSections = [
        { navigation: navUsuarios, section: secUsuarios },
        { navigation: navCarreras, section: secCarreras },
        { navigation: navSolicitudes, section: secSolicitudes },
        { navigation: navPostulaciones, section: secPostulaciones },
    ];

    /**
     * Activa una sección administrativa y oculta las otras para mantener una sola vista.
     */
    function showAdminSection(selectedSection) {
        adminSections.forEach(({ navigation, section }) => {
            const isSelected = section === selectedSection;
            navigation.classList.toggle('active', isSelected);
            section.style.display = isSelected ? 'block' : 'none';
        });
    }

    // Conecta cada opción del menú con su sección correspondiente.
    adminSections.forEach(({ navigation, section }) => {
        navigation.addEventListener('click', (event) => {
            event.preventDefault();
            showAdminSection(section);
        });
    });

    // --- LÓGICA DE DATOS: CARRERAS ---
    function addSemesterEditor(semester = null) {
        const item = document.createElement('fieldset');
        item.className = 'career-semester-editor-item';

        const heading = document.createElement('div');
        heading.className = 'career-semester-editor-heading';
        const numberLabel = document.createElement('label');
        numberLabel.textContent = 'Semestre';
        const numberInput = document.createElement('input');
        numberInput.type = 'number';
        numberInput.min = '1';
        numberInput.max = '20';
        numberInput.required = true;
        numberInput.value = semester?.numero || semesterEditor.querySelectorAll('.career-semester-editor-item').length + 1;
        numberInput.dataset.semesterNumber = '';
        numberLabel.appendChild(numberInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'career-remove-semester';
        removeButton.textContent = 'Quitar semestre';
        removeButton.addEventListener('click', () => item.remove());
        heading.append(numberLabel, removeButton);

        const subjectsLabel = document.createElement('label');
        subjectsLabel.textContent = 'Materias (una por línea)';
        const subjectsInput = document.createElement('textarea');
        subjectsInput.rows = 3;
        subjectsInput.required = true;
        subjectsInput.placeholder = 'Ejemplo: Álgebra lineal';
        subjectsInput.dataset.semesterSubjects = '';
        subjectsInput.value = semester?.materias.map((subject) => subject.nombre).join('\n') || '';
        subjectsLabel.appendChild(subjectsInput);
        item.append(heading, subjectsLabel);
        semesterEditor.appendChild(item);
    }

    function resetCareerEditor() {
        careerForm.reset();
        careerForm.dataset.careerId = '';
        semesterEditor.replaceChildren();
        careerEditorTitle.textContent = 'Agregar carrera y plan de estudios';
        careerSubmit.textContent = '+ Agregar carrera';
        careerCancelEdit.hidden = true;
        careerEditorStatus.hidden = true;
    }

    function editCareer(career) {
        careerForm.dataset.careerId = career.id;
        careerNameInput.value = career.nombre;
        semesterEditor.replaceChildren();
        career.semestres.forEach((semester) => addSemesterEditor(semester));
        careerEditorTitle.textContent = `Editar carrera y plan de estudios`;
        careerSubmit.textContent = 'Guardar cambios';
        careerCancelEdit.hidden = false;
        careerEditorStatus.hidden = true;
        careerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        careerNameInput.focus({ preventScroll: true });
    }

    function buildCareerPayload() {
        const semesters = [...semesterEditor.querySelectorAll('.career-semester-editor-item')]
            .map((item) => ({
                numero: Number(item.querySelector('[data-semester-number]').value),
                materias: item.querySelector('[data-semester-subjects]').value
                    .split(/\r?\n/)
                    .map((name) => name.trim())
                    .filter(Boolean),
            }));

        if (semesters.some((semester) => semester.materias.length === 0)) {
            throw new Error('Cada semestre agregado debe tener al menos una materia.');
        }

        return {
            nombre: careerNameInput.value.trim(),
            semestres: semesters,
        };
    }

    document.getElementById('add-semester').addEventListener('click', () => addSemesterEditor());
    careerCancelEdit.addEventListener('click', resetCareerEditor);

    // Obtiene las carreras de la API y actualiza la lista del catálogo.
    async function loadCarreras() {
        const careerStatus = document.getElementById('admin-careers-status');
        try {
            const res = await fetch(`${apiBaseUrl}/api/admin/carreras`, { headers });
            const carreras = await res.json();

            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }
            if (!res.ok) {
                throw new Error(carreras.message || 'No se pudieron cargar las carreras.');
            }

            const list = document.getElementById('lista-carreras');
            list.replaceChildren();

            carreras.forEach((career) => {
                const item = document.createElement('li');
                item.className = 'career-catalog-item';

                const heading = document.createElement('div');
                heading.className = 'career-catalog-heading';
                const info = document.createElement('div');
                info.className = 'user-info-list';
                const name = document.createElement('strong');
                name.textContent = career.nombre;
                const status = document.createElement('span');
                status.textContent = career.activa ? 'Activa' : 'Inactiva';
                info.append(name, status);

                const editButton = document.createElement('button');
                editButton.type = 'button';
                editButton.className = 'career-edit-button';
                editButton.textContent = 'Editar plan de estudios';
                editButton.addEventListener('click', () => editCareer(career));
                heading.append(info, editButton);
                item.appendChild(heading);

                career.semestres.forEach((semester) => {
                    const semesterRow = document.createElement('div');
                    semesterRow.className = 'career-semester-row';
                    const semesterName = document.createElement('strong');
                    semesterName.textContent = `Semestre ${semester.numero}: `;
                    const subjects = document.createElement('span');
                    subjects.textContent = semester.materias.map((subject) => subject.nombre).join(' · ');
                    semesterRow.append(semesterName, subjects);
                    item.appendChild(semesterRow);
                });

                if (career.semestres.length === 0) {
                    const emptyPlan = document.createElement('span');
                    emptyPlan.className = 'career-empty-plan';
                    emptyPlan.textContent = 'Plan de estudios pendiente de registro.';
                    item.appendChild(emptyPlan);
                }

                list.appendChild(item);
            });
            careerStatus.hidden = true;
        } catch (error) {
            careerStatus.hidden = false;
            careerStatus.textContent = error.message;
        }
    }

    careerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        careerSubmit.disabled = true;
        careerEditorStatus.hidden = true;

        try {
            const payload = buildCareerPayload();
            const careerId = careerForm.dataset.careerId;
            const response = await fetch(
                `${apiBaseUrl}/api/admin/carreras${careerId ? `/${careerId}` : ''}`,
                {
                    method: careerId ? 'PUT' : 'POST',
                    headers,
                    body: JSON.stringify(payload),
                },
            );
            const result = await response.json();

            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }
            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : '';
                throw new Error(validationMessage || result.message || 'No se pudo guardar la carrera y su plan.');
            }

            resetCareerEditor();
            careerEditorStatus.hidden = false;
            careerEditorStatus.textContent = result.message;
            await loadCarreras();
        } catch (error) {
            careerEditorStatus.hidden = false;
            careerEditorStatus.textContent = error.message;
        } finally {
            careerSubmit.disabled = false;
        }
    });

    // --- LÓGICA DE DATOS: USUARIOS ---
    // Obtiene los usuarios y genera sus controles para consultar o cambiar roles.
    async function loadUsers() {
        const list = document.getElementById('lista-usuarios');
        const usersStatus = document.getElementById('admin-users-status');

        try {
            const res = await fetch(`${apiBaseUrl}/api/admin/users`, { headers });
            const users = await res.json();

            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }
            if (!res.ok) {
                throw new Error(users.message || 'No se pudieron cargar los usuarios.');
            }

            list.replaceChildren();
            users.forEach((user) => {
                const item = document.createElement('li');
                item.className = 'admin-user-item';

                const info = document.createElement('div');
                info.className = 'user-info-list';
                const name = document.createElement('strong');
                name.textContent = `${user.nombre} ${user.apellido}`;
                const email = document.createElement('span');
                email.textContent = user.correo_institucional;
                const accountStatus = document.createElement('span');
                accountStatus.className = user.is_active ? 'user-status-active' : 'user-status-inactive';
                accountStatus.textContent = user.is_active ? 'Cuenta activa' : 'Cuenta dada de baja';
                info.append(name, email, accountStatus);

                const controls = document.createElement('div');
                controls.className = 'admin-user-controls';
                const roleSelect = document.createElement('select');
                roleSelect.className = 'role-select';
                roleSelect.setAttribute('aria-label', `Rol de ${user.nombre} ${user.apellido}`);
                roleSelect.disabled = !user.is_active;
                [
                    ['ESTUDIANTE', 'Estudiante'],
                    ['TUTOR', 'Tutor (por postulación)'],
                    ['ADMIN', 'Administrador'],
                ].forEach(([value, label]) => {
                    const option = new Option(label, value, false, user.rol === value);
                    if (value === 'TUTOR') {
                        option.disabled = true;
                    }
                    roleSelect.add(option);
                });
                roleSelect.addEventListener('change', () => window.updateRole(user.id_usuario, roleSelect.value));

                const statusButton = document.createElement('button');
                statusButton.type = 'button';
                statusButton.className = user.is_active ? 'user-deactivate-button' : 'user-reactivate-button';
                statusButton.dataset.userStatusId = user.id_usuario;
                statusButton.dataset.nextActive = user.is_active ? 'false' : 'true';
                statusButton.textContent = user.is_active ? 'Dar de baja' : 'Reactivar';
                controls.append(roleSelect, statusButton);

                item.append(info, controls);
                list.appendChild(item);
            });
            usersStatus.hidden = true;
        } catch (error) {
            usersStatus.hidden = false;
            usersStatus.textContent = error.message;
        }
    }

    document.getElementById('lista-usuarios').addEventListener('click', async (event) => {
        const button = event.target.closest('[data-user-status-id]');
        if (!button) {
            return;
        }

        const isActive = button.dataset.nextActive === 'true';
        const action = isActive ? 'reactivar' : 'dar de baja';
        const statusMessage = document.getElementById('admin-users-status');
        if (!window.confirm(`¿Confirmas ${action} esta cuenta?${isActive ? '' : ' Se cerrarán sus sesiones y conservará su historial.'}`)) {
            return;
        }

        button.disabled = true;
        statusMessage.hidden = true;
        try {
            const response = await fetch(
                `${apiBaseUrl}/api/admin/users/${button.dataset.userStatusId}/status`,
                {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ is_active: isActive }),
                },
            );
            const result = await response.json();

            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }
            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : '';
                throw new Error(validationMessage || result.message || 'No se pudo actualizar el estado de la cuenta.');
            }

            statusMessage.hidden = false;
            statusMessage.textContent = result.message;
            await loadUsers();
        } catch (error) {
            statusMessage.hidden = false;
            statusMessage.textContent = error.message;
        }
    });

    /**
     * Consulta todas las solicitudes para supervisión, sin exponer controles de modificación.
     */
    async function loadAdminRequests() {
        const requestStatus = document.getElementById('admin-requests-status');
        const requestList = document.getElementById('lista-solicitudes');
        requestStatus.textContent = 'Cargando solicitudes...';
        requestList.replaceChildren();

        try {
            const response = await fetch(`${apiBaseUrl}/api/tutoring/requests`, { headers });
            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }

            async function loadTutorApplications() {
                const applicationStatus = document.getElementById('admin-tutor-applications-status');
                const applicationList = document.getElementById('lista-postulaciones-tutor');
                applicationStatus.hidden = false;
                applicationStatus.textContent = 'Cargando postulaciones...';
                applicationList.replaceChildren();

                try {
                    const response = await fetch(`${apiBaseUrl}/api/admin/tutor-applications`, { headers });
                    const applications = await response.json();

                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.replace('/login');
                        return;
                    }
                    if (!response.ok) {
                        throw new Error(applications.message || 'No se pudieron cargar las postulaciones.');
                    }
                    if (!applications.length) {
                        applicationStatus.textContent = 'No hay postulaciones pendientes de revisión.';
                        return;
                    }

                    applicationStatus.hidden = true;
                    applications.forEach((application) => {
                        const item = document.createElement('li');
                        item.className = 'tutor-application-item';
                        const info = document.createElement('div');
                        info.className = 'user-info-list application-info';

                        const name = document.createElement('strong');
                        name.textContent = `${application.student.nombre} ${application.student.apellido}`;
                        const details = document.createElement('span');
                        details.textContent = `${application.student.correo_institucional} · ${application.student.carrera}`;

                        const subjects = document.createElement('p');
                        const subjectSummary = application.materias
                            .map((subject) => `Semestre ${subject.semestre?.numero}: ${subject.nombre}`)
                            .join(' · ');
                        subjects.textContent = `Materias solicitadas: ${subjectSummary || 'No especificadas'}`;

                        const topics = document.createElement('p');
                        topics.textContent = `Temas que domina: ${application.temas_dominados || 'No especificados'}`;
                        info.append(name, details, subjects, topics);

                        const actions = document.createElement('div');
                        actions.className = 'application-actions';

                        const download = document.createElement('button');
                        download.type = 'button';
                        download.dataset.downloadApplication = application.id;
                        download.textContent = 'Descargar kardex';

                        const approve = document.createElement('button');
                        approve.type = 'button';
                        approve.dataset.applicationId = application.id;
                        approve.dataset.decision = 'APROBADA';
                        approve.textContent = 'Aprobar';

                        const reject = document.createElement('button');
                        reject.type = 'button';
                        reject.dataset.applicationId = application.id;
                        reject.dataset.decision = 'RECHAZADA';
                        reject.textContent = 'Rechazar';

                        actions.append(download, approve, reject);
                        item.append(info, actions);
                        applicationList.appendChild(item);
                    });
                } catch (error) {
                    applicationStatus.hidden = false;
                    applicationStatus.textContent = error.message;
                }
            }

            async function downloadApplicationKardex(applicationId, button) {
                button.disabled = true;
                try {
                    const response = await fetch(
                        `${apiBaseUrl}/api/admin/tutor-applications/${applicationId}/kardex`,
                        { headers },
                    );
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.replace('/login');
                        return;
                    }
                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.message || 'No se pudo descargar el kardex.');
                    }

                    const fileUrl = URL.createObjectURL(await response.blob());
                    const downloadLink = document.createElement('a');
                    downloadLink.href = fileUrl;
                    const filename = response.headers.get('Content-Disposition')
                        ?.match(/filename="?([^";]+)"?/i)?.[1];
                    downloadLink.download = filename || `kardex-postulacion-${applicationId}`;
                    downloadLink.click();
                    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                } catch (error) {
                    document.getElementById('admin-tutor-applications-status').textContent = error.message;
                    document.getElementById('admin-tutor-applications-status').hidden = false;
                } finally {
                    button.disabled = false;
                }
            }

            document.getElementById('lista-postulaciones-tutor').addEventListener('click', async (event) => {
                const downloadButton = event.target.closest('[data-download-application]');
                if (downloadButton) {
                    await downloadApplicationKardex(downloadButton.dataset.downloadApplication, downloadButton);
                    return;
                }

                const decisionButton = event.target.closest('[data-decision]');
                if (!decisionButton) {
                    return;
                }

                const decision = decisionButton.dataset.decision;
                const confirmation = decision === 'APROBADA'
                    ? '¿Aprobar esta postulación y asignar el rol de tutor?'
                    : '¿Rechazar esta postulación? El usuario conservará su rol de estudiante.';
                if (!window.confirm(confirmation)) {
                    return;
                }

                decisionButton.disabled = true;
                try {
                    const response = await fetch(
                        `${apiBaseUrl}/api/admin/tutor-applications/${decisionButton.dataset.applicationId}`,
                        {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({ decision }),
                        },
                    );
                    const result = await response.json();
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.replace('/login');
                        return;
                    }
                    if (!response.ok) {
                        throw new Error(result.message || 'No se pudo actualizar la postulación.');
                    }

                    await Promise.all([loadTutorApplications(), loadUsers()]);
                } catch (error) {
                    const applicationStatus = document.getElementById('admin-tutor-applications-status');
                    applicationStatus.hidden = false;
                    applicationStatus.textContent = error.message;
                    decisionButton.disabled = false;
                }
            });

            loadTutorApplications();

            const requests = await response.json();

            if (!response.ok) {
                throw new Error(requests.message || 'No se pudieron cargar las solicitudes.');
            }

            if (requests.length === 0) {
                requestStatus.textContent = 'Todavía no se han enviado solicitudes de tutoría.';
                return;
            }

            requestStatus.hidden = true;
            requests.forEach((request) => {
                const item = document.createElement('li');
                const info = document.createElement('div');
                info.className = 'request-info-list';

                const subject = document.createElement('strong');
                subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';

                const participants = document.createElement('span');
                participants.textContent = `Estudiante: ${request.estudiante?.nombre || ''} ${request.estudiante?.apellido || ''} · Tutor: ${request.tutor?.nombre || ''} ${request.tutor?.apellido || ''}`;

                const date = document.createElement('span');
                date.textContent = new Intl.DateTimeFormat('es-MX', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }).format(new Date(request.fecha_hora));

                const badge = document.createElement('span');
                badge.className = `status-badge tutoring-status status-${request.estado.toLowerCase()}`;
                badge.textContent = request.estado;

                info.append(subject, participants, date);
                item.append(info, badge);
                requestList.appendChild(item);
            });
        } catch (error) {
            requestStatus.hidden = false;
            requestStatus.textContent = error.message;
        }
    }

    // Solicita confirmación, actualiza el rol en la API y sincroniza la lista de usuarios.
    window.updateRole = async function(idUsuario, nuevoRol) {
        if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${nuevoRol}?`)) {
            loadUsers(); // Recarga para deshacer la selección visual si el usuario cancela
            return; 
        }
        const res = await fetch(`${apiBaseUrl}/api/admin/users/${idUsuario}/rol`, {
            method: 'PUT', headers, body: JSON.stringify({ rol: nuevoRol })
        });
        if (res.ok) {
            loadUsers();
        } else {
            alert('Error al actualizar el rol.');
        }
    };

    // --- CERRAR SESIÓN ---
    // Cierra la sesión en la API y limpia las credenciales locales del administrador.
    document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch(`${apiBaseUrl}/api/logout`, { method: 'POST', headers });
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    });

    // Iniciar carga de datos
    loadCarreras();
    loadUsers();
    loadAdminRequests();
});