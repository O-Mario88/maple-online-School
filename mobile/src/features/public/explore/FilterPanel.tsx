import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand } from '../palette';

const SHOWN = 5;

function Check({ on }: { on: boolean }) {
  return <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={12} color={Brand.surface} /> : null}</View>;
}

interface CheckGroupProps {
  group: { title: string; options: readonly { value: string; label: string; count?: number }[] };
  selected: readonly string[];
  onToggle: (value: string) => void;
}

/** A collapsible list of tick boxes, used by the Shorts filters. */
export function CheckGroup({ group, selected, onToggle }: CheckGroupProps) {
  const [open, setOpen] = useState(true);
  const [all, setAll] = useState(false);
  const options = all ? group.options : group.options.slice(0, SHOWN);
  return (
    <View style={styles.group}>
      <Pressable style={styles.groupHead} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={styles.groupTitle}>{group.title}</Text>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} color={Brand.body} />
      </Pressable>
      {open
        ? options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <Pressable key={o.value} style={styles.option} onPress={() => onToggle(o.value)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                <Check on={on} />
                <Text style={styles.optionText}>{o.count === undefined ? o.label : `${o.label} (${o.count})`}</Text>
              </Pressable>
            );
          })
        : null}
      {open && group.options.length > SHOWN ? (
        <Pressable onPress={() => setAll((a) => !a)} accessibilityRole="button">
          <Text style={styles.more}>{all ? 'See less' : 'See more'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupTitle: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  optionText: { fontSize: 13, color: Brand.body },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: Brand.line, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.surface },
  boxOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  more: { fontSize: 13, fontWeight: '600', color: Brand.blue },
});
