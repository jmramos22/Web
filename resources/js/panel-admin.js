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

    // =============================================
    // 1. Configuración de la API y elementos del DOM
    // =============================================
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

    // --- LÓGICA DE SECCIONES ADMINISTRATIVAS ---
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
        
        // Crea un editor de semestre con campos para el número y las materias, y un botón para eliminarlo.
        const item = document.createElement('fieldset');
        item.className = 'career-semester-editor-item';

        // Crea el encabezado del semestre con el número y el botón de eliminación.
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

        // Crea el botón de eliminación del semestre.
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'career-remove-semester';
        removeButton.textContent = 'Quitar semestre';
        removeButton.addEventListener('click', () => item.remove());
        heading.append(numberLabel, removeButton);

        // Crea el área de texto para las materias del semestre.
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

    // =============================================
    // 2. Restablece el formulario de carrera a su estado inicial.
    // =============================================
    function resetCareerEditor() {
        careerForm.reset();
        careerForm.dataset.careerId = '';
        semesterEditor.replaceChildren();
        careerEditorTitle.textContent = 'Agregar carrera y plan de estudios';
        careerSubmit.textContent = '+ Agregar carrera';
        careerCancelEdit.hidden = true;
        careerEditorStatus.hidden = true;
    }

    // =============================================
    // 3. Carga los datos de una carrera en el formulario para su edición.
    // =============================================
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

    // Construye la carga útil para enviar a la API, validando que cada semestre tenga al menos una materia.
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

    // Conecta los botones de agregar semestre y cancelar edición con sus funciones correspondientes.
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

            // Actualiza la lista de carreras en el DOM, mostrando su nombre, estado y plan de estudios.
            const list = document.getElementById('lista-carreras');
            list.replaceChildren();

            // Genera cada elemento de carrera con su información y controles de edición.
            carreras.forEach((career) => {
                const item = document.createElement('li');
                item.className = 'career-catalog-item';

                // Crea el encabezado de la carrera con su nombre, estado y botón de edición.
                const heading = document.createElement('div');
                heading.className = 'career-catalog-heading';
                const info = document.createElement('div');
                info.className = 'user-info-list';
                const name = document.createElement('strong');
                name.textContent = career.nombre;
                const status = document.createElement('span');
                status.textContent = career.activa ? 'Activa' : 'Inactiva';
                info.append(name, status);

                // Crea el botón de edición que carga la carrera en el formulario para su modificación.
                const editButton = document.createElement('button');
                editButton.type = 'button';
                editButton.className = 'career-edit-button';
                editButton.textContent = 'Editar plan de estudios';
                editButton.addEventListener('click', () => editCareer(career));
                heading.append(info, editButton);
                item.appendChild(heading);

                // Muestra el plan de estudios de la carrera, listando cada semestre y sus materias.
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

                // Si la carrera no tiene semestres registrados, muestra un mensaje indicando que el plan de estudios está pendiente.
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

    // Solicita confirmación, envía la carrera a la API y actualiza la lista de carreras.
    careerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        careerSubmit.disabled = true;
        careerEditorStatus.hidden = true;

        // Construye la carga útil para enviar a la API, validando que cada semestre tenga al menos una materia.
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
            // Analiza la respuesta de la API y maneja los errores o actualiza la lista de carreras según corresponda.
            const result = await response.json();


            // Maneja la respuesta de la API y muestra mensajes de éxito o error según corresponda.
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
            // Si la operación fue exitosa, restablece el formulario y actualiza la lista de carreras.
            resetCareerEditor();
            careerEditorStatus.hidden = false;
            careerEditorStatus.textContent = result.message;
            await loadCarreras();
            // Desplaza la vista hacia la lista de carreras para mostrar el resultado al usuario.
        } catch (error) {
            careerEditorStatus.hidden = false;
            careerEditorStatus.textContent = error.message;
            // Desplaza la vista hacia el mensaje de estado para que el usuario pueda ver el error.
        } finally {
            careerSubmit.disabled = false;
        }
    });

    // --- LÓGICA DE DATOS: USUARIOS ---
    // Obtiene los usuarios y genera sus controles para consultar o cambiar roles.
    async function loadUsers() {
        const list = document.getElementById('lista-usuarios');
        const usersStatus = document.getElementById('admin-users-status');

        // Muestra un mensaje de carga mientras se obtienen los usuarios de la API.
        try {
            const res = await fetch(`${apiBaseUrl}/api/admin/users`, { headers });
            const users = await res.json();

            // Maneja la respuesta de la API y muestra mensajes de error si es necesario.
            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }
            if (!res.ok) {
                throw new Error(users.message || 'No se pudieron cargar los usuarios.');
            }

            // Actualiza la lista de usuarios en el DOM, mostrando su nombre, correo, estado y controles para cambiar roles o dar de baja/reactivar cuentas.
            list.replaceChildren();
            users.forEach((user) => {
                const item = document.createElement('li');
                item.className = 'admin-user-item';

                // Crea la sección de información del usuario con su nombre, correo y estado de la cuenta.
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

                // Crea los controles para cambiar el rol del usuario y dar de baja/reactivar la cuenta según corresponda.
                const controls = document.createElement('div');
                controls.className = 'admin-user-controls';
                const roleSelect = document.createElement('select');
                roleSelect.className = 'role-select';
                roleSelect.setAttribute('aria-label', `Rol de ${user.nombre} ${user.apellido}`);
                roleSelect.disabled = !user.is_active;
                // Agrega las opciones de rol al select, deshabilitando la opción de tutor para evitar cambios directos.
                [
                    ['ESTUDIANTE', 'Estudiante'],
                    ['TUTOR', 'Tutor (por postulación)'],
                    ['ADMIN', 'Administrador'],
                    // Agrega más roles según sea necesario
                ].forEach(([value, label]) => {
                    const option = new Option(label, value, false, user.rol === value);
                    if (value === 'TUTOR') {
                        option.disabled = true;
                    }
                    roleSelect.add(option);
                });
                roleSelect.addEventListener('change', () => window.updateRole(user.id_usuario, roleSelect.value));

                // Crea el botón para dar de baja o reactivar la cuenta según el estado actual del usuario.
                const statusButton = document.createElement('button');
                statusButton.type = 'button';
                statusButton.className = user.is_active ? 'user-deactivate-button' : 'user-reactivate-button';
                statusButton.dataset.userStatusId = user.id_usuario;
                statusButton.dataset.nextActive = user.is_active ? 'false' : 'true';
                statusButton.textContent = user.is_active ? 'Dar de baja' : 'Reactivar';
                controls.append(roleSelect, statusButton);

                // Agrega la información y los controles al elemento de usuario y lo añade a la lista.
                item.append(info, controls);
                list.appendChild(item);
            });
            // Oculta el mensaje de estado al completar la carga de usuarios.
            usersStatus.hidden = true;
            // Desplaza la vista hacia la lista de usuarios para mostrar el resultado al usuario.
        } catch (error) {
            usersStatus.hidden = false;
            usersStatus.textContent = error.message;
        }
    }

    // Maneja los clics en los botones de dar de baja o reactivar cuentas, solicitando confirmación y actualizando el estado del usuario en la API.
    document.getElementById('lista-usuarios').addEventListener('click', async (event) => {
        const button = event.target.closest('[data-user-status-id]');
        if (!button) {
            return;
        }
        // Solicita confirmación antes de cambiar el estado de la cuenta y actualiza la lista de usuarios después de la operación.
        const isActive = button.dataset.nextActive === 'true';
        const action = isActive ? 'reactivar' : 'dar de baja';
        const statusMessage = document.getElementById('admin-users-status');
        if (!window.confirm(`¿Confirmas ${action} esta cuenta?${isActive ? '' : ' Se cerrarán sus sesiones y conservará su historial.'}`)) {
            return;
        }
        // Deshabilita el botón y muestra un mensaje de estado mientras se realiza la operación.
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

            // Maneja la respuesta de la API y muestra mensajes de éxito o error según corresponda.
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

            // Si la operación fue exitosa, actualiza la lista de usuarios y muestra un mensaje de éxito.
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
        // Muestra un mensaje de estado mientras se cargan las solicitudes de la API.
        const requestStatus = document.getElementById('admin-requests-status');
        const requestList = document.getElementById('lista-solicitudes');
        requestStatus.textContent = 'Cargando solicitudes...';
        requestList.replaceChildren();

        // Solicita las solicitudes de la API y maneja la respuesta, mostrando errores si es necesario.
        try {
            const response = await fetch(`${apiBaseUrl}/api/tutoring/requests`, { headers });
            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.replace('/login');
                return;
            }
            // Analiza la respuesta de la API y maneja los errores o actualiza la lista de solicitudes según corresponda.
            async function loadTutorApplications() {
                const applicationStatus = document.getElementById('admin-tutor-applications-status');
                const applicationList = document.getElementById('lista-postulaciones-tutor');
                applicationStatus.hidden = false;
                applicationStatus.textContent = 'Cargando postulaciones...';
                applicationList.replaceChildren();
                // Solicita las postulaciones de la API y maneja la respuesta, mostrando errores si es necesario.
                try {
                    const response = await fetch(`${apiBaseUrl}/api/admin/tutor-applications`, { headers });
                    const applications = await response.json();

                    // Maneja la respuesta de la API y muestra mensajes de éxito o error según corresponda.
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
                    // Oculta el mensaje de estado al completar la carga de postulaciones y genera los elementos de la lista con la información de cada postulación.
                    applicationStatus.hidden = true;
                    applications.forEach((application) => {
                        const item = document.createElement('li');
                        item.className = 'tutor-application-item';
                        const info = document.createElement('div');
                        info.className = 'user-info-list application-info';

                        // Crea los elementos de información de la postulación, incluyendo el nombre del estudiante, correo, carrera, materias solicitadas y temas dominados.
                        const name = document.createElement('strong');
                        name.textContent = `${application.student.nombre} ${application.student.apellido}`;
                        const details = document.createElement('span');
                        details.textContent = `${application.student.correo_institucional} · ${application.student.carrera}`;

                        // Crea los elementos de información de la postulación, incluyendo las materias solicitadas y los temas que domina el estudiante.
                        const subjects = document.createElement('p');
                        const subjectSummary = application.materias
                            .map((subject) => `Semestre ${subject.semestre?.numero}: ${subject.nombre}`)
                            .join(' · ');
                        subjects.textContent = `Materias solicitadas: ${subjectSummary || 'No especificadas'}`;

                        // Crea los elementos de información de la postulación, incluyendo los temas que domina el estudiante.
                        const topics = document.createElement('p');
                        topics.textContent = `Temas que domina: ${application.temas_dominados || 'No especificados'}`;
                        info.append(name, details, subjects, topics);

                        // Crea los botones de acción para descargar el kardex, aprobar o rechazar la postulación, y los añade al elemento de la lista.
                        const actions = document.createElement('div');
                        actions.className = 'application-actions';

                        // Crea el botón de descarga del kardex de la postulación.
                        const download = document.createElement('button');
                        download.type = 'button';
                        download.dataset.downloadApplication = application.id;
                        download.textContent = 'Descargar kardex';

                        // Crea los botones de aprobación y rechazo de la postulación, asignando los datos necesarios para identificar la postulación y la decisión tomada.
                        const approve = document.createElement('button');
                        approve.type = 'button';
                        approve.dataset.applicationId = application.id;
                        approve.dataset.decision = 'APROBADA';
                        approve.textContent = 'Aprobar';

                        // Crea el botón de rechazo de la postulación, asignando los datos necesarios para identificar la postulación y la decisión tomada.
                        const reject = document.createElement('button');
                        reject.type = 'button';
                        reject.dataset.applicationId = application.id;
                        reject.dataset.decision = 'RECHAZADA';
                        reject.textContent = 'Rechazar';

                        // Agrega los botones de acción al contenedor y añade la información y los controles al elemento de la lista.
                        actions.append(download, approve, reject);
                        item.append(info, actions);
                        applicationList.appendChild(item);
                    });
                    // Oculta el mensaje de estado al completar la carga de postulaciones y desplaza la vista hacia la lista para mostrar el resultado al usuario.
                } catch (error) {
                    applicationStatus.hidden = false;
                    applicationStatus.textContent = error.message;
                }
            }

            // Función para descargar el kardex de una postulación.
            async function downloadApplicationKardex(applicationId, button) {
                button.disabled = true;
                // Muestra un mensaje de estado mientras se descarga el kardex de la postulación.
                try {
                    // Solicita el kardex de la postulación a la API y maneja la respuesta, mostrando errores si es necesario.
                    const response = await fetch(
                        `${apiBaseUrl}/api/admin/tutor-applications/${applicationId}/kardex`,
                        { headers },
                    );
                    // Maneja la respuesta de la API y muestra mensajes de éxito o error según corresponda.
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.replace('/login');
                        return;
                    }
                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.message || 'No se pudo descargar el kardex.');
                    }

                    // Crea un enlace temporal para descargar el archivo del kardex y lo activa automáticamente.
                    const fileUrl = URL.createObjectURL(await response.blob());
                    const downloadLink = document.createElement('a');
                    downloadLink.href = fileUrl;
                    const filename = response.headers.get('Content-Disposition')
                        ?.match(/filename="?([^";]+)"?/i)?.[1];
                    downloadLink.download = filename || `kardex-postulacion-${applicationId}`;
                    downloadLink.click();
                    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                } catch (error) {
                    // Muestra un mensaje de error si no se pudo descargar el kardex de la postulación.
                    document.getElementById('admin-tutor-applications-status').textContent = error.message;
                    document.getElementById('admin-tutor-applications-status').hidden = false;
                } finally {
                    // Habilita el botón de descarga nuevamente después de completar la operación.
                    button.disabled = false;
                }
            }

            // Maneja los clics en los botones de descarga, aprobación y rechazo de las postulaciones, solicitando confirmación y actualizando la lista de postulaciones después de la operación.
            document.getElementById('lista-postulaciones-tutor').addEventListener('click', async (event) => {
                const downloadButton = event.target.closest('[data-download-application]');
                if (downloadButton) {
                    await downloadApplicationKardex(downloadButton.dataset.downloadApplication, downloadButton);
                    return;
                }

                // Maneja los clics en los botones de aprobación y rechazo de las postulaciones, solicitando confirmación y actualizando la lista de postulaciones después de la operación.
                const decisionButton = event.target.closest('[data-decision]');
                if (!decisionButton) {
                    return;
                }

                // Solicita confirmación antes de aprobar o rechazar la postulación y actualiza la lista de postulaciones después de la operación.
                const decision = decisionButton.dataset.decision;
                const confirmation = decision === 'APROBADA'
                    ? '¿Aprobar esta postulación y asignar el rol de tutor?'
                    : '¿Rechazar esta postulación? El usuario conservará su rol de estudiante.';
                if (!window.confirm(confirmation)) {
                    return;
                }

                // Deshabilita el botón de decisión y muestra un mensaje de estado mientras se realiza la operación.
                decisionButton.disabled = true;
                try {
                    // Envía la decisión de aprobación o rechazo a la API y maneja la respuesta, mostrando errores si es necesario.
                    const response = await fetch(
                        `${apiBaseUrl}/api/admin/tutor-applications/${decisionButton.dataset.applicationId}`,
                        {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({ decision }),
                        },
                    );
                    // Analiza la respuesta de la API y maneja los errores o actualiza la lista de postulaciones según corresponda.
                    const result = await response.json();
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        window.location.replace('/login');
                        return;
                    }
                    if (!response.ok) {
                        throw new Error(result.message || 'No se pudo actualizar la postulación.');
                    }

                    // Si la operación fue exitosa, actualiza la lista de postulaciones y muestra un mensaje de éxito.
                    await Promise.all([loadTutorApplications(), loadUsers()]);
                } catch (error) {
                    const applicationStatus = document.getElementById('admin-tutor-applications-status');
                    applicationStatus.hidden = false;
                    applicationStatus.textContent = error.message;
                    decisionButton.disabled = false;
                }
            });

            // Inicia la carga de postulaciones de tutoría al cargar la sección de solicitudes administrativas.
            loadTutorApplications();

            const requests = await response.json();
            // Maneja la respuesta de la API y muestra mensajes de éxito o error según corresponda.
            if (!response.ok) {
                throw new Error(requests.message || 'No se pudieron cargar las solicitudes.');
            }
            // Si no hay solicitudes, muestra un mensaje indicando que no se han enviado solicitudes de tutoría.
            if (requests.length === 0) {
                requestStatus.textContent = 'Todavía no se han enviado solicitudes de tutoría.';
                return;
            }

            // Oculta el mensaje de estado al completar la carga de solicitudes y genera los elementos de la lista con la información de cada solicitud.
            requestStatus.hidden = true;

            // Genera cada elemento de solicitud con su información y estado, incluyendo el nombre del estudiante, tutor, materia, fecha y hora, y un distintivo de estado.
            requests.forEach((request) => {
                // Crea un elemento de lista para cada solicitud, mostrando la información relevante y el estado de la solicitud.
                const item = document.createElement('li');
                const info = document.createElement('div');
                info.className = 'request-info-list';

                // Crea los elementos de información de la solicitud, incluyendo la materia, los participantes (estudiante y tutor), la fecha y hora, y un distintivo de estado.
                const subject = document.createElement('strong');
                subject.textContent = request.materia?.nombre || request.materia_nombre || 'Materia no disponible';

                // Crea los elementos de información de la solicitud, incluyendo los participantes (estudiante y tutor) y la fecha y hora de la solicitud.
                const participants = document.createElement('span');
                participants.textContent = `Estudiante: ${request.estudiante?.nombre || ''} ${request.estudiante?.apellido || ''} · Tutor: ${request.tutor?.nombre || ''} ${request.tutor?.apellido || ''}`;

                // Crea los elementos de información de la solicitud, incluyendo la fecha y hora de la solicitud, formateada según la configuración regional.
                const date = document.createElement('span');
                date.textContent = new Intl.DateTimeFormat('es-MX', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }).format(new Date(request.fecha_hora));

                // Crea un distintivo de estado para la solicitud, mostrando si está pendiente, aprobada o rechazada, con un estilo visual que indica el estado.
                const badge = document.createElement('span');
                badge.className = `status-badge tutoring-status status-${request.estado.toLowerCase()}`;
                badge.textContent = request.estado;

                // Agrega la información y el distintivo de estado al elemento de la lista y lo añade a la lista de solicitudes.
                info.append(subject, participants, date);
                item.append(info, badge);
                requestList.appendChild(item);
            });
            // Oculta el mensaje de estado al completar la carga de solicitudes y desplaza la vista hacia la lista para mostrar el resultado al usuario.
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
        // Envía la solicitud de actualización de rol a la API y maneja la respuesta, mostrando errores si es necesario.
        const res = await fetch(`${apiBaseUrl}/api/admin/users/${idUsuario}/rol`, {
            method: 'PUT', headers, body: JSON.stringify({ rol: nuevoRol })
        });
        // Analiza la respuesta de la API y maneja los errores o actualiza la lista de usuarios según corresponda.
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