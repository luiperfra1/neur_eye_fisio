import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface ClinicalFooterProps {
  leftText: string;
  centerText?: string;
  rightSlot?: ReactNode;
}

export function ClinicalFooter({ leftText, centerText, rightSlot }: ClinicalFooterProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.left}>{leftText}</Text>
        <Text style={styles.center}>{centerText ?? ''}</Text>
        <View style={styles.right}>{rightSlot}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surfaceStrong,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.contentMaxWidth,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  left: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  center: {
    flex: 1,
    textAlign: 'center',
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
});
