import { StyleSheet, Text, View } from 'react-native';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <View style={styles.logoDot} />
          <Text style={styles.brandText}>NeurEye</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <Text style={styles.hospitalText}>Hospital Virgen del Rocio</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.brand,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.brandDark,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.contentMaxWidth,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: 130,
  },
  logoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D9F1F4',
    borderWidth: 2,
    borderColor: '#0B5E68',
  },
  brandText: {
    color: '#E7FAFC',
    ...TYPOGRAPHY.label,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.h3,
  },
  subtitle: {
    color: '#D7F5F8',
    ...TYPOGRAPHY.bodySmall,
  },
  hospitalText: {
    minWidth: 220,
    textAlign: 'right',
    color: '#E7FAFC',
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
  },
});
