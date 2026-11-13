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
                'resources/css/panel-admin.css',
                //Scripts
                'resources/js/app.js',
                'resources/js/loginblade.js',
                'resources/js/registerblade.js',
                'resources/js/dashboardblade.js',
                'resources/js/panel-estudianteblade.js',
                'resources/js/solicitar-sesion.js',
                'resources/js/postularme-tutor.js',
                'resources/js/panel-tutor.js',
                'resources/js/panel-admin.js'
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
        server: {
        host: '0.0.0.0', // Permite conexiones externas al contenedor
        port: 5173,
        strictPort: true,
        origin: 'http://localhost:5173',
        hmr: {
            host: 'localhost', // Navegador busca el HMR en localhost
        },
        watch: {
            usePolling: true, // Necesario en Docker para detectar cambios de archivos en Windows
            ignored: ['**/storage/framework/views/**'],
        },
    },
    },
});
