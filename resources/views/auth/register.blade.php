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
    </style>
</head>
<body>

    <h2>Registro de Usuario (Sprint 1)</h2>

    {{-- Mostrar errores de validación si existen --}}
    @if ($errors->any())
        <div class="error-list">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="/register" method="POST">
        @csrf

        <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" value="{{ old('nombre') }}" required>
        </div>

        <div class="form-group">
            <label for="apellido">Apellido:</label>
            <input type="text" id="apellido" name="apellido" value="{{ old('apellido') }}" required>
        </div>

        <div class="form-group">
            <label for="correo_institucional">Correo Institucional (@uas.edu.mx):</label>
            <input type="email" id="correo_institucional" name="correo_institucional" value="{{ old('correo_institucional') }}" placeholder="ejemplo@uas.edu.mx" required>
        </div>

        <div class="form-group">
            <label for="password">Contraseña (mínimo 8 caracteres):</label>
            <input type="password" id="password" name="password" required>
        </div>

        <div class="form-group">
            <label for="carrera">Carrera:</label>
            <select id="carrera" name="carrera" required>
                <option value="" disabled {{ old('carrera') ? '' : 'selected' }}>-- Selecciona una carrera --</option>
                @foreach($carreras as $carrera)
                <option value="{{ $carrera->nombre }}" {{ old('carrera') == $carrera->nombre ? 'selected' : '' }}>
                    {{ $carrera->nombre }}
                </option>
                @endforeach
            </select>
        </div>

        <button type="submit">Registrarse</button>
    </form>

</body>
</html>