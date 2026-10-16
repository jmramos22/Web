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

// Panel exclusivo para tutores
Route::view('/panel/tutor', 'panel-tutor')->name('panel.tutor');
