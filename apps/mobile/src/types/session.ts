export type SessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export type AudioStatus = 'AVAILABLE' | 'NOT_RECORDED';
export type TranscriptionStatus = 'READY' | 'PENDING' | 'EMPTY';

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
  name: string;
  sectionId: string;
  sectionName: string;
  score: number | null;
  durationSec: number;
  note?: string;
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
  patientId: string;
  scaleId: string;
  scaleName: string;
  status: SessionStatus;
  startedAt: string;
  updatedAt: string;
  currentTestId: string;
  tests: SessionTest[];
}
