import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, variant = 'primary', style }: PrimaryButtonProps) {
  const variantStyle =
    variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : styles.danger;

  const pressedStyle =
    variant === 'primary'
      ? styles.primaryPressed
      : variant === 'secondary'
      ? styles.secondaryPressed
      : styles.dangerPressed;

  const labelStyle = variant === 'secondary' ? styles.secondaryLabel : styles.primaryLabel;

  return (
    <Pressable
      style={({ pressed }) => [styles.base, variantStyle, pressed && pressedStyle, style]}
      onPress={onPress}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: COLORS.textPrimary,
  },
  primary: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brandDark,
  },
  primaryPressed: {
    backgroundColor: COLORS.brandPressed,
  },
  secondary: {
    backgroundColor: COLORS.surfaceStrong,
    borderColor: COLORS.border,
  },
  secondaryPressed: {
    backgroundColor: COLORS.brandSoft,
  },
  danger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  dangerPressed: {
    backgroundColor: '#7F1F1F',
  },
});
