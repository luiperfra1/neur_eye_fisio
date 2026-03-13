import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CLINICAL_COLORS, elev } from '@/constants/clinicalTheme';

type AppTopBarProps = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
};

export function AppTopBar({ title, subtitle, left, right, onBack }: AppTopBarProps) {
  return (
    <View style={styles.topBar}>
      {left ?? (onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      ) : null)}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ?? <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CLINICAL_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    ...elev(4),
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 28, color: CLINICAL_COLORS.white, lineHeight: 32, marginTop: -2 },
  center: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: CLINICAL_COLORS.white },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  placeholder: { width: 36, height: 36 },
});
