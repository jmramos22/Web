# 📌 Documentación del Proyecto - Sprint 1

> **Proyecto:** Sistema P2P de Tutorías UAS
>
> **Módulos:** HU-01 (Registro de Usuarios) & HU-02 (Inicio de Sesión y Autenticación)
>
> **Tecnologías:** Laravel 11 | PostgreSQL | Blade | Git

## 📋 Resumen General del Sprint 1

Durante este Sprint se completó el módulo de **Autenticación e Identidad Base** del sistema, compuesto por dos Historias de Usuario principales:

1. **HU-01: Registro de Nuevo Usuario**

   * Registro con validación de correo institucional (`@uas.edu.mx`).
   * Persistencia directa en base de datos PostgreSQL (`uas_tutoring`).
   * Encriptación de contraseña (`Hash::make`).
   * Asignación automática de rol por defecto (`ESTUDIANTE`).

2. **HU-02: Inicio de Sesión (Login)**

   * Interfaz visual de inicio de sesión (`resources/views/auth/login.blade.php`).
   * Endpoint/Controlador de autenticación (`LoginController`) con regeneración de sesión.
   * Redirección y vista de Dashboard protegido (`/dashboard`) que consume el estado de autenticación (`Auth::user()`).
   * Cierre de sesión seguro (`/logout`).

## 🏗️ Arquitectura y Componentes Desarrollados

### 1. Base de Datos & Modelado

* **Base de datos:** PostgreSQL local (`UAS-Tutorias`).
* **Tabla:** `users` (con llave primaria personalizada `id_usuario`).
* **Modelo:** `app/Models/User.php`.
* **Migración:** `database/migrations/xxxx_xx_xx_create_users_table.php`.


Schema::create('users', function (Blueprint $table) {
    $table->id('id_usuario');
    $table->string('nombre');
    $table->string('apellido');
    $table->string('correo_institucional')->unique();
    $table->string('password');
    $table->string('carrera');
    $table->enum('rol', ['ESTUDIANTE', 'TUTOR', 'ADMIN'])->default('ESTUDIANTE');
    $table->timestamps();
});

```

### 2. Lógica de Autenticación & Controladores (Backend)

* **FormRequest de Registro (`app/Http/Requests/RegisterRequest.php`):**

  * Contiene las reglas de validación para el formulario de registro.
  * Aplica la expresión regular `/^[a-zA-Z0-9._%+-]+@uas\.edu\.mx$/i` para validar únicamente dominios `@uas.edu.mx`.

* **Controlador de Registro (`app/Http/Controllers/Auth/RegisterController.php`):**

  * Procesa la información del `RegisterRequest`.
  * Hashea la contraseña antes de guardarla.
  * Guarda el nuevo usuario en PostgreSQL y retorna respuesta estructurada.

* **Controlador de Login (`app/Http/Controllers/Auth/LoginController.php`):**

  * Valida las credenciales ingresadas (`correo_institucional` y `password`).
  * Utiliza `Auth::attempt()` para validar y abrir la sesión.
  * Invalida la sesión y regenera el token en la ruta de `logout`.

### 3. Vistas Interactivas (Frontend Blade)

* **Formulario de Registro:** `resources/views/auth/register.blade.php` (Tarea #13)
* **Formulario de Login:** `resources/views/auth/login.blade.php` (Tarea #17)
* **Panel Principal / Dashboard:** `resources/views/dashboard.blade.php` (Tarea #19)

#### Estilos de autenticación con Vite

* Los estilos propios del formulario de inicio de sesión están en `resources/css/loginblade.css`; los del registro, en `resources/css/registerblade.css`.
* Cada vista carga su hoja correspondiente con `@vite`: `resources/views/auth/login.blade.php` usa `@vite('resources/css/loginblade.css')` y `resources/views/auth/register.blade.php` usa `@vite('resources/css/registerblade.css')`. No se deben enlazar con rutas relativas como `resources/css/registerblade.css`, pues el navegador las resolvería respecto a la URL actual.
* `vite.config.js` debe registrar ambas hojas (`resources/css/loginblade.css` y `resources/css/registerblade.css`) como entradas de Vite, junto con los recursos generales de la aplicación.
* Cuando se añade o cambia una entrada de Vite, hay que regenerar el manifiesto. Si falta la entrada correspondiente en `public/build/manifest.json`, Laravel muestra `Unable to locate file in Vite manifest`.
* Para instalar las dependencias y ejecutar el servidor de desarrollo de Vite:

```bash
npm ci
npm run dev
```

* Para generar los recursos optimizados para producción:

```bash
npm run build
```

En Windows PowerShell, si la política de ejecución bloquea `npm.ps1`, se pueden ejecutar los mismos comandos con `npm.cmd` (por ejemplo, `npm.cmd run build`). La compilación genera los recursos versionados y el manifiesto de Vite en `public/build`; las vistas deben seguir usando `@vite` para cargarlos.

#### Comunicación del frontend con la API

* La URL base se configura mediante `VITE_API_URL` en el archivo local `.env` (por ejemplo, `http://127.0.0.1:8001/api`). Después de cambiarla, reinicia Vite para que recoja el valor.
* `resources/js/api.js` centraliza las peticiones HTTP y las rutas de login, registro, carreras, usuario y logout. Las vistas cargan los módulos específicos `resources/js/login.js`, `resources/js/register.js` y `resources/js/dashboard.js`.
* Los módulos de cada pantalla están registrados en `vite.config.js` y se cargan desde su vista Blade con `@vite`. Si se cambia la URL base durante desarrollo, reinicia `npm.cmd run dev`; para producción, establece la URL antes de ejecutar `npm.cmd run build`.

