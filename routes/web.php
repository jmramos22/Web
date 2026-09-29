<?php

use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

// Ruta GET para mostrar el formulario de registro
Route::get('/register', function () {
    return view('auth.register');
});

// Ruta POST para procesar el registro de usuario
Route::post('/register', [RegisterController::class, 'register']);
