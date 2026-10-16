document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('auth_token'); 
    if (!token) {
        window.location.href = '/login';
        return;
    }

    document.body.style.display = 'flex';

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const apiBaseUrl = 'http://localhost:8001';

    // --- LÓGICA DE PESTAÑAS (MENÚ LATERAL) ---
    const navUsuarios = document.getElementById('nav-usuarios');
    const navCarreras = document.getElementById('nav-carreras');
    const secUsuarios = document.getElementById('section-usuarios');
    const secCarreras = document.getElementById('section-carreras');

    navUsuarios.addEventListener('click', (e) => {
        e.preventDefault();
        navUsuarios.classList.add('active');
        navCarreras.classList.remove('active');
        secUsuarios.style.display = 'block';
        secCarreras.style.display = 'none';
    });

    navCarreras.addEventListener('click', (e) => {
        e.preventDefault();
        navCarreras.classList.add('active');
        navUsuarios.classList.remove('active');
        secCarreras.style.display = 'block';
        secUsuarios.style.display = 'none';
    });

    // --- LÓGICA DE DATOS: CARRERAS ---
    async function loadCarreras() {
        try {
            const res = await fetch(`${apiBaseUrl}/api/admin/carreras`, { headers });
            if (res.ok) {
                const carreras = await res.json();
                document.getElementById('lista-carreras').innerHTML = carreras.map(c => `
                    <li>
                        <span class="carrera-name">${c.nombre}</span> 
                        <span class="status-badge ${c.activa ? 'status-active' : 'status-inactive'}">
                            ${c.activa ? 'Activa' : 'Inactiva'}
                        </span>
                    </li>
                `).join('');
            }
        } catch (err) { console.error('Error al cargar carreras', err); }
    }

    document.getElementById('form-carrera').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre-carrera').value;
        const res = await fetch(`${apiBaseUrl}/api/admin/carreras`, {
            method: 'POST', headers, body: JSON.stringify({ nombre: nombre, activa: true })
        });
        if (res.ok) {
            document.getElementById('nombre-carrera').value = '';
            loadCarreras(); 
        } else {
            alert('Error al crear. Verifica que no exista ya esa carrera.');
        }
    });

    // --- LÓGICA DE DATOS: USUARIOS ---
    async function loadUsers() {
        try {
            const res = await fetch(`${apiBaseUrl}/api/admin/users`, { headers });
            if (res.ok) {
                const users = await res.json();
                document.getElementById('lista-usuarios').innerHTML = users.map(u => `
                    <li>
                        <div class="user-info-list">
                            <strong>${u.nombre} ${u.apellido}</strong>
                            <span>${u.correo_institucional}</span>
                        </div>
                        <select class="role-select" onchange="updateRole(${u.id_usuario}, this.value)">
                            <option value="ESTUDIANTE" ${u.rol === 'ESTUDIANTE' ? 'selected' : ''}>Estudiante</option>
                            <option value="TUTOR" ${u.rol === 'TUTOR' ? 'selected' : ''}>Tutor</option>
                            <option value="ADMIN" ${u.rol === 'ADMIN' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </li>
                `).join('');
            }
        } catch (err) { console.error('Error al cargar usuarios', err); }
    }

    window.updateRole = async function(idUsuario, nuevoRol) {
        if (!confirm(`¿Estás seguro de promover este usuario a ${nuevoRol}?`)) {
            loadUsers(); // Recarga para deshacer la selección visual si el usuario cancela
            return; 
        }
        const res = await fetch(`${apiBaseUrl}/api/admin/users/${idUsuario}/rol`, {
            method: 'PUT', headers, body: JSON.stringify({ rol: nuevoRol })
        });
        if (res.ok) {
            loadUsers();
        } else {
            alert('Error al actualizar el rol.');
        }
    };

    // --- CERRAR SESIÓN ---
    document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch(`${apiBaseUrl}/api/logout`, { method: 'POST', headers });
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    });

    // Iniciar carga de datos
    loadCarreras();
    loadUsers();
});