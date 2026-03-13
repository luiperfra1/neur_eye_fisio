
# neur_eye_fisio

Monorepo base para una aplicación orientada a tablet para personal sanitario, centrada en la gestión de escalas clínicas, sesiones de evaluación y registro estructurado de resultados por prueba.

## Objetivo de esta base

- Separar claramente frontend mobile, backend, documentación e infraestructura.
- Mantener una estructura escalable y profesional.
- Permitir evolución futura hacia funcionalidades como audio, transcripción, almacenamiento local, sincronización y flujos offline.
- Disponer desde el inicio de una base real funcional para autenticación, escalas y sesiones.

## Estructura principal

```text
apps/
  mobile/         # React Native + Expo + TypeScript
  backend-node/   # NestJS + Prisma + PostgreSQL
docs/
  product/
  technical/
infra/
packages/
````

## Estado actual del proyecto

Actualmente el repositorio ya incluye una base funcional de backend en Node.js con:

* autenticación simple mediante JWT
* usuario inicial mediante seed
* gestión de escalas clínicas
* gestión de secciones dentro de escalas
* gestión de pruebas dentro de cada escala
* creación y consulta de sesiones
* guardado de resultados por prueba dentro de una sesión
* cierre/completado de sesiones

El frontend sigue preparado para integrarse con este backend real.

---

# Backend

## Stack tecnológico

* NestJS
* Prisma ORM
* PostgreSQL
* JWT authentication
* bcrypt para hash de contraseñas

## Ubicación

```text
apps/backend-node
```

## Modelo de datos implementado

Entidades principales:

* `users`
* `scales`
* `scale_sections`
* `scale_tests`
* `sessions`
* `session_test_results`

### Regla de diseño importante

Toda escala tiene siempre al menos una sección.

Al crear una escala:

* se crea automáticamente una sección por defecto llamada `General`
* `scale_tests.section_id` es obligatorio

Esto simplifica el modelo y evita casos especiales en backend y frontend.

## Endpoints MVP disponibles

Prefijo global:

```text
/api
```

### Auth

* `POST /api/auth/login`

### Scales

* `GET /api/scales`
* `GET /api/scales/:scaleId`
* `POST /api/scales`
* `POST /api/scales/:scaleId/sections`
* `POST /api/scales/:scaleId/tests`

### Sessions

* `GET /api/sessions`
* `GET /api/sessions/:sessionId`
* `POST /api/sessions`
* `PUT /api/sessions/:sessionId/tests/:scaleTestId`
* `PATCH /api/sessions/:sessionId/complete`

## Respuesta de login

El login devuelve un objeto con esta forma:

```json
{
  "accessToken": "jwt_token",
  "tokenType": "Bearer",
  "expiresIn": "10h",
  "user": {
    "id": "uuid",
    "username": "admin",
    "displayName": "Administrador"
  }
}
```

Importante:

* el campo es `accessToken`, no `access_token`

## Validaciones relevantes

En la creación de pruebas (`scale_tests`):

* `score_values` y `score_labels` se almacenan como string separado por `;`
* se valida que:

  * ambas listas tengan el mismo número de elementos
  * `score_values` sean numéricos
  * se ignoren vacíos accidentales
  * se normalicen espacios

Ejemplo válido:

```text
score_values: 0;1;2;3
score_labels: No realiza;Realiza con ayuda;Realiza parcialmente;Realiza correctamente
```

---

# Inicio rápido

## Requisitos generales

Instalar previamente:

* Node.js 18 o superior
* npm
* Docker Desktop o PostgreSQL local
* Expo Go en el dispositivo móvil (opcional, para frontend)

---

# Backend: instalación y arranque

## 1. Entrar en la carpeta del backend

```bash
cd apps/backend-node
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar variables de entorno

Crear un archivo `.env` dentro de `apps/backend-node` con un contenido similar a este:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neur_eye_fisio?schema=public"
JWT_SECRET="secret_dev"
JWT_EXPIRES_IN="10h"
PORT=3001

SEED_USERNAME="admin"
SEED_PASSWORD="admin1234"
```

## 4. Levantar PostgreSQL

Puede usar PostgreSQL instalado localmente o Docker.

### Opción recomendada: Docker

```bash
docker run --name neur-eye-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=neur_eye_fisio \
  -p 5432:5432 \
  -d postgres:16
```

Si el contenedor ya existe y está parado:

```bash
docker start neur-eye-postgres
```

## 5. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

## 6. Ejecutar seed

```bash
npx prisma db seed
```

Esto crea:

* usuario inicial
* escala TIS de ejemplo
* secciones de ejemplo
* pruebas de ejemplo

## 7. Arrancar el backend

```bash
npm run start:dev
```

El backend quedará disponible en:

```text
http://localhost:3001/api
```

---

# Pruebas rápidas del backend

## Login

```bash
POST /api/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "admin1234"
}
```

## Listar escalas

```bash
GET /api/scales
Authorization: Bearer <token>
```

Si todo está correcto, debería devolver al menos la escala seeded `TIS`.

---

# Frontend mobile

## Stack tecnológico

* React Native
* Expo
* TypeScript

## Ubicación

```text
apps/mobile
```

## Instalación

```bash
cd apps/mobile
npm install
```

## Arrancar la aplicación

```bash
npx expo start
```

Esto levantará el Metro Bundler y mostrará un QR.

Opciones desde la terminal:

* `a` → abrir en Android
* `w` → abrir en navegador
* `r` → recargar app
* `m` → abrir menú de desarrollo
* `j` → debugger

## Probar en iPhone

1. Instalar Expo Go desde App Store.
2. Conectar el iPhone a la misma WiFi que el ordenador.
3. Ejecutar:

```bash
npx expo start
```

4. Escanear el QR desde Expo Go o desde la cámara del iPhone.

## Probar en navegador

Instalar dependencias web si aún no están instaladas:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

Luego ejecutar:

```bash
npx expo start
```

y pulsar:

```text
w
```

## Type checking

```bash
npm run typecheck
```

## Reinicio limpio del bundler

```bash
npx expo start -c
```

---

# Documentación

Antes de desarrollar, conviene revisar:

* `docs/product/vision.md`
* `docs/technical/architecture.md`
* `docs/technical/decisions.md`

---

# Estado actual

Actualmente este repositorio ya no es solo una estructura vacía.

Incluye:

* backend funcional con NestJS + Prisma + PostgreSQL
* autenticación JWT simple para entorno MVP interno
* seed con usuario inicial y escala TIS
* endpoints reales para escalas y sesiones
* base preparada para integrar frontend real contra backend

Todavía no incluye de forma completa:

* almacenamiento offline
* sincronización avanzada
* grabación y subida real de audio
* transcripción STT real
* gestión avanzada de usuarios/roles
* exportación de informes
* integración multisensorial

---

# Próximos pasos recomendados

1. Adaptar el frontend para consumir el backend real.
2. Sustituir mocks por servicios API.
3. Validar flujo completo:

   * login
   * listado de escalas
   * detalle de escala
   * creación de sesión
   * guardado de resultados por prueba
   * cierre de sesión
4. Refinar contratos frontend-backend según la UX final.
