<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    // Imprime una cita inspiradora en la consola.
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
