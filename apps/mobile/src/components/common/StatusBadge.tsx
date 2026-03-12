import { StyleSheet, Text, View } from 'react-native';
import { RADIUS, SPACING, STATUS_COLORS, TYPOGRAPHY } from '@/constants/theme';

type StatusKey = keyof typeof STATUS_COLORS;

interface StatusBadgeProps {
  label: string;
  status: StatusKey;
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.label,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
