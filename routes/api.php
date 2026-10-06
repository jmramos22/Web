<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Rutas protegidas (requieren token)
// Agrupa los endpoints que solo pueden utilizar usuarios autenticados con Sanctum.
Route::middleware('auth:sanctum')->group(function () {
    // Devuelve los datos del usuario asociado al token de la solicitud.
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [LoginController::class, 'logout']);
});