# Plan de trabajo del MVP — Sprints 2 a 7

## Propósito y alcance

Este plan desglosa en seis sprints adicionales el MVP de la Herramienta para Tutorías, tomando el Sprint 1 como base ya trabajada.

### Línea base del Sprint 1

| Historia | Alcance | Estado inicial |
|---|---|---|
| HU-01 | Registro con correo institucional | Completada en Sprint 1 |
| HU-02 | Inicio de sesión | Completada en Sprint 1 |

Antes de iniciar el Sprint 2, el equipo debe verificar en el repositorio de la API que estas funciones persistan los datos, emitan y validen el token, y apliquen los roles acordados. Si falta alguno de estos criterios, agréguese como tarea de estabilización del Sprint 2.

### Funcionalidad del MVP incluida

- Perfil de estudiante y perfil de tutor.
- Catálogo administrativo de materias.
- Materias y habilidades ofrecidas por cada tutor.
- Publicación y consulta de disponibilidad.
- Búsqueda de tutores por materia, calificación y disponibilidad.
- Solicitud, aceptación/rechazo, cancelación y cierre de tutorías.
- Calificación de sesiones completadas.

### Fuera del alcance de estos seis sprints

El documento del MVP deja como funcionalidades posteriores las notificaciones por correo, archivos/material didáctico, historial descargable, recordatorios, filtros avanzados y notas privadas de retroalimentación. No se deben incorporar a los sprints sin una decisión explícita de cambio de alcance.

## Plan de sprints

Los sprints se definen por objetivo y dependencias, no por fechas ni puntos: el equipo aún debe acordar duración, capacidad y estimación.

### Sprint 2 — Perfiles de estudiante y catálogo de materias

**Objetivo:** habilitar la gestión de datos básicos y preparar los datos que utilizarán tutores y estudiantes.

**Historias:** HU-03 (perfil de estudiante), HU-05 (gestión de asignaturas por administrador).

**Criterios de aceptación:**

- El estudiante puede consultar y actualizar los campos de perfil permitidos; su correo institucional y rol no se pueden cambiar desde esta operación.
- El catálogo permite al administrador crear, editar, activar/desactivar y consultar materias.
- Los nombres/códigos requeridos se validan y no se duplican.
- Las rutas administrativas verifican el rol en el backend; ocultar botones en la interfaz no cuenta como control de acceso.
- Las operaciones tienen pruebas de validación y autorización.

**Dependencias:** HU-02 y roles autenticados de Sprint 1.

### Sprint 3 — Perfil de tutor y disponibilidad

**Objetivo:** permitir que un tutor publique las materias que ofrece y sus horarios libres.

**Historias:** HU-04 (perfil de tutor), HU-06 (publicación de horarios).

**Criterios de aceptación:**

- Un usuario con permiso de tutor puede completar y editar su perfil de tutor.
- El tutor puede asociar materias activas del catálogo y describir sus habilidades.
- El tutor puede crear, consultar, actualizar y retirar bloques de disponibilidad.
- No se permiten horarios inválidos, pasados ni bloques solapados para el mismo tutor.
- Un estudiante no puede administrar el perfil ni los horarios de otro tutor.

**Dependencias:** HU-05 y control de roles de Sprint 2.

### Sprint 4 — Búsqueda y solicitud de tutoría

**Objetivo:** completar el primer flujo estudiante–tutor desde encontrar una oferta hasta solicitar un horario libre.

**Historias:** HU-07 (búsqueda y filtros), HU-08 (solicitud/reserva).

**Criterios de aceptación:**

- El estudiante puede consultar tutores por materia, calificación y disponibilidad.
- Los resultados muestran materias, promedio de calificación (o “sin calificaciones”) y horarios libres.
- El estudiante puede solicitar una sesión seleccionando tutor, materia y bloque disponible.
- Al registrar la solicitud, el sistema evita que el mismo bloque quede reservado dos veces, incluso ante peticiones simultáneas.
- La nueva solicitud queda en estado pendiente y aparece al estudiante y al tutor correspondiente.

**Dependencias:** materias de Sprint 2; perfiles y disponibilidad de Sprint 3.

### Sprint 5 — Panel del tutor y cancelaciones

**Objetivo:** dar al tutor control sobre las solicitudes recibidas y permitir cancelar una cita de forma consistente.

**Historias:** HU-09 (panel de citas), HU-11 (cancelación).

**Criterios de aceptación:**

- El tutor solo puede ver y gestionar las solicitudes asociadas a su cuenta.
- Puede aceptar o rechazar solicitudes pendientes; el estudiante puede consultar el resultado.
- El estudiante o tutor puede cancelar únicamente sesiones en estados permitidos.
- Una cancelación registra quién la realizó y cuándo, y actualiza o libera la disponibilidad de acuerdo con la política acordada.
- El sistema rechaza transiciones de estado no permitidas y protege las operaciones por rol.

**Dependencias:** solicitudes y estados iniciales de Sprint 4.

**Decisión requerida durante la planificación:** acordar con el equipo hasta cuándo se permite cancelar y cómo se libera el horario si la sesión estaba confirmada. No hay que asumir una política de cancelación antes de que el equipo la defina.

### Sprint 6 — Sesión completada y calificaciones

**Objetivo:** cerrar el ciclo de una tutoría y habilitar reseñas basadas únicamente en sesiones efectivamente realizadas.

