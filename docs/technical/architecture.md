# Arquitectura tecnica

## Estilo

Monorepo con separacion por aplicaciones y documentacion:

- `apps/mobile`: cliente React Native + TypeScript.
- `apps/backend`: API con Django + Django REST Framework.
- `docs`: producto y decisiones tecnicas.
- `infra`: base para despliegue y entornos.
- `packages`: librerias compartidas futuras.

## Principios

- Modulos pequeños y mantenibles.
- Separacion de responsabilidades.
- Preparado para crecimiento incremental.
- Convenciones claras de nombres y rutas.

## Direccion futura

- Persistencia local en mobile.
- Motor de sincronizacion offline/online.
- Captura y transcripcion de audio.
- Reportes y exportacion.
