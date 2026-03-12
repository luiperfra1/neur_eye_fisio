import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { SectionCard } from '@/components/common/SectionCard';
import { InfoRow } from '@/components/common/InfoRow';
import { StatusBadge } from '@/components/common/StatusBadge';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateSession'>;

export function CreateSessionScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= LAYOUT.tabletBreakpoint;

  return (
    <ScreenLayout title="Crear sesion" subtitle="Preparacion previa de paciente y escala">
      <View style={[styles.columns, !isTablet && styles.columnsMobile]}>
        <View style={styles.column}>
          <SectionCard title="Datos de sesion" subtitle="Campos placeholder sin guardado real.">
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Paciente ID</Text>
              <View style={styles.inputPlaceholder}><Text style={styles.inputText}>1234</Text></View>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Profesional</Text>
              <View style={styles.inputPlaceholder}><Text style={styles.inputText}>Fisioterapeuta 01</Text></View>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Escala</Text>
              <View style={styles.selectPlaceholder}>
                <Text style={styles.inputText}>TIS - Trunk Impairment Scale</Text>
                <Text style={styles.chevron}>v</Text>
              </View>
            </View>
          </SectionCard>
        </View>

        <View style={styles.column}>
          <SectionCard title="Resumen previo" subtitle="Vista clinica previa antes de iniciar">
            <InfoRow label="Escala seleccionada" value="TIS" />
            <InfoRow label="Numero de pruebas" value="10" />
            <InfoRow label="Tiempo estimado" value="20 - 25 min" />
            <InfoRow label="Modo" value="Evaluacion inicial" />
            <StatusBadge status="DRAFT" label="Lista para iniciar" />
          </SectionCard>

          <SectionCard title="Nota" subtitle="No hay logica real de validacion en esta fase.">
            <Text style={styles.noteText}>
              Este flujo es solo visual para validar jerarquia, composicion y estilo en tablet.
            </Text>
          </SectionCard>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Iniciar prueba" onPress={() => navigation.navigate('TestExecution')} style={styles.actionButton} />
        <PrimaryButton label="Cancelar" variant="secondary" onPress={() => navigation.goBack()} style={styles.actionButton} />
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
  column: {
    flex: 1,
    gap: SPACING.lg,
  },
  inputBlock: {
    gap: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  inputPlaceholder: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  selectPlaceholder: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  inputText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  chevron: {
    ...TYPOGRAPHY.h3,
    color: COLORS.brandDark,
  },
  noteText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionButton: {
    minWidth: 190,
  },
});
