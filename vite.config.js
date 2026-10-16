import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                //Estilos
                'resources/css/app.css',
                'resources/css/loginblade.css',
                'resources/css/registerblade.css',
                'resources/css/dashboardblade.css',
                'resources/css/panel-estudiante.css',
                'resources/css/panel-tutor.css',
                //Scripts
                'resources/js/app.js',
                'resources/js/loginblade.js',
                'resources/js/registerblade.js',
                'resources/js/dashboardblade.js',
                'resources/js/panel-estudianteblade.js',
                'resources/js/panel-tutor.js',
            ],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
