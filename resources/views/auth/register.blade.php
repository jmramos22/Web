<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario - Tutorías UAS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 450px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"],
        input[type="email"],
        input[type="password"],
        select {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            width: 100%;
            padding: 10px;
            background-color: #004080;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover {
            background-color: #002b55;
        }
        .error-list {
            color: red;
            background-color: #fdd;
            padding: 10px 20px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .success-list {
            color: green;
            background-color: #dfd;
            padding: 10px 20px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>

    <h2>Registro de Usuario (Sprint 1)</h2>

    {{-- Contenedor para errores de la API --}}
    <div id="error-container" class="error-list" style="display: none;">
        <ul id="error-list"></ul>
    </div>

    {{-- Contenedor para éxito --}}
    <div id="success-container" class="success-list" style="display: none;">
        ¡Registro exitoso! Redirigiendo...
    </div>

    <form id="register-form">

        <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" required>
        </div>

        <div class="form-group">
            <label for="apellido">Apellido:</label>
            <input type="text" id="apellido" name="apellido" required>
        </div>

        <div class="form-group">
            <label for="correo_institucional">Correo Institucional (@uas.edu.mx):</label>
            <input type="email" id="correo_institucional" name="correo_institucional" placeholder="ejemplo@uas.edu.mx" required>
        </div>

        <div class="form-group">
            <label for="password">Contraseña (mínimo 8 caracteres):</label>
            <input type="password" id="password" name="password" required minlength="8">
        </div>

        <div class="form-group">
            <label for="carrera">Carrera:</label>
            <select id="carrera" name="carrera" required>
                <option value="">-- Cargando carreras... --</option>
            </select>
        </div>

        <button type="submit">Registrarse</button>
    </form>

    <script>
    // =============================================
    // 1. Cargar carreras desde la API (con el diseño intacto)
    // =============================================
    (async () => {
        try {
            const res = await fetch('http://127.0.0.1:8001/api/carreras', {
                headers: { 'Accept': 'application/json' }
            });
            const carreras = await res.json();
            const select = document.getElementById('carrera');
            select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
            carreras.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.nombre;
                opt.textContent = c.nombre;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error('Error al cargar carreras:', err);
            document.getElementById('carrera').innerHTML =
                '<option value="">-- Error al cargar carreras --</option>';
        }
    })();

    // =============================================
    // 2. Enviar el formulario a la API
    // =============================================
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const errorContainer = document.getElementById('error-container');
        const errorList = document.getElementById('error-list');
        const successContainer = document.getElementById('success-container');

        // Ocultar mensajes previos
        errorContainer.style.display = 'none';
        successContainer.style.display = 'none';
        errorList.innerHTML = '';

        try {
            const res = await fetch('http://127.0.0.1:8001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    nombre: form.nombre.value,
                    apellido: form.apellido.value,
                    correo_institucional: form.correo_institucional.value,
                    password: form.password.value,
                    carrera: form.carrera.value,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Éxito: guardar token y redirigir
                localStorage.setItem('auth_token', data.token);
                successContainer.style.display = 'block';
                setTimeout(() => window.location.href = '/dashboard', 1500);
            } else {
                // Error de validación: mostrar lista de errores
                errorContainer.style.display = 'block';
                if (data.errors) {
                    Object.values(data.errors).flat().forEach(msg => {
                        const li = document.createElement('li');
                        li.textContent = msg;
                        errorList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = data.message || 'Error al registrarse';
                    errorList.appendChild(li);
                }
            }
        } catch (err) {
            // Error de conexión con la API
            errorContainer.style.display = 'block';
            const li = document.createElement('li');
            li.textContent = 'Error de conexión con la API. ¿Está corriendo en el puerto 8001?';
            errorList.appendChild(li);
            console.error(err);
        }
    });
    </script>

</body>
</html>