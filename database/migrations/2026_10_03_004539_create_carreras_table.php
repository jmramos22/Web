<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de carreras con nombre único y marcas de tiempo.
     */
    public function up(): void
    {
        // Define el identificador principal y los datos de cada carrera.
        Schema::create('carreras', function (Blueprint $table) {
            $table->id('id_carrera');
            $table->string('nombre')->unique();
            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla de carreras al revertir esta migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('carreras');
    }
};