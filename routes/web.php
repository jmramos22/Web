<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use App\Models\Carrera;

// Redirección inicial
Route::get('/', function () {
    return redirect('/login');
});

// Rutas de Registro (HU-01)

Route::post('/register', [RegisterController::class, 'register']);

// Rutas de Login (HU-02)
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);

// Dashboard protegido (Tarea #19)
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth');

//
Route::get('/register', function () {
    $carreras = Carrera::where('activa', true)->orderBy('nombre')->get();
    return view('auth.register', compact('carreras'));
});