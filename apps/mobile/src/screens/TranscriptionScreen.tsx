import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTopBar } from '@/components/common/AppTopBar';
import { CaptureStatusPill } from '@/components/common/CaptureStatusPill';
import { InfoCell, InfoGrid } from '@/components/common/InfoGrid';
import {
  CLINICAL_COLORS as C,
  elev,
  getCaptureStatusColor,
  getCaptureStatusLabel,
  withAlpha,
} from '@/constants/clinicalTheme';
import type { RootStackParamList } from '@/navigation/types';
import { ApiError } from '@/services/apiClient';
import { formatDuration, getSessionById } from '@/services/sessionService';
import type { Session } from '@/types/session';

type Props = NativeStackScreenProps<RootStackParamList, 'Transcription'>;

export function TranscriptionScreen({ navigation, route }: Props) {
  const { sessionId, testId } = route.params;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudo cargar la transcripción.');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const test = useMemo(() => session?.tests.find((item) => item.id === testId), [session, testId]);

  if (loading) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <AppTopBar title="Transcripción" onBack={() => navigation.goBack()} />
        <View style={s.errorScreen}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={s.errorSub}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session || !test) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <AppTopBar title="Transcripción" onBack={() => navigation.goBack()} />
        <View style={s.errorScreen}>
          <Text style={s.errorTitle}>Sin datos</Text>
          <Text style={s.errorSub}>{errorText ?? 'No hay transcripción disponible para esta prueba.'}</Text>
          <Pressable style={s.errorBtn} onPress={() => navigation.goBack()}>
            <Text style={s.errorBtnTxt}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hasText = !!test.transcription.text?.trim();
  const audioColor = getCaptureStatusColor(test.audio.status);
  const sttColor = getCaptureStatusColor(test.transcription.status);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <AppTopBar
        title="Transcripción"
        subtitle={`${test.sectionName} · ${test.name}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View style={s.cardHead}>
            <View style={s.sectionPill}>
              <Text style={s.sectionPillTxt}>{test.sectionName}</Text>
            </View>
            <Text style={s.testName}>{test.name}</Text>
          </View>
          <InfoGrid>
            <InfoCell label="Sesión" value={session.id} />
            <InfoCell label="Duración" value={formatDuration(test.durationSec)} />
            <InfoCell label="Paciente" value={session.patientId} />
            <InfoCell label="Escala" value={session.scaleName} />
          </InfoGrid>
        </View>

        <View style={s.captureRow}>
          <CaptureStatusPill icon="🎙" label="Audio" color={audioColor} text={getCaptureStatusLabel(test.audio.status)} compact />
          <CaptureStatusPill icon="📝" label="STT" color={sttColor} text={getCaptureStatusLabel(test.transcription.status)} compact />
        </View>

        <View style={s.card}>
          <View style={s.transcriptHeader}>
            <Text style={s.cardLabel}>Transcripción</Text>
            {hasText ? (
              <View style={[s.readyBadge, { borderColor: withAlpha(sttColor, '44'), backgroundColor: withAlpha(sttColor, '12') }]}>
                <View style={[s.readyDot, { backgroundColor: sttColor }]} />
                <Text style={[s.readyTxt, { color: sttColor }]}>{getCaptureStatusLabel(test.transcription.status)}</Text>
              </View>
            ) : null}
          </View>

          <View style={s.transcriptBody}>
            {hasText ? (
              <Text style={s.transcriptText}>{test.transcription.text}</Text>
            ) : (
              <View style={s.transcriptEmpty}>
                <Text style={s.transcriptEmptyIcon}>{test.transcription.status === 'PENDING' ? '⏳' : '⚠️'}</Text>
                <Text style={s.transcriptEmptyTxt}>
                  {test.transcription.status === 'PENDING'
                    ? 'La transcripción está en proceso...'
                    : 'No hay texto de transcripción disponible.'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {test.note?.trim() ? (
          <View style={s.card}>
            <Text style={s.cardLabel}>Nota clínica</Text>
            <View style={s.noteBody}>
              <Text style={s.noteText}>{test.note}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={s.bottomBar}>
        <Text style={s.bottomInfo}>Sesión {session.id}</Text>
        <Pressable style={[s.actBtn, s.actOutline]} onPress={() => navigation.goBack()}>
          <Text style={[s.actTxt, s.actTxtOutline]}>Cerrar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    ...elev(2),
  },
  cardHead: { backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
  sectionPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sectionPillTxt: { fontSize: 10, color: 'rgba(255,255,255,0.88)', fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  testName: { fontSize: 18, fontWeight: '800', color: C.white, lineHeight: 24 },
  cardLabel: { fontSize: 11, fontWeight: '800', color: C.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  captureRow: { flexDirection: 'row', gap: 10 },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  readyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  readyDot: { width: 6, height: 6, borderRadius: 3 },
  readyTxt: { fontSize: 11, fontWeight: '700' },
  transcriptBody: {
    minHeight: 180,
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: C.bgBase,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  transcriptText: { fontSize: 15, color: C.textPrimary, lineHeight: 24, letterSpacing: 0.1 },
  transcriptEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 32 },
  transcriptEmptyIcon: { fontSize: 28 },
  transcriptEmptyTxt: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
  noteBody: { marginHorizontal: 14, marginBottom: 14, marginTop: 4 },
  noteText: { fontSize: 14, color: C.textPrimary, lineHeight: 21 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bgSurface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 30,
    ...elev(4),
  },
  bottomInfo: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  actBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actOutline: { borderWidth: 1.5, borderColor: C.secondary },
  actTxt: { fontSize: 14, fontWeight: '700' },
  actTxtOutline: { color: C.secondary },
  errorScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 8 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary },
  errorSub: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
  errorBtn: { marginTop: 16, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  errorBtnTxt: { fontSize: 15, fontWeight: '700', color: C.white },
});
