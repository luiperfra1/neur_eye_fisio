import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { SectionCard } from '@/components/common/SectionCard';
import { InfoRow } from '@/components/common/InfoRow';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Transcription'>;

const MOCK_TRANSCRIPTION =
  'Paciente mantiene sedestacion con apoyo intermitente. Se observa mejora de control proximal durante la segunda serie. Requiere indicaciones verbales breves para ajustes de tronco. Sin incidencias clinicas durante la prueba.';

export function TranscriptionScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Transcripcion" subtitle="Audio de sesion | Bloque STT placeholder">
      <SectionCard title="Texto transcrito" subtitle="Contenido mock para validacion visual.">
        <InfoRow label="Estado" value="Procesado parcialmente" />
        <InfoRow label="Idioma" value="es-ES" />
        <InfoRow label="Duracion audio" value="03:34" />

        <View style={styles.textBlock}>
          <Text style={styles.text}>{MOCK_TRANSCRIPTION}</Text>
        </View>
      </SectionCard>

      <View style={styles.actions}>
        <PrimaryButton label="Cerrar" variant="secondary" onPress={() => navigation.goBack()} style={styles.button} />
        <PrimaryButton label="Volver a sesiones" onPress={() => navigation.popToTop()} style={styles.button} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  textBlock: {
    minHeight: 190,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  button: {
    minWidth: 180,
  },
});
