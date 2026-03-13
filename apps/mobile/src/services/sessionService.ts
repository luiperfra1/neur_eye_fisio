import { apiRequest } from '@/services/apiClient';
import type { Session, SessionSection, SessionStatus, SessionTest } from '@/types/session';

interface CreateSessionInput {
  scaleId: string;
  patientId: string;
  generalComments?: string;
}

interface UpsertSessionTestInput {
  scoreValue?: number;
  notes?: string;
  transcriptText?: string;
  audioUrl?: string;
  durationSec?: number;
  status?: 'pending' | 'completed' | 'skipped';
}

type BackendSessionListItem = {
  id: string;
  userId: string;
  patientId: string;
  scaleId: string;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  generalComments: string | null;
  createdAt: string;
  updatedAt: string;
  scale: {
    id: string;
    name: string;
    code: string | null;
  };
};

type BackendScaleTest = {
  id: string;
  name: string;
  sectionId: string;
  scoreValues: string;
  scoreLabels: string;
  orderIndex: number;
};

type BackendScaleSection = {
  id: string;
  name: string;
  orderIndex: number;
  isDefault: boolean;
};

type BackendSessionDetail = BackendSessionListItem & {
  scale: BackendSessionListItem['scale'] & {
    sections: BackendScaleSection[];
    tests: BackendScaleTest[];
  };
  testResults: Array<{
    id: string;
    scoreValue: string | number | null;
    notes: string | null;
    transcriptText: string | null;
    audioUrl: string | null;
    durationSec: number | null;
    status: 'pending' | 'completed' | 'skipped';
    orderIndex: number;
    scaleTest: {
      id: string;
      name: string;
      sectionId: string;
      scoreValues: string;
      scoreLabels: string;
    };
  }>;
};

type BackendSession = Omit<BackendSessionListItem, 'scale'>;

export async function listSessions(): Promise<Session[]> {
  const rows = await apiRequest<BackendSessionListItem[]>('/sessions');
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    patientId: row.patientId,
    scaleId: row.scaleId,
    scaleName: row.scale.name,
    scaleCode: row.scale.code ?? row.scale.name,
    status: row.status,
    startedAt: row.startedAt ?? row.createdAt,
    endedAt: row.endedAt,
    updatedAt: row.updatedAt,
    generalComments: row.generalComments,
    tests: [],
  }));
}

export async function getSessionById(sessionId: string): Promise<Session> {
  const row = await apiRequest<BackendSessionDetail>(`/sessions/${sessionId}`);
  return mapSessionDetail(row);
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const row = await apiRequest<BackendSession>('/sessions', {
    method: 'POST',
    body: {
      scaleId: input.scaleId,
      patientId: input.patientId,
      generalComments: input.generalComments,
    },
  });
  return {
    id: row.id,
    userId: row.userId,
    patientId: row.patientId,
    scaleId: row.scaleId,
    scaleName: '',
    scaleCode: '',
    status: row.status,
    startedAt: row.startedAt ?? row.createdAt,
    endedAt: row.endedAt,
    updatedAt: row.updatedAt,
    generalComments: row.generalComments,
    tests: [],
  };
}

export async function upsertSessionTestResult(
  sessionId: string,
  scaleTestId: string,
  input: UpsertSessionTestInput,
) {
  return apiRequest(`/sessions/${sessionId}/tests/${scaleTestId}`, {
    method: 'PUT',
    body: input,
  });
}

export async function completeSession(sessionId: string) {
  return apiRequest(`/sessions/${sessionId}/complete`, { method: 'PATCH' });
}

export function getSessionSections(session: Session): SessionSection[] {
  const map = new Map<string, SessionSection>();

  session.tests.forEach((test) => {
    if (!map.has(test.sectionId)) {
      map.set(test.sectionId, { id: test.sectionId, name: test.sectionName, tests: [] });
    }
    map.get(test.sectionId)?.tests.push(test);
  });

  return Array.from(map.values()).map((section) => ({
    ...section,
    tests: section.tests.slice().sort((a, b) => a.orderIndex - b.orderIndex),
  }));
}

export function getCurrentTestIndex(session: Session, currentTestId: string): number {
  return session.tests.findIndex((test) => test.id === currentTestId);
}

export function getAdjacentTestId(
  session: Session,
  currentTestId: string,
  direction: 'prev' | 'next',
): string | undefined {
  const currentIndex = getCurrentTestIndex(session, currentTestId);
  if (currentIndex < 0) return session.tests[0]?.id;
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
  return session.tests.reduce((acc, test) => acc + (test.durationSec ?? 0), 0);
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

function mapSessionDetail(row: BackendSessionDetail): Session {
  const sectionMap = new Map(row.scale.sections.map((section) => [section.id, section.name]));
  const resultMap = new Map(row.testResults.map((result) => [result.scaleTest.id, result]));

  const tests: SessionTest[] = row.scale.tests
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((test) => {
      const result = resultMap.get(test.id);
      const score = typeof result?.scoreValue === 'number' ? result.scoreValue : Number(result?.scoreValue);
      const hasNumericScore = typeof result?.scoreValue !== 'undefined' && result?.scoreValue !== null && !Number.isNaN(score);

      return {
        id: test.id,
        definitionId: test.id,
        scaleTestId: test.id,
        sectionId: test.sectionId,
        sectionName: sectionMap.get(test.sectionId) ?? 'General',
        name: test.name,
        score: hasNumericScore ? score : null,
        note: result?.notes ?? '',
        durationSec: result?.durationSec ?? 0,
        orderIndex: test.orderIndex,
        scoreOptions: parseScoreValues(test.scoreValues),
        status: result?.status ?? 'pending',
        audio: {
          status: result?.audioUrl ? 'AVAILABLE' : 'NOT_RECORDED',
          durationSec: result?.durationSec ?? 0,
        },
        transcription: {
          status: result?.transcriptText ? 'READY' : result?.status === 'completed' ? 'EMPTY' : 'PENDING',
          text: result?.transcriptText ?? '',
        },
      };
    });

  return {
    id: row.id,
    userId: row.userId,
    patientId: row.patientId,
    scaleId: row.scaleId,
    scaleName: row.scale.name,
    scaleCode: row.scale.code ?? row.scale.name,
    status: row.status,
    startedAt: row.startedAt ?? row.createdAt,
    endedAt: row.endedAt,
    updatedAt: row.updatedAt,
    generalComments: row.generalComments,
    tests,
  };
}

function parseScoreValues(raw: string): number[] {
  return raw
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => Number(part))
    .filter((part) => !Number.isNaN(part));
}
