import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTopBar } from '@/components/common/AppTopBar';
import { CaptureStatusPill } from '@/components/common/CaptureStatusPill';
import { InfoCell, InfoGrid } from '@/components/common/InfoGrid';
import { SidebarShell } from '@/components/common/SidebarShell';
import { CLINICAL_COLORS as C, CLINICAL_LAYOUT, elev } from '@/constants/clinicalTheme';
import { LAYOUT } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { ApiError } from '@/services/apiClient';
import {
  completeSession,
  formatDuration,
  getAdjacentTestId,
  getCurrentTestIndex,
  getSessionById,
  getSessionProgress,
  getSessionSections,
  upsertSessionTestResult,
} from '@/services/sessionService';
import type { Session } from '@/types/session';

type Props = NativeStackScreenProps<RootStackParamList, 'TestExecution'>;

const SIDEBAR_W = CLINICAL_LAYOUT.sidebarWidth;

export function TestExecutionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const { width } = useWindowDimensions();
  const isTablet = width >= LAYOUT.tabletBreakpoint;
  const [session, setSession] = useState<Session | null>(null);
  const [currentTestId, setCurrentTestId] = useState<string>('');
  const [noteDraft, setNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sidebarX = useRef(new Animated.Value(-SIDEBAR_W)).current;

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const data = await getSessionById(sessionId);
      setSession(data);
      const defaultTest = data.tests.find((test) => test.status !== 'completed') ?? data.tests[0];
      setCurrentTestId((prev) => prev || defaultTest?.id || '');
      setNoteDraft((prev) => (prev.length > 0 ? prev : defaultTest?.note ?? ''));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudo cargar la sesión.');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const currentTest = useMemo(
    () => session?.tests.find((test) => test.id === currentTestId),
    [currentTestId, session],
  );
  const sections = useMemo(() => (session ? getSessionSections(session) : []), [session]);
  const progress = useMemo(
    () => (session ? getSessionProgress(session) : { completed: 0, total: 0, percent: 0 }),
    [session],
  );
  const currentIndex = useMemo(
    () => (session && currentTestId ? getCurrentTestIndex(session, currentTestId) : -1),
    [currentTestId, session],
  );

  useEffect(() => {
    setNoteDraft(currentTest?.note ?? '');
  }, [currentTest?.id, currentTest?.note]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(sidebarX, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [backdropOpacity, sidebarX]);

  const closeSidebar = useCallback(() => {
    Animated.parallel([
      Animated.timing(sidebarX, { toValue: -SIDEBAR_W, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setSidebarOpen(false));
  }, [backdropOpacity, sidebarX]);

  const saveScore = useCallback(
    async (score: number) => {
      if (!currentTest) return;
      try {
        setSaving(true);
        await upsertSessionTestResult(sessionId, currentTest.scaleTestId, {
          scoreValue: score,
          status: 'completed',
          notes: noteDraft,
        });
        await loadSession();
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorText(`Error ${error.status}: ${error.message}`);
        } else {
          setErrorText('No se pudo guardar la puntuación.');
        }
      } finally {
        setSaving(false);
      }
    },
    [currentTest, loadSession, noteDraft, sessionId],
  );

  const saveNote = useCallback(async () => {
    if (!currentTest) return;
    try {
      await upsertSessionTestResult(sessionId, currentTest.scaleTestId, { notes: noteDraft });
      await loadSession();
    } catch {
      setErrorText('No se pudo guardar la nota.');
    }
  }, [currentTest, loadSession, noteDraft, sessionId]);

  const moveTest = useCallback(
    (dir: 'prev' | 'next') => {
      if (!session || !currentTestId) return;
      const nextId = getAdjacentTestId(session, currentTestId, dir);
      if (nextId) {
        setCurrentTestId(nextId);
        if (!isTablet) closeSidebar();
      }
    },
    [closeSidebar, currentTestId, isTablet, session],
  );

  const onComplete = useCallback(async () => {
    try {
      setSaving(true);
      await completeSession(sessionId);
      navigation.replace('SessionSummary', { sessionId });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudo completar la sesión.');
      }
    } finally {
      setSaving(false);
    }
  }, [navigation, sessionId]);

  if (loading) {
    return (
      <SafeAreaView style={s.center} edges={['top']}>
        <ActivityIndicator size="small" color={C.primary} />
        <Text style={s.centerText}>Cargando sesión...</Text>
      </SafeAreaView>
    );
  }

  if (!session || !currentTest) {
    return (
      <SafeAreaView style={s.center} edges={['top']}>
        <Text style={s.errorTitle}>Sesión no encontrada</Text>
        <Text style={s.centerText}>No se pudo cargar la sesión solicitada.</Text>
      </SafeAreaView>
    );
  }

  const sidebarPanel = (
    <SidebarPanel
      sections={sections}
      currentTestId={currentTest.id}
      onSelect={(id) => {
        setCurrentTestId(id);
        if (!isTablet) closeSidebar();
      }}
      onClose={!isTablet ? closeSidebar : undefined}
    />
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <AppTopBar
        title={`Paciente ${session.patientId}`}
        subtitle={`${session.scaleCode} · Prueba ${currentIndex + 1}/${session.tests.length}`}
        left={!isTablet ? (
          <Pressable onPress={openSidebar} style={s.menuBtn} hitSlop={10}>
            <View style={s.burger}>
              <View style={s.burgerLine} />
              <View style={s.burgerLine} />
              <View style={s.burgerLine} />
            </View>
          </Pressable>
        ) : undefined}
        right={(
          <View style={s.pill}>
            <View style={[s.pillFill, { width: `${progress.percent}%` as never }]} />
            <Text style={s.pillText}>{progress.percent}%</Text>
          </View>
        )}
      />

      <View style={s.body}>
        {isTablet && <View style={s.tabletSidebar}>{sidebarPanel}</View>}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          {errorText ? <Text style={s.inlineError}>{errorText}</Text> : null}
          <View style={s.card}>
            <View style={s.cardHead}>
              <View style={s.sectionPill}>
                <Text style={s.sectionPillText}>{currentTest.sectionName}</Text>
              </View>
              <Text style={s.testTitle}>{currentTest.name}</Text>
            </View>
            <InfoGrid>
              <InfoCell label="ID" value={currentTest.definitionId} />
              <InfoCell label="Duración" value={formatDuration(currentTest.durationSec)} />
              <InfoCell label="Audio" value={currentTest.audio.status} />
              <InfoCell label="Transcripción" value={currentTest.transcription.status} />
            </InfoGrid>
          </View>

          <View style={s.card}>
            <Text style={s.cardLabel}>Puntuación</Text>
            <View style={s.cardInner}>
              <View style={s.scoreRow}>
                {currentTest.scoreOptions.map((score) => {
                  const active = currentTest.score === score;
                  return (
                    <Pressable key={score} onPress={() => void saveScore(score)} style={[s.scoreBtn, active && s.scoreBtnOn]}>
                      <Text style={[s.scoreBtnTxt, active && s.scoreBtnTxtOn]}>{score}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                onBlur={() => void saveNote()}
                placeholder="Nota clínica opcional..."
                placeholderTextColor={C.textSecondary}
                multiline
                style={s.noteInput}
              />
              <View style={s.navRow}>
                <Pressable style={[s.navBtn, s.navOutline]} onPress={() => moveTest('prev')}>
                  <Text style={[s.navTxt, s.navTxtOutline]}>← Anterior</Text>
                </Pressable>
                <Pressable style={[s.navBtn, s.navFilled]} onPress={() => moveTest('next')}>
                  <Text style={[s.navTxt, s.navTxtFilled]}>Siguiente →</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardLabel}>Estado de captura</Text>
            <View style={[s.cardInner, s.captureRow]}>
              <CaptureStatusPill label="Audio" status={currentTest.audio.status} />
              <CaptureStatusPill label="Transcripción" status={currentTest.transcription.status} />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={s.bottomBar}>
        <Pressable style={[s.actBtn, s.actOutline]} onPress={() => navigation.navigate('SessionPause', { sessionId })}>
          <Text style={[s.actTxt, s.actTxtOutline]}>⏸ Pausa</Text>
        </Pressable>
        <View style={s.bottomCenter}>
          <Text style={s.bottomInfo}>
            {progress.completed}/{progress.total} pruebas
          </Text>
        </View>
        <Pressable style={[s.actBtn, s.actFilled]} onPress={() => void onComplete()} disabled={saving}>
          <Text style={[s.actTxt, s.actTxtFilled]}>{saving ? 'Guardando...' : 'Resumen ✓'}</Text>
        </Pressable>
      </View>

      {!isTablet && sidebarOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[s.mobileSidebar, { transform: [{ translateX: sidebarX }] }]}>
            {sidebarPanel}
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

function SidebarPanel({
  sections,
  currentTestId,
  onSelect,
  onClose,
}: {
  sections: ReturnType<typeof getSessionSections>;
  currentTestId: string;
  onSelect: (id: string) => void;
  onClose?: () => void;
}) {
  return (
    <SidebarShell title="Escala" onClose={onClose}>
      {sections.map((section) => (
        <View key={section.id} style={sb.section}>
          <Text style={sb.sectionLabel}>{section.name}</Text>
          {section.tests.map((test, index) => {
            const active = test.id === currentTestId;
            const completed = test.score !== null;
            return (
              <Pressable key={test.id} onPress={() => onSelect(test.id)} style={[sb.row, active && sb.rowActive]}>
                <View style={[sb.idx, active && sb.idxActive]}>
                  <Text style={[sb.idxTxt, active && sb.idxTxtActive]}>{index + 1}</Text>
                </View>
                <Text style={[sb.rowName, active && sb.rowNameActive]} numberOfLines={2}>
                  {test.name}
                </Text>
                {completed ? (
                  <View style={sb.checkWrap}>
                    <Text style={sb.checkTxt}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </SidebarShell>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bgBase, gap: 8 },
  centerText: { fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  errorTitle: { fontSize: 18, color: C.textPrimary, fontWeight: '700' },
  inlineError: { color: C.error, fontWeight: '600' },
  menuBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  burger: { gap: 4 },
  burgerLine: { width: 20, height: 2, backgroundColor: C.white, borderRadius: 1 },
  pill: {
    width: 68,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderRadius: 10,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: C.white, zIndex: 1 },
  body: { flex: 1, flexDirection: 'row' },
  tabletSidebar: { width: 280, borderRightWidth: 1, borderRightColor: C.border, backgroundColor: C.bgSurface },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    ...elev(2),
  },
  cardHead: { backgroundColor: C.primary, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, gap: 6 },
  sectionPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sectionPillText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  testTitle: { fontSize: 18, fontWeight: '800', color: C.white, lineHeight: 24 },
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
  cardInner: { padding: 14, gap: 10 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scoreBtn: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.bgBase,
  },
  scoreBtnOn: { backgroundColor: C.primary, borderColor: C.primary },
  scoreBtnTxt: { fontSize: 20, fontWeight: '700', color: C.textSecondary },
  scoreBtnTxtOn: { color: C.white },
  noteInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: C.textPrimary,
    backgroundColor: C.bgBase,
  },
  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navOutline: { borderWidth: 1.5, borderColor: C.primary },
  navFilled: { backgroundColor: C.primary },
  navTxt: { fontSize: 15, fontWeight: '700' },
  navTxtOutline: { color: C.primary },
  navTxtFilled: { color: C.white },
  captureRow: { flexDirection: 'row' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgSurface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 30,
    gap: 10,
    ...elev(3),
  },
  actBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actOutline: { borderWidth: 1.5, borderColor: C.secondary },
  actFilled: { backgroundColor: C.primary },
  actTxt: { fontSize: 14, fontWeight: '700' },
  actTxtOutline: { color: C.secondary },
  actTxtFilled: { color: C.white },
  bottomCenter: { flex: 1, alignItems: 'center' },
  bottomInfo: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay, zIndex: 10 },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_W,
    zIndex: 20,
    backgroundColor: C.bgSurface,
    ...elev(12),
  },
});

const sb = StyleSheet.create({
  section: { paddingTop: 14, paddingHorizontal: 10, paddingBottom: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingLeft: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, marginBottom: 2 },
  rowActive: { backgroundColor: `${C.primary}18` },
  idx: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: C.bgBase,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  idxActive: { backgroundColor: C.primary, borderColor: C.primary },
  idxTxt: { fontSize: 11, fontWeight: '700', color: C.textSecondary },
  idxTxtActive: { color: C.white },
  rowName: { flex: 1, fontSize: 13, color: C.textPrimary, lineHeight: 18 },
  rowNameActive: { color: C.primary, fontWeight: '600' },
  checkWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${C.success}22`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkTxt: { fontSize: 10, color: C.success, fontWeight: '700' },
});
