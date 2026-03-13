# Backend Node MVP

Stack:
- NestJS + Fastify
- Prisma + PostgreSQL
- Auth JWT (access token)

## Quick start

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate`
5. Seed initial data:
   - `npm run prisma:seed`
6. Start API:
   - `npm run start:dev`

## Base routes (prefixed with `/api`)

- `POST /auth/login`
- `GET /scales`
- `GET /scales/:scaleId`
- `POST /scales`
- `POST /scales/:scaleId/sections`
- `POST /scales/:scaleId/tests`
- `POST /sessions`
- `PUT /sessions/:sessionId/tests/:scaleTestId`
- `PATCH /sessions/:sessionId/complete`
- `GET /sessions`
- `GET /sessions/:sessionId`
