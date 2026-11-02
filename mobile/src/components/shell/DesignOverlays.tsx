import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Elevation, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { mockData } from '@/lib/mock';

/**
 * Design builds only: the floating "Ask Maple" button that every signed-in screen
 * will carry. Renders nothing without mock data, so deployment builds are unchanged.
 */
export function DesignOverlays() {
  const { styles, theme } = useStyles(makeStyles);
  const mock = useMemo(() => mockData(), []);
  if (!mock) return null;
  return (
    <Pressable
      style={styles.fab}
      onPress={() => router.push('/copilot')}
      accessibilityRole="button"
      accessibilityLabel="Ask Maple, your study helper">
      <Icon name="sparkle" size={18} color={theme.onAccent} />
      <Text style={styles.fabText}>Ask Maple</Text>
    </Pressable>
  );
}

/**
 * Design builds only: the offline-sync notice, as a slim strip in the layout (above the tab bar)
 * so it never covers a page's title or content.
 */
export function OfflineStrip() {
  const { styles, theme } = useStyles(makeStyles);
  const mock = useMemo(() => mockData(), []);
  if (!mock || mock.shared.sync.online) return null;
  const s = mock.shared.sync;
  return (
    <View style={styles.strip} accessibilityRole="text" accessibilityLabel={`Offline. ${s.waiting} changes waiting to sync.`}>
      <Icon name="download" size={13} color={theme.warning} />
      <Text style={styles.stripText} numberOfLines={1}>{`Offline · ${s.waiting} to sync · last ${s.lastSynced}`}</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    strip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.one,
      paddingHorizontal: Spacing.three,
      paddingVertical: 6,
      backgroundColor: t.warningSoft,
    },
    stripText: { ...Type.caption, color: t.warning, fontWeight: '600' },
    fab: {
      position: 'absolute',
      right: Spacing.four,
      bottom: Spacing.four,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      minHeight: 48,
      paddingHorizontal: Spacing.four,
      borderRadius: Radius.pill,
      backgroundColor: t.accent,
      ...Elevation.raised,
    },
    fabText: { ...Type.small, fontWeight: '700', color: t.onAccent },
  });
}
