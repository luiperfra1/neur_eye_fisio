import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { SectionCard } from '@/components/common/SectionCard';
import { InfoRow } from '@/components/common/InfoRow';
import { StatusBadge } from '@/components/common/StatusBadge';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TestExecution'>;

const SCORE_OPTIONS = [0, 1, 2, 3, 4];

export function TestExecutionScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= LAYOUT.tabletBreakpoint;
  const [selectedScore, setSelectedScore] = useState<number | null>(1);

  const progressPercent = 40;

  return (
    <ScreenLayout title="Sesion activa" subtitle="Paciente 1345 | Escala TIS | Seccion 2/7">
      <View style={[styles.columns, !isTablet && styles.columnsMobile]}>
        <View style={styles.mainColumn}>
          <SectionCard title="Prueba actual" subtitle="Equilibrio dinamico en sedestacion | Prueba 4/10">
            <Text style={styles.description}>
              Placeholder operativo inspirado en tus mockups. Aqui ira la consigna completa de la prueba y apoyo visual.
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` as const }]} />
            </View>
            <InfoRow label="Progreso" value="40% completado" />
          </SectionCard>

          <SectionCard title="Puntuacion" subtitle="Seleccion simulada sin persistencia real.">
            <View style={styles.scoreRow}>
              {SCORE_OPTIONS.map((score) => {
                const selected = selectedScore === score;
                return (
                  <PrimaryButton
                    key={score}
                    label={String(score)}
                    variant={selected ? 'primary' : 'secondary'}
                    onPress={() => setSelectedScore(score)}
                    style={styles.scoreButton}
                  />
                );
              })}
            </View>

            <View style={styles.inputMock}>
              <Text style={styles.inputMockText}>Anadir nota (opcional)</Text>
            </View>
          </SectionCard>
        </View>

        <View style={styles.sideColumn}>
          <SectionCard title="Contexto de sesion">
            <InfoRow label="Escala" value="TIS" />
            <InfoRow label="Seccion" value="Coordinacion" />
            <InfoRow label="Tiempo" value="00:12:08" />
            <StatusBadge status="IN_PROGRESS" label="En evaluacion" />
          </SectionCard>

          <SectionCard title="Acciones">
            <PrimaryButton label="Pausar sesion" onPress={() => navigation.navigate('SessionPause')} />
            <PrimaryButton label="Siguiente prueba" variant="secondary" onPress={() => {}} />
            <PrimaryButton label="Finalizar sesion" variant="secondary" onPress={() => navigation.navigate('SessionSummary')} />
          </SectionCard>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  columnsMobile: {
    flexDirection: 'column',
  },
  mainColumn: {
    flex: 2,
    gap: SPACING.lg,
  },
  sideColumn: {
    flex: 1,
    gap: SPACING.lg,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  progressTrack: {
    height: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brandSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  scoreButton: {
    minWidth: 58,
  },
  inputMock: {
    minHeight: 42,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  inputMockText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
});
