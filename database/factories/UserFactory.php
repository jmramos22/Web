<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Genera los atributos predeterminados para crear usuarios de prueba.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Configura el usuario de prueba para que su correo no aparezca verificado.
     */
    public function unverified(): static
    {
        // Devuelve una variante de la fábrica con la fecha de verificación vacía.
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
