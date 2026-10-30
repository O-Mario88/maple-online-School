import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { IconName } from '@/lib/icons';

const RAIL = '#0E1B3D';
const RAIL_ON = '#1D3A8A';

export type RailKey = 'class' | 'participants' | 'chat' | 'notes' | 'transcript' | 'assignments' | 'resources' | 'polls' | 'rooms' | 'recording';

export interface RailItem {
  key: RailKey;
  label: string;
  icon: IconName;
  count?: number;
}

/** The dark left rail of the classroom: Class, Participants, Chat, Notes and the rest. */
export function ClassRail({ items, active, onSelect }: { items: readonly RailItem[]; active: RailKey; onSelect: (key: RailKey) => void }) {
  return (
    <View style={styles.rail} accessibilityRole="menu">
      {items.map((i) => {
        const on = i.key === active;
        return (
          <Pressable key={i.key} style={[styles.item, on && styles.itemOn]} onPress={() => onSelect(i.key)} accessibilityRole="menuitem" accessibilityState={{ selected: on }}>
            <Icon name={i.icon} size={20} color={Brand.surface} />
            <Text style={styles.label}>{i.label}</Text>
            {i.count ? <Text style={[styles.count, i.key === 'participants' ? styles.countBlue : styles.countRed]}>{String(i.count)}</Text> : null}
          </Pressable>
        );
      })}
      <View style={styles.spacer} />
      <Pressable style={styles.item} accessibilityRole="menuitem">
        <Icon name="help" size={20} color={Brand.surface} />
        <Text style={styles.label}>Help</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 196, gap: 4, paddingVertical: 12, paddingHorizontal: 8, backgroundColor: RAIL },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: 8 },
  itemOn: { backgroundColor: RAIL_ON },
  label: { flex: 1, fontSize: 14, fontWeight: '500', color: Brand.surface },
  count: { flexShrink: 0, minWidth: 24, textAlign: 'center', fontSize: 11, fontWeight: '700', color: Brand.surface, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  countRed: { backgroundColor: Brand.live },
  countBlue: { backgroundColor: Brand.blue },
  spacer: { flex: 1 },
});
