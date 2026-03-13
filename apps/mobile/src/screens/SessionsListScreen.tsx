import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { listSessions, searchSessions } from '@/services/sessionService';
import type { RootStackParamList } from '@/navigation/types';
import type { Session } from '@/types/session';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionsList'>;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bgBase:        '#F0F2F4',
  bgSurface:     '#FFFFFF',
  primary:       '#2E6E7E',
  primaryDark:   '#235A6A',
  secondary:     '#5A7A8A',
  success:       '#3A7D5C',
  warning:       '#B07D2E',
  error:         '#A03030',
  textPrimary:   '#1A2328',
  textSecondary: '#5C6B73',
  border:        '#CDD3D8',
  divider:       '#E2E6EA',
  white:         '#FFFFFF',
};

const elev = (n: number) => Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: n }, shadowOpacity: 0.05 + n * 0.015, shadowRadius: n * 2 },
  android: { elevation: n },
}) ?? {};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<Session['status'], { label: string; color: string; bg: string }> = {
  IN_PROGRESS: { label: 'En curso',  color: C.primary,   bg: `${C.primary}18`  },
  PAUSED:      { label: 'Pausada',   color: C.warning,   bg: `${C.warning}18`  },
  COMPLETED:   { label: 'Terminada', color: C.success,   bg: `${C.success}18`  },
  DRAFT:       { label: 'Borrador',  color: C.secondary, bg: `${C.secondary}18`},
};

// ─────────────────────────────────────────────────────────────────────────────
export function SessionsListScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const { width } = useWindowDimensions();

  const sessions = useMemo(
    () => (searchText.trim() ? searchSessions(searchText) : listSessions()),
    [searchText]
  );

  const inProgress = sessions.find(s => s.status === 'IN_PROGRESS');

  // Responsive columns
  const numCols = width >= 1200 ? 3 : width >= 768 ? 2 : 1;

  // Stats
  const stats = useMemo(() => ({
    total:      sessions.length,
    inProgress: sessions.filter(s => s.status === 'IN_PROGRESS').length,
    completed:  sessions.filter(s => s.status === 'COMPLETED').length,
    paused:     sessions.filter(s => s.status === 'PAUSED').length,
  }), [sessions]);

  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topCenter}>
          <Text style={s.topTitle}>Sesiones</Text>
          <Text style={s.topSub}>Unidad de fisioterapia neurológica</Text>
        </View>
        <Pressable
          style={s.newBtn}
          onPress={() => navigation.navigate('CreateSession')}
        >
          <Text style={s.newBtnTxt}>+ Nueva</Text>
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Stats strip ─────────────────────────────────────────────── */}
        <View style={s.statsStrip}>
          <MiniStat label="Total"     value={stats.total}      color={C.secondary} />
          <View style={s.statDiv} />
          <MiniStat label="En curso"  value={stats.inProgress} color={C.primary}   />
          <View style={s.statDiv} />
          <MiniStat label="Pausadas"  value={stats.paused}     color={C.warning}   />
          <View style={s.statDiv} />
          <MiniStat label="Acabadas"  value={stats.completed}  color={C.success}   />
        </View>

        {/* ── Search ──────────────────────────────────────────────────── */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por paciente, escala, estado o ID…"
            placeholderTextColor={C.textSecondary}
            style={s.searchInput}
            clearButtonMode="while-editing"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} hitSlop={8}>
              <Text style={s.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── Results label ───────────────────────────────────────────── */}
        <View style={s.resultsRow}>
          <Text style={s.resultsLabel}>
            {searchText.trim()
              ? `${sessions.length} resultado${sessions.length !== 1 ? 's' : ''} para "${searchText}"`
              : `${sessions.length} sesiones`}
          </Text>
        </View>

        {/* ── Session grid ────────────────────────────────────────────── */}
        {sessions.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyTitle}>Sin resultados</Text>
            <Text style={s.emptySub}>Prueba con otro término de búsqueda</Text>
          </View>
        ) : (
          <View style={[s.grid, numCols > 1 && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                numCols={numCols}
                onPress={() => navigation.navigate('SessionSummary', { sessionId: session.id })}
                onResume={
                  session.status === 'IN_PROGRESS' || session.status === 'PAUSED'
                    ? () => navigation.navigate('TestExecution', { sessionId: session.id })
                    : undefined
                }
              />
            ))}
          </View>
        )}

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <View style={s.bottomBar}>
        <Text style={s.bottomInfo}>{sessions.length} sesiones visibles</Text>
        <View style={s.bottomActions}>
          {inProgress && (
            <Pressable
              style={[s.actBtn, s.actOutline]}
              onPress={() => navigation.navigate('TestExecution', { sessionId: inProgress.id })}
            >
              <Text style={[s.actTxt, s.actTxtOutline]}>▶ Continuar</Text>
            </Pressable>
          )}
          <Pressable
            style={[s.actBtn, s.actFilled]}
            onPress={() => navigation.navigate('CreateSession')}
          >
            <Text style={[s.actTxt, s.actTxtFilled]}>+ Crear sesión</Text>
          </Pressable>
        </View>
      </View>

    </SafeAreaView>
  );
}

