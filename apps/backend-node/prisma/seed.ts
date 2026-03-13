import * as bcrypt from 'bcrypt';
import { PrismaClient, SessionStatus, SessionTestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertInitialUser() {
  const username = process.env.SEED_USERNAME ?? 'admin';
  const plainPassword = process.env.SEED_PASSWORD ?? 'admin1234';
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  return prisma.user.upsert({
    where: { username },
    update: { passwordHash, isActive: true },
    create: {
      username,
      passwordHash,
      isActive: true,
    },
  });
}

async function upsertTisScale() {
  const scale = await prisma.scale.upsert({
    where: { code: 'TIS' },
    update: {
      name: 'Trunk Impairment Scale',
      description: 'Escala de ejemplo para valoracion de control de tronco.',
      estimatedDurationMin: 35,
      metadata: { language: 'es', version: 'mvp' },
      isActive: true,
    },
    create: {
      code: 'TIS',
      name: 'Trunk Impairment Scale',
      description: 'Escala de ejemplo para valoracion de control de tronco.',
      estimatedDurationMin: 35,
      metadata: { language: 'es', version: 'mvp' },
      isActive: true,
    },
  });

  // Cleanup demo sessions before recreating tests/sections to avoid FK errors on reseed.
  await prisma.session.deleteMany({ where: { scaleId: scale.id } });
  await prisma.scaleTest.deleteMany({ where: { scaleId: scale.id } });
  await prisma.scaleSection.deleteMany({ where: { scaleId: scale.id } });

  const dynamicSitting = await prisma.scaleSection.create({
    data: {
      scaleId: scale.id,
      name: 'Equilibrio dinamico en sedestacion',
      description: 'Control del tronco durante tareas funcionales.',
      orderIndex: 0,
      isDefault: false,
    },
  });

  const coordination = await prisma.scaleSection.create({
    data: {
      scaleId: scale.id,
      name: 'Coordinacion',
      description: 'Movimientos coordinados de tronco.',
      orderIndex: 1,
      isDefault: false,
    },
  });

  await prisma.scaleTest.createMany({
    data: [
      {
        scaleId: scale.id,
        sectionId: dynamicSitting.id,
        name: 'Alcance lateral',
        description: 'Paciente realiza alcance lateral manteniendo control.',
        scoreValues: '0;1;2;3',
        scoreLabels: 'No realiza;Con ayuda;Parcial;Correcto',
        orderIndex: 0,
      },
      {
        scaleId: scale.id,
        sectionId: dynamicSitting.id,
        name: 'Alcance anterior',
        description: 'Paciente realiza alcance anterior en sedestacion.',
        scoreValues: '0;1;2;3',
        scoreLabels: 'No realiza;Con ayuda;Parcial;Correcto',
        orderIndex: 1,
      },
      {
        scaleId: scale.id,
        sectionId: coordination.id,
        name: 'Rotacion selectiva de tronco',
        description: 'Valora disociacion y control de rotacion.',
        scoreValues: '0;1;2',
        scoreLabels: 'No realiza;Parcial;Correcto',
        orderIndex: 2,
      },
    ],
  });

  const tests = await prisma.scaleTest.findMany({
    where: { scaleId: scale.id },
    orderBy: { orderIndex: 'asc' },
  });

  return { scale, tests };
}

async function seedDemoSessions(userId: string, scaleId: string, tests: Array<{ id: string; orderIndex: number }>) {
  if (tests.length < 3) {
    throw new Error('Seed requires at least 3 tests for demo sessions');
  }

  const completedSession = await prisma.session.create({
    data: {
      userId,
      patientId: 'PAT-0001',
      scaleId,
      status: SessionStatus.completed,
      startedAt: new Date('2026-03-10T09:00:00.000Z'),
      endedAt: new Date('2026-03-10T09:28:00.000Z'),
      generalComments: 'Sesion de ejemplo completada.',
    },
  });

  await prisma.sessionTestResult.createMany({
    data: [
      {
        sessionId: completedSession.id,
        scaleTestId: tests[0].id,
        scoreValue: 3,
        notes: 'Buen control troncal.',
        status: SessionTestStatus.completed,
        durationSec: 420,
        orderIndex: tests[0].orderIndex,
      },
      {
        sessionId: completedSession.id,
        scaleTestId: tests[1].id,
        scoreValue: 2,
        notes: 'Necesita minima ayuda.',
        status: SessionTestStatus.completed,
        durationSec: 480,
        orderIndex: tests[1].orderIndex,
      },
      {
        sessionId: completedSession.id,
        scaleTestId: tests[2].id,
        scoreValue: 2,
        notes: 'Ejecuta rotacion con control.',
        status: SessionTestStatus.completed,
        durationSec: 430,
        orderIndex: tests[2].orderIndex,
      },
    ],
  });

  const inProgressSession = await prisma.session.create({
    data: {
      userId,
      patientId: 'PAT-0002',
      scaleId,
      status: SessionStatus.in_progress,
      startedAt: new Date('2026-03-13T10:15:00.000Z'),
      generalComments: 'Sesion en curso para pruebas de frontend.',
    },
  });

  await prisma.sessionTestResult.createMany({
    data: [
      {
        sessionId: inProgressSession.id,
        scaleTestId: tests[0].id,
        scoreValue: 1,
        notes: 'Inicio de evaluacion.',
        status: SessionTestStatus.completed,
        durationSec: 260,
        orderIndex: tests[0].orderIndex,
      },
      {
        sessionId: inProgressSession.id,
        scaleTestId: tests[1].id,
        status: SessionTestStatus.pending,
        orderIndex: tests[1].orderIndex,
      },
      {
        sessionId: inProgressSession.id,
        scaleTestId: tests[2].id,
        status: SessionTestStatus.pending,
        orderIndex: tests[2].orderIndex,
      },
    ],
  });
}

async function main() {
  const user = await upsertInitialUser();
  const { scale, tests } = await upsertTisScale();
  await seedDemoSessions(user.id, scale.id, tests);
  console.log(`Seed completado. Usuario: ${user.username}, escala: ${scale.code}, sesiones demo creadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
