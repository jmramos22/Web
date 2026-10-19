// =============================================
// Este archivo maneja la lógica de registro de usuarios, incluyendo la carga de carreras desde la API y el envío del formulario de registro.
// =============================================
const form = document.getElementById('register-form');
const apiBaseUrl = form.dataset.apiBaseUrl;

// =============================================
// 1. Cargar carreras desde la API (con el diseño intacto)
// =============================================
// Consulta las carreras disponibles y las agrega como opciones del selector del formulario.
(async () => {
    try {
        // Solicita la lista de carreras a la API y maneja errores de conexión o respuesta.
        const res = await fetch(`${apiBaseUrl}/api/carreras`, {
            headers: { 'Accept': 'application/json' }
        });
        // Verifica si la respuesta de la API es exitosa; si no, lanza un error con el código de estado HTTP.
        if (!res.ok) {
            throw new Error(`No se pudieron cargar las carreras (HTTP ${res.status}).`);
        }

        //Analiza la respuesta JSON de la API y llena el selector de carreras con las opciones recibidas.
        const carreras = await res.json();
        const select = document.getElementById('carrera');
        select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';

        // Crea una opción seleccionable por cada carrera recibida de la API.
        carreras.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.nombre;
            opt.textContent = c.nombre;
            select.appendChild(opt);
        });
        // Maneja errores de la conexion con la API y muestra un mensaje de error en el selector 
    } catch (err) {
        console.error('Error al cargar carreras:', err);
        document.getElementById('carrera').innerHTML =
            '<option value="">-- Error al cargar carreras --</option>';
    }
})();

// =============================================
// 2. Enviar el formulario a la API
// =============================================
// Envía los datos de registro, presenta la respuesta y guarda el token cuando hay éxito.
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorContainer = document.getElementById('error-container');
    const errorList = document.getElementById('error-list');
    const successContainer = document.getElementById('success-container');
    const submitButton = form.querySelector('button[type="submit"]');

    // Ocultar mensajes previos
    errorContainer.style.display = 'none';
    successContainer.style.display = 'none';
    errorList.innerHTML = '';
    submitButton.disabled = true;

    try {
        // Realizar peticion POST a la API para registrar un nuevo usuario
        const res = await fetch(`${apiBaseUrl}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },

            // Enviar datos del formulario convertidos a formato JSON
            body: JSON.stringify({
                nombre: form.nombre.value,
                apellido: form.apellido.value,
                correo_institucional: form.correo_institucional.value,
                password: form.password.value,
                carrera: form.carrera.value,
            }),
        });

        // Procesar la respuesta JSON del servidor
        const data = await res.json();

        // Caso 1: La API responde OK (200), pero no envia el token de autenticacion
        if (res.ok && !data.token) {
            errorContainer.style.display = 'block';
            const li = document.createElement('li');
            li.textContent = 'La API no devolvió el token de acceso. Intenta nuevamente o contacta al administrador.';
            errorList.appendChild(li);

            // Caso 2: Registro exitoso y recepcion del token
        } else if (res.ok) {
            //Guardar el token de autenticacion en la sesion local del navegador 
            localStorage.setItem('auth_token', data.token);
            // Ocultar el formulario y mostrar el mensaje de exito
            form.style.display = 'none';
            successContainer.style.display = 'block';

            // Caso 3: La API devuelve un error de validacion o del servidor (4xx o 5xx)
        } else {
            errorContainer.style.display = 'block';
            
            // Si hay errores especificos por campo, listarlos todos
            if (data.errors) {
                Object.values(data.errors).flat().forEach(msg => {
                    const li = document.createElement('li');
                    li.textContent = msg;
                    errorList.appendChild(li);
                });
                
            } else {
                // Mostrar mensaje generico entregado por la API o un texto por defecto
                const li = document.createElement('li');
                li.textContent = data.message || 'Error al registrarse';
                errorList.appendChild(li);
            }
        }
        // Captura fallos en la red o problemas al conectar con el servidor
    } catch (err) {
        // Error de conexión con la API
        errorContainer.style.display = 'block';
        const li = document.createElement('li');
        li.textContent = 'No fue posible conectar con la API.';
        errorList.appendChild(li);
        console.error(err);
        // Hanilitar de nuevo el boton de envio sin importar si la peticion fue exitosa o fallo
    } finally {
        submitButton.disabled = false;
    }
});

// El usuario continúa al perfil después de crear la cuenta.
document.getElementById('continue-btn').addEventListener('click', () => {
    window.location.href = '/dashboard';
});
