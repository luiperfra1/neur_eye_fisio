import { getScaleById } from '@/services/scaleService';
import type { Session, SessionSection, SessionStatus, SessionTest } from '@/types/session';

interface CreateSessionInput {
  patientId: string;
  scaleId: string;
}

interface UpdateTestInput {
  score?: number | null;
  note?: string;
}

let sequence = 1006;

function nowIso(): string {
  return new Date().toISOString();
}

function buildSessionTests(scaleId: string): SessionTest[] {
  const scale = getScaleById(scaleId);
  if (!scale) {
    return [];
  }

  return scale.sections.flatMap((section, sectionIndex) =>
    section.tests.map((test, testIndex) => {
      const durationSec = 110 + sectionIndex * 22 + testIndex * 18;
      const hasAudio = testIndex % 2 === 0;
      const hasTranscription = testIndex % 3 !== 0;

      return {
        id: `${test.id}_session`,
        definitionId: test.id,
        name: test.name,
        sectionId: section.id,
        sectionName: section.name,
        score: sectionIndex === 0 ? Math.min(testIndex % 4, test.maxScore) : null,
        durationSec,
        note: testIndex === 0 ? 'Paciente tolera bien la prueba inicial.' : '',
        audio: {
          status: hasAudio ? 'AVAILABLE' : 'NOT_RECORDED',
          durationSec,
        },
        transcription: {
          status: hasAudio ? (hasTranscription ? 'READY' : 'PENDING') : 'EMPTY',
          text: hasAudio
            ? hasTranscription
              ? 'Transcripcion mock asociada a la prueba. Contenido pendiente de validacion clinica.'
              : 'Transcripcion en proceso para esta prueba.'
            : 'No existe audio asociado a esta prueba.',
        },
      };
    })
  );
}

function buildSession(patientId: string, scaleId: string, status: SessionStatus): Session {
  const scale = getScaleById(scaleId);
  const tests = buildSessionTests(scaleId);
  const currentTestId = tests[0]?.id ?? '';

  sequence += 1;

  return {
    id: `SES-${sequence}`,
    patientId,
    scaleId,
    scaleName: scale?.code ?? 'N/A',
    status,
    startedAt: nowIso(),
    updatedAt: nowIso(),
    currentTestId,
    tests,
  };
}

const sessionsStore: Session[] = [
  buildSession('1234', 'scale_tis_2_0', 'COMPLETED'),
  buildSession('1267', 'scale_tis_2_0', 'IN_PROGRESS'),
  buildSession('1288', 'scale_tis_2_0', 'PAUSED'),
  buildSession('1310', 'scale_tis_2_0', 'COMPLETED'),
  buildSession('1331', 'scale_tis_2_0', 'COMPLETED'),
  buildSession('1345', 'scale_tis_2_0', 'IN_PROGRESS'),
];

export function listSessions(): Session[] {
  return [...sessionsStore];
}

export function searchSessions(query: string): Session[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return listSessions();
  }

  return sessionsStore.filter((session) => {
    const statusText = session.status.replace('_', ' ').toLowerCase();
    return (
      session.id.toLowerCase().includes(normalized) ||
      session.patientId.toLowerCase().includes(normalized) ||
      session.scaleName.toLowerCase().includes(normalized) ||
      statusText.includes(normalized)
    );
  });
}

export function getSessionById(sessionId: string): Session | undefined {
  return sessionsStore.find((session) => session.id === sessionId);
}

export function createSession(input: CreateSessionInput): Session {
  const newSession = buildSession(input.patientId, input.scaleId, 'DRAFT');
  sessionsStore.unshift(newSession);
  return newSession;
}

export function setSessionStatus(sessionId: string, status: SessionStatus): void {
  const session = getSessionById(sessionId);
  if (!session) {
    return;
  }

  session.status = status;
  session.updatedAt = nowIso();
}

export function setCurrentTest(sessionId: string, testId: string): void {
  const session = getSessionById(sessionId);
  if (!session) {
    return;
  }

  const exists = session.tests.some((test) => test.id === testId);
  if (!exists) {
    return;
  }

  session.currentTestId = testId;
  session.updatedAt = nowIso();
}

export function updateSessionTest(sessionId: string, testId: string, changes: UpdateTestInput): void {
  const session = getSessionById(sessionId);
  if (!session) {
    return;
  }

  const test = session.tests.find((item) => item.id === testId);
  if (!test) {
    return;
  }

  if (typeof changes.score !== 'undefined') {
    test.score = changes.score;
  }

  if (typeof changes.note !== 'undefined') {
    test.note = changes.note;
  }

  session.updatedAt = nowIso();
}

export function getSessionSections(sessionId: string): SessionSection[] {
  const session = getSessionById(sessionId);
  if (!session) {
    return [];
  }

  const sectionsMap = new Map<string, SessionSection>();

  session.tests.forEach((test) => {
    if (!sectionsMap.has(test.sectionId)) {
      sectionsMap.set(test.sectionId, {
        id: test.sectionId,
        name: test.sectionName,
        tests: [],
      });
    }

    sectionsMap.get(test.sectionId)?.tests.push(test);
  });

  return Array.from(sectionsMap.values());
}

export function getCurrentTestIndex(session: Session): number {
  return session.tests.findIndex((test) => test.id === session.currentTestId);
}

export function getAdjacentTestId(session: Session, direction: 'prev' | 'next'): string | undefined {
  const currentIndex = getCurrentTestIndex(session);

  if (currentIndex < 0) {
    return session.tests[0]?.id;
  }

  const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  return session.tests[targetIndex]?.id;
}

export function getSessionProgress(session: Session): { completed: number; total: number; percent: number } {
  const total = session.tests.length;
  const completed = session.tests.filter((test) => test.score !== null).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}

export function getSessionTotalScore(session: Session): number {
  return session.tests.reduce((acc, test) => acc + (test.score ?? 0), 0);
}

export function getSessionTotalDuration(session: Session): number {
  return session.tests.reduce((acc, test) => acc + test.durationSec, 0);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${mins}:${secs}`;
}
