import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Elevation, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { mockData } from '@/lib/mock';

/**
 * Design builds only: the offline-sync pill and the floating "Ask Maple"
 * button that every signed-in screen will carry. Renders nothing without
 * mock data, so deployment builds are unchanged.
 */
export function DesignOverlays() {
  const { styles, theme } = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const mock = useMemo(() => mockData(), []);
  if (!mock) return null;
  const s = mock.shared.sync;
  return (
    <>
      {s.online ? null : (
        <View style={[styles.pill, { top: insets.top + Spacing.two }]} accessibilityRole="text" accessibilityLabel={`Offline. ${s.waiting} changes waiting to sync.`}>
          <Icon name="download" size={14} color={theme.warning} />
          <Text style={styles.pillText} numberOfLines={1}>{`Offline · ${s.waiting} to sync · last ${s.lastSynced}`}</Text>
        </View>
      )}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/copilot')}
        accessibilityRole="button"
        accessibilityLabel="Ask Maple, your study helper">
        <Icon name="sparkle" size={18} color={theme.onAccent} />
        <Text style={styles.fabText}>Ask Maple</Text>
      </Pressable>
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    pill: {
      position: 'absolute',
      alignSelf: 'center',
      maxWidth: '78%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.one,
      borderRadius: Radius.pill,
      backgroundColor: t.warningSoft,
      ...Elevation.card,
    },
    pillText: { ...Type.caption, color: t.warning, fontWeight: '600' },
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
