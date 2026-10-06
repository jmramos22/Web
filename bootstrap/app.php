<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Punto de configuración para los middlewares globales y de rutas.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Devuelve errores de API en JSON aunque la solicitud no lo solicite explícitamente.
        $exceptions->shouldRenderJsonWhen(
            // Identifica las rutas API o solicitudes que esperan una respuesta JSON.
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
