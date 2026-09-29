<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Principal - Tutorías UAS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }
        .user-card {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        button {
            padding: 8px 15px;
            background-color: #c9302c;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <h2>Bienvenido al Sistema de Tutorías UAS</h2>

    <div class="user-card">
        <p><strong>Usuario:</strong> {{ Auth::user()->nombre }} {{ Auth::user()->apellido }}</p>
        <p><strong>Correo:</strong> {{ Auth::user()->correo_institucional }}</p>
        <p><strong>Carrera:</strong> {{ Auth::user()->carrera }}</p>
        <p><strong>Rol:</strong> {{ Auth::user()->rol }}</p>
    </div>

    <form action="/logout" method="POST">
        @csrf
        <button type="submit">Cerrar Sesión</button>
    </form>

</body>
</html>