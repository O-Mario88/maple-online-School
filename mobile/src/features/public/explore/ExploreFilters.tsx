import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { CatalogueFilters, PriceBand } from '@/lib/catalogue';

import { Brand } from '../palette';

type ListKey = 'kinds' | 'boards' | 'levels' | 'subjects';

export interface ExploreGroup {
  key: ListKey;
  title: string;
  options: readonly { value: string; label: string; count?: number }[];
  /** How many options show before "See more". */
  shown: number;
  /** The reference draws a minus on some open groups and a chevron on others. */
  toggle: 'minus' | 'chevron';
}

const PRICES: readonly { value: PriceBand; label: string }[] = [
  { value: 'any', label: 'Any price' },
  { value: 'free', label: 'Free' },
  { value: 'under50k', label: 'Under UGX 50,000' },
  { value: 'under100k', label: 'Under UGX 100,000' },
];

/** Each change is applied to the latest filters, so quick taps never overwrite each other. */
type Update = (change: (prev: CatalogueFilters) => CatalogueFilters) => void;

function Box({ on }: { on: boolean }) {
  return <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={13} color={Brand.surface} /> : null}</View>;
}

function Group({ group, selected, onToggle }: { group: ExploreGroup; selected: readonly string[]; onToggle: (v: string) => void }) {
  const [open, setOpen] = useState(true);
  const [all, setAll] = useState(false);
  const options = all ? group.options : group.options.slice(0, group.shown);
  return (
    <View style={styles.group}>
      <Pressable style={styles.groupHead} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={group.title}>
        <Text style={styles.groupTitle}>{group.title}</Text>
        <Icon name={group.toggle === 'minus' && open ? 'minus' : open ? 'chevronDown' : 'chevronRight'} size={15} color={Brand.body} />
      </Pressable>
      {open ? (
        <View style={styles.options}>
          {options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <Pressable key={o.value} style={styles.option} onPress={() => onToggle(o.value)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                <Box on={on} />
                <Text style={styles.optionText}>
                  {o.label}
                  {o.count === undefined ? null : <Text style={styles.count}>{` (${o.count.toLocaleString('en-US')})`}</Text>}
                </Text>
              </Pressable>
            );
          })}
          {group.options.length > group.shown ? (
            <Pressable style={styles.option} onPress={() => setAll((a) => !a)} accessibilityRole="button">
              <Text style={styles.more}>{all ? 'See less' : 'See more'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** The catalogue search box with its search button. */
export function SearchBox({ filters, onChange, style }: { filters: CatalogueFilters; onChange: Update; style?: object }) {
  return (
    <View style={[styles.search, style]}>
      <TextInput
        style={styles.input}
        value={filters.query}
        onChangeText={(query) => onChange((f) => ({ ...f, query }))}
        placeholder="Search for courses, topics..."
        placeholderTextColor="#8A92A3"
        accessibilityLabel="Search the catalogue"
      />
      <View style={styles.searchBtn}>
        <Icon name="search" size={18} color={Brand.ink} />
      </View>
    </View>
  );
}

/** The Explore sidebar: search, the reference's filter groups, then price. Sizes are the reference's pixels. */
export function ExploreFilters({ filters, groups, onChange, hideSearch = false }: { filters: CatalogueFilters; groups: readonly ExploreGroup[]; onChange: Update; hideSearch?: boolean }) {
  const toggle = (key: ListKey, value: string) =>
    onChange((f) => {
      const list = f[key];
      return { ...f, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  return (
    <View>
      {hideSearch ? null : (
        <>
          <Text style={styles.groupTitle}>Search</Text>
          <SearchBox filters={filters} onChange={onChange} />
        </>
      )}
      {groups.map((g) => (
        <Group key={g.key} group={g} selected={filters[g.key]} onToggle={(v) => toggle(g.key, v)} />
      ))}
      <View style={styles.group}>
        <View style={styles.groupHead}>
          <Text style={styles.groupTitle}>Price</Text>
        </View>
        <View style={styles.options}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', height: 45, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface },
  input: { flex: 1, height: 43, paddingHorizontal: 15, fontSize: 13.5, color: Brand.ink },
  searchBtn: { width: 45, height: 43, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#DFE4EC' },
  group: { marginTop: 22 },
  groupHead: { height: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 2 },
  groupTitle: { fontSize: 15.5, lineHeight: 20, fontWeight: '700', color: Brand.ink },
  options: { marginTop: 5 },
  option: { height: 30, flexDirection: 'row', alignItems: 'center', gap: 15 },
  optionText: { fontSize: 15, color: '#3D4656' },
  count: { color: '#6B7385' },
  box: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#D5DAE3', backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  radio: { width: 18, height: 18, marginHorizontal: 1, borderRadius: 9, borderWidth: 1, borderColor: '#B8C0CC' },
  radioOn: { borderWidth: 5, borderColor: Brand.blue },
  more: { fontSize: 14.5, fontWeight: '500', color: Brand.blue },
});
