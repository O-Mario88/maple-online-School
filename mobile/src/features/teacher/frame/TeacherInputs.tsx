import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';

import { BLUE, BODY, INK, LINE, RED } from './TeacherParts';

/** A small label above a bordered text box, as the builder's settings draw them. */
export function TField({ label, value, onChange, trailing }: { label: string; value: string; onChange: (text: string) => void; trailing?: IconName }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <TextInput style={styles.input} value={value} onChangeText={onChange} accessibilityLabel={label} />
        {trailing ? <Icon name={trailing} size={14} color={BODY} /> : null}
      </View>
    </View>
  );
}

/** A label and a box that opens its options in place. */
export function TSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.field, open && styles.raised]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.box} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={`${label}: ${value}. Change`} accessibilityState={{ expanded: open }}>
        <Text style={styles.input} numberOfLines={1}>
          {value}
        </Text>
        <Icon name="chevronDown" size={14} color={INK} />
      </Pressable>
      {open ? (
        <View style={styles.options}>
          {options.map((o) => (
            <Pressable
              key={o}
              style={[styles.option, o === value && styles.optionOn]}
              onPress={() => {
                onChange(o);
                setOpen(false);
              }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: o === value }}>
              <Text style={[styles.optionText, o === value && styles.optionTextOn]}>{o}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** An icon, a label and a switch on one row. */
export function TToggle({ label, icon, value, onChange }: { label: string; icon: IconName; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <Icon name={icon} size={14} color={BODY} />
      <Text style={styles.toggleText} numberOfLines={1}>
        {label}
      </Text>
      <Pressable style={[styles.track, value && styles.trackOn]} onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} hitSlop={8}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </Pressable>
    </View>
  );
}

export interface MenuItem {
  label: string;
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Degrees to turn the icon, e.g. -90 to point an arrow up. */
  turn?: number;
}

/** A "⋮" (or any) button that opens a short list of actions below it. */
export function PopMenu({ items, label, icon = 'more', children, width = 190 }: { items: readonly MenuItem[]; label: string; icon?: IconName; children?: React.ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={open ? styles.raised : null}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} hitSlop={8}>
        {children ?? <Icon name={icon} size={15} color={BODY} />}
      </Pressable>
      {open ? (
        <View style={[styles.menu, { width }]}>
          {items.map((m) => (
            <Pressable
              key={m.label}
              style={[styles.menuRow, m.disabled && styles.disabled]}
              disabled={m.disabled}
              onPress={() => {
                setOpen(false);
                m.onPress();
              }}
              accessibilityRole="menuitem">
              <View style={m.turn ? { transform: [{ rotate: `${m.turn}deg` }] } : null}>
                <Icon name={m.icon} size={14} color={m.danger ? RED : INK} />
              </View>
              <Text style={[styles.menuText, m.danger && styles.danger]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  raised: { zIndex: 20 },
  label: { fontSize: 11, fontWeight: '600', color: INK },
  box: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 6, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  input: { flex: 1, minWidth: 0, fontSize: 11, color: INK },
  options: { position: 'absolute', top: 48, left: 0, right: 0, paddingVertical: 4, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, shadowColor: '#0B1424', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  option: { paddingHorizontal: 10, paddingVertical: 7 },
  optionOn: { backgroundColor: '#EEF4FF' },
  optionText: { fontSize: 11.5, color: INK },
  optionTextOn: { color: BLUE, fontWeight: '600' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 23 },
  toggleText: { flex: 1, fontSize: 9.5, color: INK, letterSpacing: -0.1 },
  track: { width: 28, height: 16, justifyContent: 'center', paddingHorizontal: 2, borderRadius: 8, backgroundColor: '#D5DCE7' },
  trackOn: { backgroundColor: BLUE },
  knob: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF' },
  knobOn: { alignSelf: 'flex-end' },
  menu: { position: 'absolute', top: 22, right: 0, paddingVertical: 4, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, shadowColor: '#0B1424', shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, paddingVertical: 8 },
  menuText: { fontSize: 12.5, color: INK },
  danger: { color: RED },
  disabled: { opacity: 0.4 },
});
