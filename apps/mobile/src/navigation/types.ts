export type RootStackParamList = {
  Login: undefined;
  SessionsList: undefined;
  CreateSession: undefined;
  TestExecution: { sessionId: string };
  SessionPause: { sessionId: string };
  SessionSummary: { sessionId: string };
  Transcription: { sessionId: string; testId: string };
};
