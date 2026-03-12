import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { SectionCard } from '@/components/common/SectionCard';
import { InfoRow } from '@/components/common/InfoRow';
import { StatusBadge } from '@/components/common/StatusBadge';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionsList'>;

type SessionState = 'COMPLETED' | 'IN_PROGRESS' | 'PAUSED';

interface SessionCard {
  id: string;
  patient: string;
  scale: string;
  status: SessionState;
  date: string;
}

const MOCK_SESSIONS: SessionCard[] = [
  { id: 'SES-1001', patient: 'Paciente 1234', scale: 'TIS', status: 'COMPLETED', date: '12 Mar 10:34' },
  { id: 'SES-1002', patient: 'Paciente 1267', scale: 'TIS', status: 'IN_PROGRESS', date: '12 Mar 11:20' },
  { id: 'SES-1003', patient: 'Paciente 1288', scale: 'Berg', status: 'PAUSED', date: '12 Mar 12:05' },
  { id: 'SES-1004', patient: 'Paciente 1310', scale: 'TIS', status: 'COMPLETED', date: '12 Mar 12:44' },
  { id: 'SES-1005', patient: 'Paciente 1331', scale: 'TIS', status: 'COMPLETED', date: '12 Mar 13:02' },
  { id: 'SES-1006', patient: 'Paciente 1345', scale: 'TIS', status: 'IN_PROGRESS', date: '12 Mar 13:18' },
];

const STATUS_LABEL: Record<SessionState, string> = {
  COMPLETED: 'Terminada',
  IN_PROGRESS: 'En curso',
  PAUSED: 'Pausada',
};

export function SessionsListScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();

  const cardWidth = useMemo(() => {
    if (width >= 1200) return '32%';
    if (width >= LAYOUT.tabletBreakpoint) return '48.5%';
    return '100%';
  }, [width]);

  return (
    <ScreenLayout title="Sesiones" subtitle="Unidad de fisioterapia neurologica">
      <SectionCard title="Buscador de sesiones" subtitle="Filtro visual placeholder sin logica real.">
        <View style={styles.searchBox}>
          <Text style={styles.searchText}>Buscar por paciente, escala o estado...</Text>
        </View>
      </SectionCard>

      <View style={styles.grid}>
        {MOCK_SESSIONS.map((session) => (
          <Pressable
            key={session.id}
            style={[styles.cardWrapper, { width: cardWidth }]}
            onPress={() => navigation.navigate('SessionSummary')}
          >
            <SectionCard
              title={`Escala: ${session.scale}`}
              subtitle={session.id}
              rightSlot={<StatusBadge status={session.status} label={STATUS_LABEL[session.status]} />}
            >
              <InfoRow label="Paciente" value={session.patient} />
              <InfoRow label="Fecha" value={session.date} />
            </SectionCard>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Crear sesion" onPress={() => navigation.navigate('CreateSession')} style={styles.actionButton} />
        <PrimaryButton
          label="Continuar sesion en curso"
          variant="secondary"
          style={styles.actionButton}
          onPress={() => navigation.navigate('TestExecution')}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 46,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  searchText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  cardWrapper: {
    minWidth: 280,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionButton: {
    minWidth: 220,
  },
});
