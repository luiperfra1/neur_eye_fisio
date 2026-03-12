# Navigation Flow (MVP)

Flujo base de navegacion para la app tablet.

## 1. Lista de sesiones

Pantalla inicial con sesiones disponibles y acceso a crear nueva sesion.

Acciones:

- abrir detalle/resumen de sesion existente.
- iniciar flujo de crear sesion.

## 2. Crear sesion

Pantalla para seleccionar escala y crear una nueva sesion clinica.

Salida principal:

- sesion creada en estado inicial.
- navegacion hacia ejecucion de prueba.

## 3. Ejecucion de prueba

Pantalla principal operativa para registrar resultados por prueba.

Acciones:

- avanzar entre pruebas.
- registrar puntuacion.
- abrir pausa de sesion.
- finalizar y pasar a resumen.

## 4. Pausa de sesion

Modal o pantalla dedicada para pausar/reanudar.

Acciones:

- reanudar sesion y volver a ejecucion.
- cerrar pausa manteniendo estado.

## 5. Resumen de sesion

Vista consolidada de resultados registrados y estado final.

Acciones:

- revisar resultados.
- abrir vista/modal de transcripcion (si existe audio).
- volver a lista de sesiones.

## 6. Transcripcion

Vista o modal para mostrar texto transcrito asociado a la sesion.

Acciones:

- cerrar y volver al resumen.

## Diagrama lineal base

`Lista de sesiones -> Crear sesion -> Ejecucion de prueba <-> Pausa de sesion -> Resumen de sesion -> Transcripcion`