// ─── SessionCard ─────────────────────────────────────────────────────────────
function SessionCard({
  session,
  numCols,
  onPress,
  onResume,
}: {
  session: Session;
  numCols: number;
  onPress: () => void;
  onResume?: () => void;
}) {
  const st = STATUS[session.status];
  const updatedAt = new Date(session.updatedAt);
  const timeStr   = updatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr   = updatedAt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

  const isActive = session.status === 'IN_PROGRESS' || session.status === 'PAUSED';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        sc.wrap,
        numCols > 1 && sc.wrapMulti,
        pressed && sc.wrapPressed,
        isActive && sc.wrapActive,
      ]}
    >
      {/* Active indicator strip */}
      {isActive && <View style={[sc.strip, { backgroundColor: st.color }]} />}

      {/* Header */}
      <View style={sc.header}>
        <View style={sc.headerLeft}>
          <Text style={sc.scaleName} numberOfLines={1}>{session.scaleName}</Text>
          <Text style={sc.sessionId}>{session.id}</Text>
        </View>
        <View style={[sc.badge, { backgroundColor: st.bg, borderColor: st.color + '44' }]}>
          <View style={[sc.badgeDot, { backgroundColor: st.color }]} />
          <Text style={[sc.badgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Meta */}
      <View style={sc.meta}>
        <View style={sc.metaItem}>
          <Text style={sc.metaLabel}>Paciente</Text>
          <Text style={sc.metaValue}>{session.patientId}</Text>
        </View>
        <View style={sc.metaItem}>
          <Text style={sc.metaLabel}>Actualizado</Text>
          <Text style={sc.metaValue}>{timeStr} · {dateStr}</Text>
        </View>
      </View>

      {/* Resume button — only for active sessions */}
      {onResume && (
        <Pressable
          onPress={e => { e.stopPropagation?.(); onResume(); }}
          style={sc.resumeBtn}
        >
          <Text style={sc.resumeTxt}>
            {session.status === 'IN_PROGRESS' ? '▶ Continuar sesión' : '▶ Reanudar sesión'}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// ─── MiniStat ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={ms.wrap}>
      <Text style={[ms.value, { color }]}>{value}</Text>
      <Text style={ms.label}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primary,
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
    ...elev(4),
  },
  topCenter: { flex: 1 },
  topTitle:  { fontSize: 17, fontWeight: '800', color: C.white },
  topSub:    { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  newBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  newBtnTxt: { fontSize: 13, fontWeight: '700', color: C.white },

  scroll:        { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: C.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', ...elev(2),
  },
  statDiv: { width: 1, backgroundColor: C.divider, marginVertical: 10 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 2,
    ...elev(1),
  },
  searchIcon:  { fontSize: 18, color: C.textSecondary },
  searchInput: { flex: 1, fontSize: 15, color: C.textPrimary, paddingVertical: 11 },
  clearBtn:    { fontSize: 13, color: C.textSecondary, paddingHorizontal: 4 },

  // Results
  resultsRow:   { paddingHorizontal: 2 },
  resultsLabel: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },

  // Grid
  grid: { gap: 10 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyIcon:  { fontSize: 36 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
  emptySub:   { fontSize: 14, color: C.textSecondary },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bgSurface,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingHorizontal: 14, paddingVertical: 30,
    ...elev(4),
  },
  bottomInfo:    { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  bottomActions: { flexDirection: 'row', gap: 8 },
  actBtn:        { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actOutline:    { borderWidth: 1.5, borderColor: C.secondary },
  actFilled:     { backgroundColor: C.primary },
  actTxt:        { fontSize: 13, fontWeight: '700' },
  actTxtOutline: { color: C.secondary },
  actTxtFilled:  { color: C.white },
});

// SessionCard styles
const sc = StyleSheet.create({
  wrap: {
    backgroundColor: C.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', ...elev(2),
  },
  wrapMulti:   { flex: 1, minWidth: 280 },
  wrapPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  wrapActive:  { borderColor: C.primary + '55' },

  strip: { height: 3, width: '100%' },

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14, paddingBottom: 8, gap: 10,
  },
  headerLeft: { flex: 1 },
  scaleName:  { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  sessionId:  { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
    flexShrink: 0,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },

  meta: {
    flexDirection: 'row', gap: 0,
    paddingHorizontal: 14, paddingBottom: 12,
  },
  metaItem:  { flex: 1, gap: 2 },
  metaLabel: { fontSize: 10, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase' },
  metaValue: { fontSize: 13, fontWeight: '600', color: C.textPrimary },

  resumeBtn: {
    marginHorizontal: 14, marginBottom: 12,
    backgroundColor: `${C.primary}12`,
    borderWidth: 1.5, borderColor: `${C.primary}55`,
    borderRadius: 8, paddingVertical: 9,
    alignItems: 'center',
  },
  resumeTxt: { fontSize: 13, fontWeight: '700', color: C.primary },
});

// MiniStat styles
const ms = StyleSheet.create({
  wrap:  { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  value: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: '600', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
});