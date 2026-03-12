# Mobile app (Expo + React Native + TypeScript)

Aplicacion mobile del monorepo con base profesional y navegacion MVP placeholder.

## Stack

- Expo (managed workflow)
- React Native
- TypeScript
- React Navigation (native stack)

## Estructura de `src`

- `app`: composicion de la app y providers.
- `navigation`: stack y tipos de rutas.
- `screens`: pantallas placeholder del MVP.
- `components`: componentes reutilizables (`common`).
- `features`: reservado para modulos funcionales.
- `domain`: contratos y modelos de dominio.
- `services`: integraciones externas futuras.
- `store`: estado global futuro.
- `hooks`: hooks reutilizables.
- `types`: tipos compartidos.
- `utils`: utilidades.
- `constants`: tema base de UI.

## MVP actual (sin logica de negocio)

Flujo de navegacion base:

1. Lista de sesiones
2. Crear sesion
3. Ejecucion de prueba
4. Pausa de sesion
5. Resumen de sesion
6. Transcripcion

No incluye autenticacion, API real, almacenamiento local real, audio real ni STT real.

## Comandos PowerShell

```powershell
cd apps/mobile
npm install
npm run start
npm run android
npm run web
```
