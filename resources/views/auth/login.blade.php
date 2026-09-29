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

    @if ($errors->any())
        <div class="error-list">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="/login" method="POST">
        @csrf

        <div class="form-group">
            <label for="correo_institucional">Correo Institucional:</label>
            <input type="email" id="correo_institucional" name="correo_institucional" value="{{ old('correo_institucional') }}" required autofocus>
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

</body>
</html>