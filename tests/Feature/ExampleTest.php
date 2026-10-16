<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Comprueba que la ruta principal responda correctamente.
     */
    public function test_root_redirects_to_the_login_page(): void
    {
        $this->get('/')->assertRedirect('/login');
    }

    public function test_frontend_pages_are_available(): void
    {
        config(['services.api.base_url' => 'https://api.example.test/']);

        foreach (['/login', '/register', '/dashboard', '/panel', '/panel/tutor'] as $path) {
            $this->get($path)
                ->assertOk()
                ->assertSee('api.example.test', false);
        }
    }
}
