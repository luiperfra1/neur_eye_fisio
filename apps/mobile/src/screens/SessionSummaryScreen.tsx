import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTopBar } from '@/components/common/AppTopBar';
import { CaptureStatusPill } from '@/components/common/CaptureStatusPill';
import { InfoCell } from '@/components/common/InfoGrid';
import { CLINICAL_COLORS as C, elev, getCaptureStatusColor, withAlpha } from '@/constants/clinicalTheme';
import type { RootStackParamList } from '@/navigation/types';
import { ApiError } from '@/services/apiClient';
import {
  formatDuration,
  getSessionById,
  getSessionSections,
  getSessionTotalDuration,
  getSessionTotalScore,
} from '@/services/sessionService';
import type { Session } from '@/types/session';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const data = await getSessionById(sessionId);
      setSession(data);
      const sections = getSessionSections(data);
      setOpenSections(Object.fromEntries(sections.map((section, index) => [section.id, index === 0])));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudo cargar el resumen.');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.errorScreen}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={s.errorSub}>Cargando resumen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.errorScreen}>
          <Text style={s.errorTitle}>Sesión no encontrada</Text>
          <Text style={s.errorSub}>{errorText ?? 'No se pudo cargar el resumen.'}</Text>
          <Pressable style={s.errorBtn} onPress={() => navigation.popToTop()}>
            <Text style={s.errorBtnTxt}>Volver al inicio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const sections = getSessionSections(session);
  const totalScore = getSessionTotalScore(session);
  const totalDuration = getSessionTotalDuration(session);
  const completedTests = session.tests.filter((test) => test.score !== null).length;
  const totalTests = session.tests.length;
  const percent = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <AppTopBar
        title="Resumen de sesión"
        subtitle={`Paciente ${session.patientId} · ${session.scaleCode}`}
        onBack={() => navigation.goBack()}
        right={<StatusDot status={session.status} />}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.statsStrip}>
          <StatBox label="Puntuación" value={String(totalScore)} accent={C.primary} />
          <View style={s.statDivider} />
          <StatBox label="Duración" value={formatDuration(totalDuration)} accent={C.secondary} />
          <View style={s.statDivider} />
          <StatBox label="Pruebas" value={`${completedTests}/${totalTests}`} accent={C.success} />
        </View>

        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${percent}%` as never }]} />
          </View>
          <Text style={s.progressLabel}>{percent}% completado</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardLabel}>Información de sesión</Text>
          <View style={s.cardInner}>
            <GridRow>
              <InfoCell label="ID sesión" value={session.id} />
              <InfoCell label="Estado" value={session.status} />
            </GridRow>
            <GridRow>
              <InfoCell label="Escala" value={session.scaleName} />
              <InfoCell label="Paciente" value={session.patientId} />
            </GridRow>
            <GridRow>
              <InfoCell label="Usuario" value={session.userId} />
              <InfoCell label="Inicio" value={new Date(session.startedAt).toLocaleDateString('es-ES')} />
            </GridRow>
          </View>
        </View>

        {sections.map((section, sectionIndex) => {
          const isOpen = !!openSections[section.id];
          const completed = section.tests.filter((test) => test.score !== null).length;
          const total = section.tests.length;
          const allDone = completed === total;

          return (
            <View key={section.id} style={s.card}>
              <Pressable
                onPress={() => setOpenSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                style={s.sectionHeader}
              >
                <View style={[s.sectionIndex, allDone && s.sectionIndexDone]}>
                  <Text style={[s.sectionIndexTxt, allDone && s.sectionIndexTxtDone]}>{sectionIndex + 1}</Text>
                </View>
                <View style={s.sectionHeaderCenter}>
                  <Text style={s.sectionTitle}>{section.name}</Text>
                  <Text style={s.sectionMeta}>
                    {completed}/{total} pruebas completadas
                  </Text>
                </View>
                <View style={s.sectionHeaderRight}>
                  {allDone ? <Text style={s.allDoneBadge}>✓</Text> : null}
                  <Text style={s.chevron}>{isOpen ? '▲' : '▼'}</Text>
                </View>
              </Pressable>

              {isOpen ? (
                <View style={s.sectionBody}>
                  {section.tests.map((test, testIndex) => (
                    <TestRow
                      key={test.id}
                      test={test}
                      isLast={testIndex === section.tests.length - 1}
                      onViewTranscription={() => navigation.navigate('Transcription', { sessionId: session.id, testId: test.id })}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={s.bottomBar}>
        <View style={s.bottomLeft}>
          <Text style={s.bottomScore}>
            {totalScore} <Text style={s.bottomScoreLabel}>pts</Text>
          </Text>
          <Text style={s.bottomDuration}>{formatDuration(totalDuration)}</Text>
        </View>
        <Pressable style={[s.actBtn, s.actOutline]} onPress={() => navigation.popToTop()}>
          <Text style={[s.actTxt, s.actTxtOutline]}>Volver</Text>
        </Pressable>
        <Pressable style={[s.actBtn, s.actFilled]} onPress={() => navigation.navigate('SessionsList')}>
          <Text style={[s.actTxt, s.actTxtFilled]}>Confirmar sesión ✓</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function TestRow({
  test,
  isLast,
  onViewTranscription,
}: {
  test: Session['tests'][number];
  isLast: boolean;
  onViewTranscription: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const scored = test.score !== null;

  return (
    <View style={[tr.wrap, !isLast && tr.wrapBorder]}>
      <Pressable style={tr.header} onPress={() => setExpanded((value) => !value)}>
        <View style={[tr.scoreBubble, scored ? tr.scoreBubbleDone : tr.scoreBubbleEmpty]}>
          <Text style={[tr.scoreBubbleTxt, scored ? tr.scoreBubbleTxtDone : tr.scoreBubbleTxtEmpty]}>
            {scored ? test.score : '-'}
          </Text>
        </View>
        <View style={tr.headerCenter}>
          <Text style={tr.name} numberOfLines={expanded ? undefined : 1}>
            {test.name}
          </Text>
          <Text style={tr.meta}>
            {formatDuration(test.durationSec)}
            {test.note?.trim() ? ' · nota' : ''}
          </Text>
        </View>
        <View style={tr.headerRight}>
          <View style={[tr.audioDot, { backgroundColor: getCaptureStatusColor(test.audio.status) }]} />
          <Text style={tr.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={tr.detail}>
          {test.note?.trim() ? (
            <View style={tr.noteBox}>
              <Text style={tr.noteLabel}>Nota clínica</Text>
              <Text style={tr.noteText}>{test.note}</Text>
            </View>
          ) : null}
          <View style={tr.badgeRow}>
            <CaptureStatusPill label="Audio" status={test.audio.status} />
            <CaptureStatusPill label="STT" status={test.transcription.status} />
          </View>
          <Pressable style={tr.transcriptBtn} onPress={onViewTranscription}>
            <Text style={tr.transcriptTxt}>Ver transcripción →</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={stat.wrap}>
      <Text style={[stat.value, { color: accent }]}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

function GridRow({ children }: { children: ReactNode }) {
  return <View style={gr.row}>{children}</View>;
}

function StatusDot({ status }: { status: Session['status'] }) {
  const color = status === 'completed' ? C.success : status === 'cancelled' ? C.warning : C.primary;
  const label = status === 'completed' ? 'Finalizada' : status === 'cancelled' ? 'Cancelada' : 'En curso';
  return (
    <View style={[sd.wrap, { borderColor: withAlpha(color, '55') }]}>
      <View style={[sd.dot, { backgroundColor: color }]} />
      <Text style={[sd.txt, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: C.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    ...elev(2),
  },
  statDivider: { width: 1, backgroundColor: C.divider, marginVertical: 12 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 2 },
  progressTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: C.textSecondary, minWidth: 80, textAlign: 'right' },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    ...elev(2),
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: C.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  cardInner: { padding: 12, gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
  sectionIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.bgBase,
    borderWidth: 1.5,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sectionIndexDone: { backgroundColor: C.success, borderColor: C.success },
  sectionIndexTxt: { fontSize: 13, fontWeight: '800', color: C.textSecondary },
  sectionIndexTxtDone: { color: C.white },
  sectionHeaderCenter: { flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  sectionMeta: { fontSize: 12, color: C.textSecondary, marginTop: 1 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  allDoneBadge: { fontSize: 14, color: C.success, fontWeight: '800' },
  chevron: { fontSize: 10, color: C.textSecondary },
  sectionBody: { borderTopWidth: 1, borderTopColor: C.divider },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgSurface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 30,
    gap: 8,
    ...elev(4),
  },
  bottomLeft: { flex: 1 },
  bottomScore: { fontSize: 18, fontWeight: '800', color: C.textPrimary },
  bottomScoreLabel: { fontSize: 12, fontWeight: '500', color: C.textSecondary },
  bottomDuration: { fontSize: 12, color: C.textSecondary, marginTop: 1 },
  actBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actOutline: { borderWidth: 1.5, borderColor: C.secondary },
  actFilled: { backgroundColor: C.primary },
  actTxt: { fontSize: 13, fontWeight: '700' },
  actTxtOutline: { color: C.secondary },
  actTxtFilled: { color: C.white },
  errorScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 10 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  errorSub: { fontSize: 15, color: C.textSecondary, textAlign: 'center' },
  errorBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  errorBtnTxt: { fontSize: 15, fontWeight: '700', color: C.white },
});

const tr = StyleSheet.create({
  wrap: { paddingHorizontal: 14 },
  wrapBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  scoreBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 2,
  },
  scoreBubbleDone: { backgroundColor: C.primary, borderColor: C.primary },
  scoreBubbleEmpty: { backgroundColor: C.bgBase, borderColor: C.border },
  scoreBubbleTxt: { fontSize: 16, fontWeight: '800' },
  scoreBubbleTxtDone: { color: C.white },
  scoreBubbleTxtEmpty: { color: C.textSecondary },
  headerCenter: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  meta: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  audioDot: { width: 8, height: 8, borderRadius: 4 },
  chevron: { fontSize: 9, color: C.textSecondary },
  detail: { paddingBottom: 12, gap: 10 },
  noteBox: { backgroundColor: C.bgBase, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: C.border },
  noteLabel: { fontSize: 10, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  noteText: { fontSize: 13, color: C.textPrimary, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  transcriptBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  transcriptTxt: { fontSize: 13, fontWeight: '700', color: C.primary },
});

const stat = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 2 },
  value: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 11, color: C.textSecondary, fontWeight: '500' },
});

const gr = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
});

const sd = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { fontSize: 11, fontWeight: '700' },
});