**Historias:** HU-12 (marcar como completada), HU-10 (calificar sesión); completar el filtro por calificación de HU-07.

**Criterios de aceptación:**

- El tutor puede marcar como completada una sesión confirmada y no cancelada.
- Solo el estudiante de una sesión completada puede evaluarla.
- La calificación debe ser de 1 a 5; el comentario es opcional.
- Se impide calificar más de una vez la misma sesión.
- El promedio del tutor se calcula a partir de las reseñas válidas y se refleja correctamente en búsqueda y perfil.
- Las transiciones inválidas y los intentos de evaluar sesiones ajenas son rechazados por el backend.

**Dependencias:** HU-09 y estados de sesión de Sprint 5.

### Sprint 7 — Integración, calidad y liberación del MVP

**Objetivo:** comprobar y entregar de forma integrada el recorrido principal del MVP en un entorno reproducible.

**Alcance:** corrección de defectos del flujo completo; pruebas, seguridad básica, documentación y despliegue. No se agregan funcionalidades nuevas fuera del MVP.

**Criterios de aceptación:**

- La prueba E2E cubre: registro/inicio de sesión → perfil de tutor y materias → disponibilidad → búsqueda → solicitud → decisión del tutor → cierre → calificación.
- Se verifica también el recorrido de rechazo y cancelación, incluyendo la liberación del horario según la política acordada.
- Hay pruebas de API para permisos por rol, validación de entradas, cambios de estado y solicitudes concurrentes sobre un mismo horario.
- Las migraciones y los datos iniciales necesarios se ejecutan siguiendo instrucciones documentadas.
- Las variables y pasos de configuración de desarrollo/producción están documentados; no se versionan secretos.
- Se presenta una versión del MVP que el equipo puede recorrer en una demostración.

**Dependencias:** funcionalidades aceptadas de los Sprints 1 a 6.

## Dependencias principales

```text
HU-01 / HU-02 (Sprint 1)
        └── HU-03 / HU-05 (Sprint 2)
                └── HU-04 / HU-06 (Sprint 3)
                        └── HU-07 / HU-08 (Sprint 4)
                                └── HU-09 / HU-11 (Sprint 5)
                                        └── HU-12 / HU-10 (Sprint 6)
                                                └── Integración y liberación (Sprint 7)
```

## Tablero de seguimiento

Actualizar esta tabla durante la planificación y revisión de cada sprint. Crear una tarea/issue por historia y por tarea técnica, y vincularla a su sprint.

Estados recomendados: **Pendiente**, **En progreso**, **En revisión**, **En pruebas**, **Bloqueada**, **Hecha**.

| Sprint | Objetivo | Historias principales | Estado | Responsable | Issue/PR | Evidencia de aceptación |
|---|---|---|---|---|---|---|
| 1 | Autenticación y acceso inicial | HU-01, HU-02 | Hecho; validar criterios de API | — | — | Pruebas/API y demo |
| 2 | Perfil de estudiante y catálogo | HU-03, HU-05 | Pendiente | — | — | — |
| 3 | Perfil de tutor y disponibilidad | HU-04, HU-06 | Pendiente | — | — | — |
| 4 | Búsqueda y solicitud | HU-07, HU-08 | Pendiente | — | — | — |
| 5 | Gestión de citas y cancelación | HU-09, HU-11 | Pendiente | — | — | Política de cancelación acordada y pruebas |
| 6 | Cierre y reseñas | HU-12, HU-10; completar HU-07 | Pendiente | — | — | — |
| 7 | Integración y liberación | E2E, calidad, documentación, despliegue | Pendiente | — | — | Demo integrada y lista de pruebas |

## Rutina de control recomendada

1. **Inicio del sprint:** seleccionar historias preparadas según capacidad real del equipo; dividirlas en tareas pequeñas y registrar responsable, estimación y criterio de aceptación.
2. **Durante el sprint:** actualizar el estado del tablero; cada bloqueo debe registrar causa, responsable de resolverlo y siguiente acción.
3. **Antes de marcar “Hecha”:** exigir revisión de código, pruebas relacionadas satisfactorias, permisos comprobados y criterios de aceptación demostrados.
4. **Cierre del sprint:** demostrar el incremento funcionando, registrar historias terminadas/no terminadas y documentar decisiones o cambios de alcance.
5. **Refinamiento:** mover una historia incompleta al sprint siguiente solo después de revisar su dependencia, alcance y capacidad; no marcarla como terminada parcialmente.

### Definición de terminado

Una historia se considera **Hecha** solo si cumple todos sus criterios de aceptación, la lógica sensible se valida en el backend, tiene pruebas apropiadas, pasó revisión, está integrada en la rama objetivo y puede demostrarse sin depender de datos o secretos locales no documentados.

## Nota de arquitectura

El documento del MVP menciona varias bases de datos y backends, y también señala el riesgo de complejidad. Para este alcance, conviene acordar antes del Sprint 2 una única API y una base de datos relacional como fuente de verdad —aprovechando las tecnologías ya operativas en el proyecto— en vez de introducir microservicios y varios motores sin una necesidad validada. La escala potencial de 100,000 usuarios debe tratarse como objetivo futuro de medición y diseño, no como razón para fragmentar de inicio un MVP.
