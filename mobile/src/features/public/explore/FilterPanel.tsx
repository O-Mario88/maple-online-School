import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { CatalogueFilters, PriceBand } from '@/lib/catalogue';

import { Brand } from '../palette';

type ListKey = 'kinds' | 'boards' | 'levels' | 'subjects' | 'countries';

export interface FilterGroup {
  key: ListKey;
  title: string;
  options: readonly { value: string; label: string; count: number }[];
}

const PRICES: readonly { value: PriceBand; label: string }[] = [
  { value: 'any', label: 'Any price' },
  { value: 'free', label: 'Free' },
  { value: 'under50k', label: 'Under UGX 50,000' },
  { value: 'under100k', label: 'Under UGX 100,000' },
];

const SHOWN = 5;

function Check({ on }: { on: boolean }) {
  return <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={12} color={Brand.surface} /> : null}</View>;
}

function Group({ group, selected, onToggle }: { group: FilterGroup; selected: readonly string[]; onToggle: (value: string) => void }) {
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
                <Text style={styles.optionText}>{`${o.label} (${o.count})`}</Text>
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

/** Search box, ticked filter groups and the price band. */
/** Each change is applied to the latest filters, so quick taps never overwrite each other. */
type Update = (change: (prev: CatalogueFilters) => CatalogueFilters) => void;

export function FilterPanel({ filters, groups, onChange }: { filters: CatalogueFilters; groups: readonly FilterGroup[]; onChange: Update }) {
  const toggle = (key: ListKey, value: string) =>
    onChange((f) => {
      const list = f[key];
      return { ...f, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  return (
    <View style={styles.panel}>
      <Text style={styles.groupTitle}>Search</Text>
      <View style={styles.search}>
        <TextInput
          style={styles.input}
          value={filters.query}
          onChangeText={(query) => onChange((f) => ({ ...f, query }))}
          placeholder="Search for courses, topics..."
          placeholderTextColor={Brand.muted}
          accessibilityLabel="Search the catalogue"
        />
        <Icon name="search" size={18} color={Brand.body} />
      </View>
      {groups.map((g) => (
        <Group key={g.key} group={g} selected={filters[g.key]} onToggle={(v) => toggle(g.key, v)} />
      ))}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Price</Text>
        {PRICES.map((p) => {
          const on = filters.price === p.value;
          return (
            <Pressable key={p.value} style={styles.option} onPress={() => onChange((f) => ({ ...f, price: p.value }))} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <View style={[styles.radio, on && styles.radioOn]} />
              <Text style={styles.optionText}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 16 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  input: { flex: 1, fontSize: 13, color: Brand.ink, minHeight: 40 },
  group: { gap: 8 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupTitle: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  optionText: { fontSize: 13, color: Brand.body },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: Brand.line, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.surface },
  boxOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: Brand.muted },
  radioOn: { borderWidth: 5, borderColor: Brand.blue },
  more: { fontSize: 13, fontWeight: '600', color: Brand.blue },
});
