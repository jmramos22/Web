<?php

use Illuminate\Support\Facades\Route;

// Redirección inicial: mandamos al login
Route::get('/', function () {
    return redirect('/login');
});

// =========================================================
// Rutas de vistas (solo HTML)
// =========================================================
// Todo el procesamiento (login, registro) se hace en el proyecto API (puerto 8001).
// El modelo 'Carrera' y la BD ya NO se usan aquí.

// Vista del formulario de login
Route::view('/login', 'auth.login')->name('login');

// Vista del formulario de registro
Route::view('/register', 'auth.register')->name('register');

// Vista del dashboard
Route::view('/dashboard', 'dashboard')->name('dashboard');