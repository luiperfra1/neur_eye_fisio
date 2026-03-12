import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { SectionCard } from '@/components/common/SectionCard';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionPause'>;

export function SessionPauseScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Sesion pausada" subtitle="La evaluacion esta temporalmente detenida">
      <View style={styles.centerWrap}>
        <SectionCard title="Pausa de sesion" subtitle="Revise el estado antes de continuar o terminar.">
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>Sesion pausada correctamente</Text>
            <Text style={styles.messageBody}>
              El cronometro y el flujo de pruebas quedan congelados de forma temporal.
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Continuar" onPress={() => navigation.goBack()} style={styles.actionButton} />
            <PrimaryButton
              label="Terminar sesion"
              variant="danger"
              onPress={() => navigation.navigate('SessionSummary')}
              style={styles.actionButton}
            />
          </View>
        </SectionCard>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  messageBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundElevated,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  messageTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  messageBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  actionButton: {
    minWidth: 170,
  },
});
