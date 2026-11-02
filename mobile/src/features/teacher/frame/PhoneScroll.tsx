import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

/**
 * On phones, lets a row that is wider than the screen (tabs, chips) scroll sideways
 * instead of wrapping or running off the edge. On wider screens it renders the row as is.
 */
export function PhoneScroll({ phone, children }: { phone: boolean; children: ReactNode }) {
  if (!phone) return <>{children}</>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip} contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { flexGrow: 0, alignSelf: 'stretch' },
  content: { paddingRight: 4 },
});
