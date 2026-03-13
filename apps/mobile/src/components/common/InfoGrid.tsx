import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CLINICAL_COLORS } from '@/constants/clinicalTheme';

type InfoGridProps = {
  children: ReactNode;
};

type InfoCellProps = {
  label: string;
  value: string;
  numberOfLines?: number;
};

export function InfoGrid({ children }: InfoGridProps) {
  return <View style={styles.grid}>{children}</View>;
}

export function InfoCell({ label, value, numberOfLines = 1 }: InfoCellProps) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={numberOfLines}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  cell: { minWidth: '45%', flex: 1, backgroundColor: CLINICAL_COLORS.bgBase, borderRadius: 8, padding: 10, gap: 2 },
  label: { fontSize: 10, fontWeight: '700', color: CLINICAL_COLORS.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase' },
  value: { fontSize: 14, fontWeight: '600', color: CLINICAL_COLORS.textPrimary },
});
