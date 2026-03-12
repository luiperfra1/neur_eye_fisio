import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { SectionCard } from '@/components/common/SectionCard';
import { InfoRow } from '@/components/common/InfoRow';
import { StatusBadge } from '@/components/common/StatusBadge';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= LAYOUT.tabletBreakpoint;

  return (
    <ScreenLayout title="Resumen de la sesion" subtitle="Sesion completada | Tiempo total 22:08">
      <View style={[styles.columns, !isTablet && styles.columnsMobile]}>
        <View style={styles.mainColumn}>
          <SectionCard title="Paciente 1345 | Escala TIS" subtitle="Resumen global de resultados">
            <InfoRow label="Total pruebas" value="10" />
            <InfoRow label="Completadas" value="10" />
            <InfoRow label="Puntuacion total" value="27" />
            <InfoRow label="Duracion" value="22:08" />
            <StatusBadge status="COMPLETED" label="Sesion completada" />
          </SectionCard>

          <SectionCard title="Detalle de pruebas">
            <View style={styles.testItem}>
              <Text style={styles.testTitle}>Prueba 1 - Equilibrio dinamico</Text>
              <InfoRow label="Puntuacion" value="2" />
              <InfoRow label="Duracion" value="03:34" />
            </View>
            <View style={styles.testItem}>
              <Text style={styles.testTitle}>Prueba 2 - Coordinacion</Text>
              <InfoRow label="Puntuacion" value="1" />
              <InfoRow label="Duracion" value="02:50" />
            </View>
          </SectionCard>
        </View>

        <View style={styles.sideColumn}>
          <SectionCard title="Audio y transcripcion">
            <InfoRow label="Audio asociado" value="Disponible" />
            <InfoRow label="Transcripcion" value="Parcial" />
            <PrimaryButton label="Abrir transcripcion" onPress={() => navigation.navigate('Transcription')} />
          </SectionCard>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Volver a sesiones" variant="secondary" onPress={() => navigation.popToTop()} />
        <PrimaryButton label="Confirmar resumen" onPress={() => navigation.popToTop()} />
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
  },
  testItem: {
    gap: SPACING.xs,
  },
  testTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
});
