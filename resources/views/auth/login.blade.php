<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Tutorías UAS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 50px auto;
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
        input[type="email"],
        input[type="password"] {
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
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .links {
            margin-top: 15px;
            text-align: center;
        }
    </style>
</head>
<body>

    <h2>Iniciar Sesión (HU-02)</h2>

    {{-- Contenedor para errores que vienen de la API --}}
    <div id="error-container" class="error-list" style="display: none;">
        <ul id="error-list"></ul>
    </div>

    <form id="login-form">

        <div class="form-group">
            <label for="correo_institucional">Correo Institucional:</label>
            <input type="email" id="correo_institucional" name="correo_institucional" required autofocus>
        </div>

        <div class="form-group">
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required>
        </div>

        <button type="submit">Ingresar</button>
    </form>

    <div class="links">
        <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
    </div>

    <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const errorContainer = document.getElementById('error-container');
        const errorList = document.getElementById('error-list');

        // Ocultar errores previos
        errorContainer.style.display = 'none';
        errorList.innerHTML = '';

        try {
            const res = await fetch('http://127.0.0.1:8001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    correo_institucional: form.correo_institucional.value,
                    password: form.password.value,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Login exitoso: guardar token y redirigir
                localStorage.setItem('auth_token', data.token);
                window.location.href = '/dashboard';
            } else {
                // Mostrar errores de validación o credenciales incorrectas
                errorContainer.style.display = 'block';
                if (data.errors) {
                    Object.values(data.errors).flat().forEach(msg => {
                        const li = document.createElement('li');
                        li.textContent = msg;
                        errorList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = data.message || 'Credenciales incorrectas';
                    errorList.appendChild(li);
                }
            }
        } catch (err) {
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