import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { setSessionStatus } from '@/services/sessionService';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionPause'>;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bgBase:        '#F0F2F4',
  bgSurface:     '#FFFFFF',
  primary:       '#2E6E7E',
  secondary:     '#5A7A8A',
  success:       '#3A7D5C',
  warning:       '#B07D2E',
  error:         '#A03030',
  textPrimary:   '#1A2328',
  textSecondary: '#5C6B73',
  border:        '#CDD3D8',
  white:         '#FFFFFF',
};

const elev = (n: number) => Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: n }, shadowOpacity: 0.05 + n * 0.015, shadowRadius: n * 2 },
  android: { elevation: n },
}) ?? {};

// ─────────────────────────────────────────────────────────────────────────────
export function SessionPauseScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;

  const handleContinue = () => {
    setSessionStatus(sessionId, 'IN_PROGRESS');
    navigation.goBack();
  };

  const handleFinish = () => {
    setSessionStatus(sessionId, 'COMPLETED');
    navigation.replace('SessionSummary', { sessionId });
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Text style={s.backIcon}>‹</Text>
        </Pressable>
        <View style={s.topCenter}>
          <Text style={s.topTitle}>Sesión pausada</Text>
          <Text style={s.topSub}>{sessionId}</Text>
        </View>
        {/* Pulsing pause indicator */}
        <View style={s.pauseIndicator}>
          <View style={s.pauseDot} />
          <Text style={s.pauseLabel}>Pausa</Text>
        </View>
      </View>

      {/* ── Body — centered ───────────────────────────────────────────── */}
      <View style={s.body}>

        {/* Icon */}
        <View style={s.iconWrap}>
          <Text style={s.iconText}>⏸</Text>
        </View>

        {/* Message card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sesión en pausa</Text>
          <Text style={s.cardBody}>
            El flujo operativo está detenido. Todos los datos registrados hasta ahora se conservan correctamente.
          </Text>

          <View style={s.divider} />

          {/* Info rows */}
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Sesión</Text>
            <Text style={s.infoValue}>{sessionId}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Estado</Text>
            <View style={s.stateBadge}>
              <View style={s.stateDot} />
              <Text style={s.stateTxt}>Pausada</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <Pressable
            style={({ pressed }) => [s.btn, s.btnPrimary, pressed && s.btnPressed]}
            onPress={handleContinue}
          >
            <Text style={s.btnTxtLight}>▶  Continuar sesión</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.btn, s.btnDanger, pressed && s.btnPressed]}
            onPress={handleFinish}
          >
            <Text style={s.btnTxtLight}>■  Finalizar y ver resumen</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.btn, s.btnOutline, pressed && s.btnPressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.btnTxtDark}>Volver</Text>
          </Pressable>
        </View>

      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primary,
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
    ...elev(4),
  },
  backBtn:  { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 28, color: C.white, lineHeight: 32, marginTop: -2 },
  topCenter: { flex: 1 },
  topTitle:  { fontSize: 15, fontWeight: '700', color: C.white },
  topSub:    { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },

  pauseIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${C.warning}30`,
    borderWidth: 1, borderColor: `${C.warning}66`,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  pauseDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: C.warning },
  pauseLabel: { fontSize: 11, fontWeight: '700', color: C.warning },

  // Body
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },

  // Icon
  iconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: `${C.warning}18`,
    borderWidth: 2, borderColor: `${C.warning}44`,
    justifyContent: 'center', alignItems: 'center',
  },
  iconText: { fontSize: 32 },

  // Card
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: C.bgSurface,
    borderRadius: 16, borderWidth: 1, borderColor: C.border,
    padding: 20, gap: 10,
    ...elev(3),
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: C.textPrimary, textAlign: 'center' },
  cardBody:  { fontSize: 14, color: C.textSecondary, lineHeight: 20, textAlign: 'center' },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 12, fontWeight: '700', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoValue: { fontSize: 13, fontWeight: '600', color: C.textPrimary },

  stateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: `${C.warning}18`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  stateDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: C.warning },
  stateTxt:   { fontSize: 12, fontWeight: '700', color: C.warning },

  // Buttons
  actions: { width: '100%', maxWidth: 420, gap: 10 },
  btn: {
    width: '100%', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: C.primary },
  btnDanger:  { backgroundColor: C.error },
  btnOutline: { borderWidth: 1.5, borderColor: C.secondary },
  btnPressed: { opacity: 0.85 },
  btnTxtLight: { fontSize: 15, fontWeight: '700', color: C.white },
  btnTxtDark:  { fontSize: 15, fontWeight: '700', color: C.secondary },
});