### 4. Enrutamiento (`routes/web.php`)

<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

// Redirección inicial
Route::get('/', function () {
    return redirect('/login');
});

// HU-01: Rutas de Registro
Route::get('/register', function () {
    return view('auth.register');
});
Route::post('/register', [RegisterController::class, 'register']);

// HU-02: Rutas de Autenticación (Login / Logout)
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);

// HU-02: Dashboard protegido mediante middleware 'auth'
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth');



## 🚀 Secuencia de Comandos Ejecutados

### Configuración del Entorno y Artisan

# Limpieza de caché de configuración, rutas y vistas
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Ejecución de migraciones en PostgreSQL
php artisan migrate

# Creación de Controladores y Requests
php artisan make:request RegisterRequest
php artisan make:controller Auth/RegisterController
php artisan make:controller Auth/LoginController

# Servidor de desarrollo
php artisan serve



## 🔀 Estrategia de Control de Versiones (Git Branching)

El proyecto mantiene la estructura de ramas `main`, `develop` y `feature/*`.


# 1. Desarrollo de HU-02 en rama de funcionalidad
git checkout develop
git checkout -b feature/hu-02-login

# 2. Guardar y subir avances
git add .
git commit -m "feat(auth): completar HU-02 inicio de sesion y dashboard protegido"
git push -u origin feature/hu-02-login

# 3. Integración a develop
git checkout develop
git pull origin develop
git merge feature/hu-02-login
git push origin develop

# 4. Despliegue de versión estable a main
git checkout main
git pull origin main
git merge develop
git push origin main

# 5. Retorno a la rama activa
git checkout develop



## ✅ Estado de Historias de Usuario y Tareas (Tablero)

| **Historia de Usuario** | **Tarea** | **Descripción** | **Estado** | 
| **HU-01** | #13 | Diseñar la UI del formulario de registro | **COMPLETADO** | 
| **HU-01** | #14 | Crear la tabla Usuarios en la BD PostgreSQL | **COMPLETADO** | 
| **HU-01** | #15 | Desarrollar el endpoint en la API/Backend | **COMPLETADO** | 
| **HU-01** | #16 | Configurar asignación automática de rol (`ESTUDIANTE`) | **COMPLETADO** | 
| **HU-02** | #17 | Diseñar la UI del formulario de inicio de sesión | **COMPLETADO** | 
| **HU-02** | #18 | Desarrollar el endpoint de autenticación en backend | **COMPLETADO** | 
| **HU-02** | #19 | Configurar la redirección en el frontend y Dashboard | **COMPLETADO** | 
