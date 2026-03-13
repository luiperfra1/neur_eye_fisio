import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLINICAL_COLORS } from '@/constants/clinicalTheme';

type SidebarShellProps = {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  headerContent?: ReactNode;
  children: ReactNode;
};

export function SidebarShell({ title, subtitle, onClose, headerContent, children }: SidebarShellProps) {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
        </View>
        {onClose ? (
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {headerContent}
      <ScrollView showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLINICAL_COLORS.bgSurface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: CLINICAL_COLORS.divider,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: CLINICAL_COLORS.textPrimary },
  headerSub: { fontSize: 11, color: CLINICAL_COLORS.textSecondary, marginTop: 1 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CLINICAL_COLORS.bgBase,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: { fontSize: 13, color: CLINICAL_COLORS.textSecondary, fontWeight: '700' },
});
