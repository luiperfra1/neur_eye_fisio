export type SessionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export type AudioStatus = 'AVAILABLE' | 'NOT_RECORDED';
export type TranscriptionStatus = 'READY' | 'PENDING' | 'EMPTY';
export type SessionTestStatus = 'pending' | 'completed' | 'skipped';

export interface AudioRecord {
  status: AudioStatus;
  durationSec: number;
}

export interface TestTranscription {
  status: TranscriptionStatus;
  text: string;
}

export interface SessionTest {
  id: string;
  definitionId: string;
  scaleTestId: string;
  sectionId: string;
  sectionName: string;
  name: string;
  score: number | null;
  note?: string;
  durationSec: number;
  orderIndex: number;
  scoreOptions: number[];
  status: SessionTestStatus;
  audio: AudioRecord;
  transcription: TestTranscription;
}

export interface SessionSection {
  id: string;
  name: string;
  tests: SessionTest[];
}

export interface Session {
  id: string;
  userId: string;
  patientId: string;
  scaleId: string;
  scaleName: string;
  scaleCode: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string | null;
  updatedAt: string;
  generalComments?: string | null;
  tests: SessionTest[];
}
