import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { COLORS, LAYOUT } from '@/constants/theme';

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ScreenLayout({ title, subtitle, children }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={title} subtitle={subtitle} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: LAYOUT.contentPadding,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: LAYOUT.contentMaxWidth,
    gap: 16,
  },
});
