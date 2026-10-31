import { StyleSheet, Text, View } from 'react-native';

import type { MockData } from '@/mock';

export type Dash = MockData['learner']['dashboard'];

/** The soft white card the dashboard reference uses everywhere. */
export const panel = { borderRadius: 14, backgroundColor: '#FFFFFF', shadowColor: '#0F2350', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } } as const;

export function Bar({ value, color = '#22C55E', track = 'rgba(255,255,255,0.35)', height = 6 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(value * 100)}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function LiveBadge({ text }: { text: string }) {
  return (
    <View style={styles.liveBadge}>
      <Text style={styles.liveBadgeText}>{`▸ ${text}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  liveBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#E5484D' },
  liveBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' },
});
