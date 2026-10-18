<?php

use Illuminate\Support\Facades\Route;

// Redirección inicial: mandamos al login
// Envía la raíz del sitio al formulario de inicio de sesión.
Route::get('/', function () {
    return redirect('/login');
});

// Vista del formulario de login
Route::view('/login', 'auth.login')->name('login');

// Vista del formulario de registro
Route::view('/register', 'auth.register')->name('register');

// Vista del dashboard
Route::view('/dashboard', 'dashboard')->name('dashboard');

// Panel exclusivo para estudiantes
Route::view('/panel', 'panel-estudiante')->name('panel.estudiante');
Route::view('/panel/solicitar-sesion', 'solicitar-sesion')->name('panel.estudiante.solicitar-sesion');
Route::view('/panel/postularme-tutor', 'postularme-tutor')->name('panel.estudiante.postularme-tutor');

// Panel exclusivo para tutores
Route::view('/panel/tutor', 'panel-tutor')->name('panel.tutor');

// Panel exclusivo para admin
Route::view('/panel-admin', 'panel-admin');