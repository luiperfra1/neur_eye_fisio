import { StyleSheet, Text, View } from 'react-native';

import {
  CLINICAL_COLORS,
  getCaptureStatusColor,
  getCaptureStatusLabel,
  withAlpha,
} from '@/constants/clinicalTheme';

type CaptureStatusPillProps = {
  label: string;
  status?: string;
  color?: string;
  text?: string;
  icon?: string;
  compact?: boolean;
};

export function CaptureStatusPill({
  label,
  status,
  color,
  text,
  icon,
  compact = false,
}: CaptureStatusPillProps) {
  const resolvedColor = color ?? getCaptureStatusColor(status ?? '');
  const resolvedText = text ?? getCaptureStatusLabel(status ?? '');

  return (
    <View
      style={[
        styles.wrap,
        compact ? styles.wrapCompact : styles.wrapRegular,
        {
          borderColor: withAlpha(resolvedColor, '44'),
          backgroundColor: withAlpha(resolvedColor, compact ? '10' : '12'),
        },
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={[styles.dot, { backgroundColor: resolvedColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.status, { color: resolvedColor }]}>{resolvedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  wrapRegular: { gap: 5, paddingHorizontal: 10, paddingVertical: 8 },
  wrapCompact: { gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  icon: { fontSize: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  label: { fontSize: 12, fontWeight: '700', color: CLINICAL_COLORS.textSecondary, flex: 1 },
  status: { fontSize: 11, fontWeight: '600' },
});
