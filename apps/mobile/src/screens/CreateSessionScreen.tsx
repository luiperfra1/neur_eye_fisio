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
import { InfoCell, InfoGrid } from '@/components/common/InfoGrid';
import { SidebarShell } from '@/components/common/SidebarShell';
import { CLINICAL_COLORS as C, CLINICAL_LAYOUT, elev } from '@/constants/clinicalTheme';
import { LAYOUT } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { ApiError } from '@/services/apiClient';
import { getAvailableScales, getScaleById } from '@/services/scaleService';
import { createSession } from '@/services/sessionService';
import type { ScaleDefinition } from '@/types/scale';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateSession'>;

const SIDEBAR_W = CLINICAL_LAYOUT.sidebarWidth;

export function CreateSessionScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= LAYOUT.tabletBreakpoint;
  const [scales, setScales] = useState<ScaleDefinition[]>([]);
  const [selectedScaleId, setSelectedScaleId] = useState<string>('');
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition | null>(null);
  const [patientId, setPatientId] = useState('');
  const [generalComments, setGeneralComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sidebarX = useRef(new Animated.Value(-SIDEBAR_W)).current;

  const totalTests = useMemo(
    () => selectedScale?.sections.reduce((acc, sec) => acc + sec.tests.length, 0) ?? 0,
    [selectedScale],
  );

  const loadScales = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const scaleList = await getAvailableScales();
      setScales(scaleList);
      const firstScale = scaleList[0];
      if (firstScale) {
        setSelectedScaleId(firstScale.id);
        const detail = await getScaleById(firstScale.id);
        setSelectedScale(detail);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudieron cargar escalas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScales();
  }, [loadScales]);

  const onChangeScale = useCallback(async (scaleId: string) => {
    try {
      setSelectedScaleId(scaleId);
      const detail = await getScaleById(scaleId);
      setSelectedScale(detail);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudo cargar el detalle de escala.');
      }
    }
  }, []);

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

  const handleStart = async () => {
    if (!selectedScale || !patientId.trim()) return;
    try {
      setSubmitting(true);
      setErrorText(null);
      const session = await createSession({
        scaleId: selectedScale.id,
        patientId: patientId.trim(),
        generalComments: generalComments.trim() || undefined,
      });
      navigation.navigate('TestExecution', { sessionId: session.id });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorText(`Error ${error.status}: ${error.message}`);
      } else {
        setErrorText('No se pudo crear la sesion.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sidebarContent = selectedScale ? (
    <SidebarShell
      title="Estructura"
      subtitle={`${selectedScale.code} · ${selectedScale.version}`}
      onClose={!isTablet ? closeSidebar : undefined}
      headerContent={(
        <View style={sb.stats}>
          <View style={sb.statItem}>
            <Text style={sb.statValue}>{selectedScale.sections.length}</Text>
            <Text style={sb.statLabel}>secciones</Text>
          </View>
          <View style={sb.statDiv} />
          <View style={sb.statItem}>
            <Text style={sb.statValue}>{totalTests}</Text>
            <Text style={sb.statLabel}>pruebas</Text>
          </View>
        </View>
      )}
    >
      {selectedScale.sections.map((section, sectionIndex) => (
        <View key={section.id} style={sb.section}>
          <View style={sb.sectionHeader}>
            <View style={sb.sectionNum}>
              <Text style={sb.sectionNumTxt}>{sectionIndex + 1}</Text>
            </View>
            <Text style={sb.sectionName}>{section.name}</Text>
            <Text style={sb.sectionCount}>{section.tests.length}</Text>
          </View>
          {section.tests.map((test, testIndex) => (
            <View key={test.id} style={sb.testRow}>
              <View style={sb.testIdx}>
                <Text style={sb.testIdxTxt}>{testIndex + 1}</Text>
              </View>
              <Text style={sb.testName} numberOfLines={2}>
                {test.name}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </SidebarShell>
  ) : null;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <AppTopBar
        title="Nueva sesion"
        subtitle="Configuracion inicial de evaluacion"
        left={!isTablet ? (
          <Pressable onPress={openSidebar} style={s.menuBtn} hitSlop={10}>
            <View style={s.burger}>{[0, 1, 2].map((i) => <View key={i} style={s.burgerLine} />)}</View>
          </Pressable>
        ) : undefined}
        right={(
          <Pressable onPress={() => navigation.goBack()} style={s.cancelTopBtn}>
            <Text style={s.cancelTopTxt}>Cancelar</Text>
          </Pressable>
        )}
      />

      <View style={s.body}>
        {isTablet && <View style={s.tabletSidebar}>{sidebarContent}</View>}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={s.centerBox}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={s.centerText}>Cargando escalas...</Text>
            </View>
          ) : errorText ? (
            <View style={s.centerBox}>
              <Text style={s.errorText}>{errorText}</Text>
              <Pressable style={s.retryBtn} onPress={() => void loadScales()}>
                <Text style={s.retryTxt}>Reintentar</Text>
              </Pressable>
            </View>
          ) : selectedScale ? (
            <>
              <View style={s.card}>
                <Text style={s.cardLabel}>Escala clinica</Text>
                <View style={s.cardInner}>
                  <View style={s.scaleGrid}>
                    {scales.map((scale) => {
                      const active = scale.id === selectedScaleId;
                      return (
                        <Pressable
                          key={scale.id}
                          onPress={() => void onChangeScale(scale.id)}
                          style={[s.scaleCard, active && s.scaleCardActive]}
                        >
                          <View style={s.scaleCardTop}>
                            <Text style={[s.scaleCode, active && s.scaleCodeActive]}>{scale.code}</Text>
                            {active && <Text style={s.scaleCheck}>✓</Text>}
                          </View>
                          <Text style={[s.scaleVersion, active && s.scaleVersionActive]}>
                            v{scale.version}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={s.card}>
                <Text style={s.cardLabel}>Datos de sesion</Text>
                <View style={s.cardInner}>
                  <Text style={s.fieldLabel}>Patient ID</Text>
                  <TextInput
                    value={patientId}
                    onChangeText={setPatientId}
                    style={s.input}
                    placeholder="Ej: PAT-0001"
                    placeholderTextColor={C.textSecondary}
                  />

                  <Text style={s.fieldLabel}>Duracion estimada de escala</Text>
                  <View style={s.readOnlyField}>
                    <Text style={s.readOnlyFieldText}>{selectedScale.estimatedDurationMin ?? 0} min</Text>
                  </View>

                  <Text style={s.fieldLabel}>Comentarios generales</Text>
                  <TextInput
                    value={generalComments}
                    onChangeText={setGeneralComments}
                    style={[s.input, s.textArea]}
                    multiline
                    placeholder="Opcional"
                    placeholderTextColor={C.textSecondary}
                  />
                </View>
              </View>

              <View style={s.card}>
                <Text style={s.cardLabel}>Resumen previo</Text>
                <InfoGrid>
                  <InfoCell label="Paciente" value={patientId || '-'} />
                  <InfoCell label="Escala" value={`${selectedScale.code} ${selectedScale.version}`} />
                  <InfoCell label="Secciones" value={String(selectedScale.sections.length)} />
                  <InfoCell label="Pruebas" value={String(totalTests)} />
                  <InfoCell label="Duracion" value={`${selectedScale.estimatedDurationMin ?? 0} min`} />
                </InfoGrid>
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>

      <View style={s.bottomBar}>
        <View style={s.bottomInfo}>
          <Text style={s.bottomScale}>{selectedScale?.code ?? '-'}</Text>
          <Text style={s.bottomMeta}>
            {totalTests} pruebas · {selectedScale?.sections.length ?? 0} secciones
          </Text>
        </View>
        <Pressable
          style={[s.startBtn, (submitting || !selectedScale || !patientId.trim()) && s.startBtnDisabled]}
          onPress={() => void handleStart()}
          disabled={submitting || !selectedScale || !patientId.trim()}
        >
          <Text style={s.startBtnTxt}>{submitting ? 'Creando...' : 'Iniciar evaluacion ▶'}</Text>
        </Pressable>
      </View>

      {!isTablet && sidebarOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[s.mobileSidebar, { transform: [{ translateX: sidebarX }] }]}>
            {sidebarContent}
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  menuBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  burger: { gap: 4 },
  burgerLine: { width: 20, height: 2, backgroundColor: C.white, borderRadius: 1 },
  cancelTopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelTopTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.88)' },
  body: { flex: 1, flexDirection: 'row' },
  tabletSidebar: { width: SIDEBAR_W, borderRightWidth: 1, borderRightColor: C.border, backgroundColor: C.bgSurface },
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
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  input: {
    height: 46,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: C.textPrimary,
    backgroundColor: C.bgBase,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
  readOnlyField: {
    height: 46,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#EEF1F4',
  },
  readOnlyFieldText: { fontSize: 15, color: C.textPrimary, fontWeight: '600' },
  scaleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scaleCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: C.bgBase,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 12,
    gap: 2,
  },
  scaleCardActive: { backgroundColor: `${C.primary}12`, borderColor: C.primary },
  scaleCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scaleCode: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
  scaleCodeActive: { color: C.primary },
  scaleCheck: { fontSize: 14, color: C.primary, fontWeight: '800' },
  scaleVersion: { fontSize: 11, color: C.textSecondary },
  scaleVersionActive: { color: C.primary },
  centerBox: {
    backgroundColor: C.bgSurface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  centerText: { color: C.textSecondary, fontSize: 13 },
  errorText: { color: C.error, fontWeight: '600', textAlign: 'center' },
  retryBtn: { backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  retryTxt: { color: C.white, fontWeight: '700', fontSize: 13 },
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
  bottomInfo: { flex: 1 },
  bottomScale: { fontSize: 15, fontWeight: '800', color: C.textPrimary },
  bottomMeta: { fontSize: 12, color: C.textSecondary, marginTop: 1 },
  startBtn: { backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  startBtnDisabled: { backgroundColor: C.border },
  startBtnTxt: { fontSize: 14, fontWeight: '700', color: C.white },
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
  stats: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.divider },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: C.primary },
  statLabel: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDiv: { width: 1, backgroundColor: C.divider, marginVertical: 8 },
  section: { paddingTop: 12, paddingHorizontal: 10, paddingBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  sectionNum: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumTxt: { fontSize: 11, fontWeight: '800', color: C.white },
  sectionName: { flex: 1, fontSize: 13, fontWeight: '700', color: C.textPrimary },
  sectionCount: { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 5, paddingLeft: 4 },
  testIdx: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: C.bgBase,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  testIdxTxt: { fontSize: 10, fontWeight: '700', color: C.textSecondary },
  testName: { flex: 1, fontSize: 12, color: C.textSecondary, lineHeight: 16 },
});
