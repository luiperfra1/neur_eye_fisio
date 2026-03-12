# Data Model (borrador inicial)

Este documento define entidades base del MVP a nivel conceptual.

## Session

Representa una sesion clinica ejecutada sobre una escala concreta.

Campos iniciales:

- `id`: identificador unico.
- `patient_ref`: referencia externa anonimizada.
- `scale_id`: escala seleccionada.
- `status`: estado actual (`SessionStatus`).
- `started_at`: fecha/hora de inicio.
- `paused_at`: fecha/hora de pausa activa (opcional).
- `finished_at`: fecha/hora de cierre (opcional).
- `created_at`: fecha/hora de creacion.
- `updated_at`: fecha/hora de ultima actualizacion.

## Scale

Define una escala evaluativa disponible para crear sesiones.

Campos iniciales:

- `id`: identificador unico.
- `code`: codigo corto de escala.
- `name`: nombre visible.
- `version`: version de la escala.
- `description`: descripcion breve.
- `is_active`: habilitada para uso.

## ScaleSection

Subconjunto de una escala (bloque o seccion de items/pruebas).

Campos iniciales:

- `id`: identificador unico.
- `scale_id`: escala padre.
- `title`: titulo de la seccion.
- `order`: orden dentro de la escala.
- `instructions`: indicaciones de aplicacion (opcional).

## TestDefinition

Define una prueba o item ejecutable dentro de una seccion.

Campos iniciales:

- `id`: identificador unico.
- `scale_section_id`: seccion padre.
- `code`: codigo de prueba.
- `title`: nombre de la prueba.
- `description`: descripcion operativa.
- `score_type`: tipo de puntuacion esperado.
- `order`: orden de ejecucion.

## SessionTestResult

Resultado de una prueba concreta dentro de una sesion.

Campos iniciales:

- `id`: identificador unico.
- `session_id`: sesion asociada.
- `test_definition_id`: prueba aplicada.
- `score_value`: valor de puntuacion registrado.
- `notes`: observaciones clinicas breves (opcional).
- `recorded_at`: fecha/hora del registro.

## AudioRecord

Metadatos de un audio grabado durante una sesion.

Campos iniciales:

- `id`: identificador unico.
- `session_id`: sesion asociada.
- `file_uri`: ruta o referencia de archivo.
- `duration_seconds`: duracion en segundos.
- `recorded_at`: fecha/hora de grabacion.
- `source`: origen (microfono/dispositivo).

## Transcription

Resultado textual asociado a un audio.

Campos iniciales:

- `id`: identificador unico.
- `audio_record_id`: audio origen.
- `content`: texto transcrito.
- `status`: estado del proceso (pendiente/completado/error).
- `language`: idioma detectado o forzado.
- `created_at`: fecha/hora de creacion.
- `updated_at`: fecha/hora de actualizacion.

## SessionStatus

Enumeracion inicial de estados de sesion.

Valores base:

- `DRAFT`: creada y pendiente de iniciar.
- `IN_PROGRESS`: en ejecucion activa.
- `PAUSED`: detenida temporalmente.
- `COMPLETED`: finalizada.
- `CANCELLED`: cerrada sin completar.

## Relaciones clave (alto nivel)

- `Scale 1..N ScaleSection`
- `ScaleSection 1..N TestDefinition`
- `Session N..1 Scale`
- `Session 1..N SessionTestResult`
- `Session 1..N AudioRecord`
- `AudioRecord 1..N Transcription`
