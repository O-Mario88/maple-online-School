import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';

import { STEPS, type StepKey } from './applicationForm';
import { BRAND_SOFT, BRAND_BLUE } from './SchoolParts';
import { Maple } from '@/constants/maple';

const RED = Maple.error;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "14 Mar 2011" from YYYY-MM-DD. */
export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : '';
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={s.label}>
      {text}
      {required ? <Text style={s.star}> *</Text> : null}
    </Text>
  );
}

function ErrorText({ text }: { text?: string }) {
  return text ? (
    <Text style={s.error} accessibilityLiveRegion="polite">
      {text}
    </Text>
  ) : null;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  icon?: IconName;
  flex?: number;
  keyboardType?: TextInputProps['keyboardType'];
  placeholder?: string;
}

export function Field({ label, value, onChange, required, error, icon, flex = 1, keyboardType, placeholder }: FieldProps) {
  return (
    <View style={[s.field, { flex }]}>
      <Label text={label} required={required} />
      <View style={[s.box, !!error && s.boxError]}>
        {icon ? <Icon name={icon} size={17} color={L.ink} /> : null}
        <TextInput style={s.input} value={value} onChangeText={onChange} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={L.muted} accessibilityLabel={label} />
      </View>
      <ErrorText text={error} />
    </View>
  );
}

function Options({ title, options, value, onPick, onClose }: { title: string; options: readonly string[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose} accessibilityLabel="Close">
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>{title}</Text>
          <ScrollView style={s.options}>
            {options.map((o) => (
              <Pressable key={o} style={[s.option, o === value && s.optionOn]} onPress={() => onPick(o)} accessibilityRole="radio" accessibilityState={{ selected: o === value }}>
                <Text style={[s.optionText, o === value && s.optionTextOn]}>{o}</Text>
                {o === value ? <Icon name="tick" size={17} color={L.blue} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  flex?: number;
  /** Draw without the label above it (e.g. "Applying for"). */
  bare?: boolean;
}

export function Select({ label, value, options, onChange, required, error, flex = 1, bare = false }: SelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[s.field, { flex }]}>
      {bare ? null : <Label text={label} required={required} />}
      <Pressable style={[s.box, bare && s.boxBare, !!error && s.boxError]} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${label}: ${value || 'not chosen'}`}>
        <Text style={[s.value, !value && s.placeholder]} numberOfLines={1}>
          {value || 'Choose…'}
        </Text>
        <Icon name="chevronDown" size={16} color={L.ink} />
      </Pressable>
      <ErrorText text={error} />
      {open ? (
        <Options
          title={label}
          options={options}
          value={value}
          onPick={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </View>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A date of birth: shown as "14 Mar 2011", picked by day, month and year. */
export function DateField({ label, value, onChange, years, required, error, flex = 1 }: { label: string; value: string; onChange: (v: string) => void; years: readonly number[]; required?: boolean; error?: string; flex?: number }) {
  const [open, setOpen] = useState(false);
  const [y, m, d] = value.split('-').map(Number);
  const set = (ny: number, nm: number, nd: number) => onChange(`${ny}-${pad(nm)}-${pad(nd)}`);
  const col = (title: string, items: readonly { v: number; t: string }[], on: number, pick: (v: number) => void) => (
    <View style={s.dateCol}>
      <Text style={s.dateHead}>{title}</Text>
      <ScrollView style={s.dateList}>
        {items.map((i) => (
          <Pressable key={i.v} style={[s.dateItem, i.v === on && s.optionOn]} onPress={() => pick(i.v)} accessibilityRole="radio" accessibilityState={{ selected: i.v === on }}>
            <Text style={[s.optionText, i.v === on && s.optionTextOn]}>{i.t}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
  return (
    <View style={[s.field, { flex }]}>
      <Label text={label} required={required} />
      <Pressable style={[s.box, !!error && s.boxError]} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${label}: ${dayLabel(value) || 'not set'}`}>
        <Icon name="calendar" size={17} color={L.ink} />
        <Text style={[s.value, !value && s.placeholder]}>{dayLabel(value) || 'Choose the date'}</Text>
      </Pressable>
      <ErrorText text={error} />
      {open ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={s.scrim}>
            <View style={s.sheet}>
              <Text style={s.sheetTitle}>{label}</Text>
              <View style={s.dateCols}>
                {col('Day', Array.from({ length: 31 }, (_, i) => ({ v: i + 1, t: String(i + 1) })), d, (v) => set(y || years[0], m || 1, v))}
                {col('Month', MONTHS.map((t, i) => ({ v: i + 1, t })), m, (v) => set(y || years[0], v, d || 1))}
                {col('Year', years.map((v) => ({ v, t: String(v) })), y, (v) => set(v, m || 1, d || 1))}
              </View>
              <Pressable style={s.done} onPress={() => setOpen(false)} accessibilityRole="button">
                <Text style={s.doneText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

/** A Ugandan phone number: the +256 code, then the nine digits. */
export function PhoneField({ label, value, onChange, required, error, flex = 1 }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; error?: string; flex?: number }) {
  return (
    <View style={[s.field, { flex }]}>
      <Label text={label} required={required} />
      <View style={[s.box, s.phoneBox, !!error && s.boxError]}>
        <View style={s.code}>
          <Text style={s.flag}>🇺🇬</Text>
          <Text style={s.codeText}>+256</Text>
        </View>
        <TextInput style={s.input} value={value} onChangeText={onChange} keyboardType="phone-pad" placeholder="772 345 678" placeholderTextColor={L.muted} accessibilityLabel={`${label}, after +256`} />
      </View>
      <ErrorText text={error} />
    </View>
  );
}

export function Row({ children, phone = false }: { children: ReactNode; phone?: boolean }) {
  return <View style={phone ? s.rowP : s.row}>{children}</View>;
}

export function SectionHead({ icon, title, sub, note, right }: { icon: IconName; title: string; sub: string; note?: string; right?: ReactNode }) {
  return (
    <View style={s.head}>
      <View style={s.headIcon}>
        <Icon name={icon} size={22} color={BRAND_BLUE} />
      </View>
      <View style={s.flex}>
        <Text style={s.headTitle}>
          {title}
          {note ? <Text style={s.headNote}>{` ${note}`}</Text> : null}
        </Text>
        <Text style={s.headSub}>{sub}</Text>
      </View>
      {right}
    </View>
  );
}

export function Check({ checked, onPress, label, error }: { checked: boolean; onPress: () => void; label: string; error?: string }) {
  return (
    <View style={s.field}>
      <Pressable style={s.check} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label}>
        <View style={[s.checkBox, checked && s.checkOn, !!error && s.boxError]}>{checked ? <Icon name="tick" size={14} color={L.white} /> : null}</View>
        <Text style={s.checkText}>{label}</Text>
      </Pressable>
      <ErrorText text={error} />
    </View>
  );
}

/** The four steps: done ones ticked, the current one blue and underlined. Steps open only once the ones before are done. */
export function StepsBar({ current, done, onPick, phone = false }: { current: StepKey; done: number; onPick: (k: StepKey) => void; phone?: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.steps}>
      {STEPS.map((st, i) => {
        const on = st.key === current;
        const reachable = i <= done;
        return (
          <View key={st.key} style={s.stepWrap}>
            {i > 0 ? <View style={[s.stepLine, phone && s.stepLineP]} /> : null}
            <Pressable style={s.step} onPress={() => reachable && onPick(st.key)} disabled={!reachable} accessibilityRole="tab" accessibilityState={{ selected: on, disabled: !reachable }}>
              <View style={[s.stepDot, on && s.stepDotOn, !on && i < done && s.stepDotDone]}>
                {!on && i < done ? <Icon name="tick" size={14} color={L.white} /> : <Text style={[s.stepNum, on && s.stepNumOn]}>{i + 1}</Text>}
              </View>
              {phone && !on ? null : <Text style={[s.stepText, on && s.stepTextOn]}>{st.label}</Text>}
              {on ? <View style={s.stepUnder} /> : null}
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', gap: 22 },
  rowP: { gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: L.navy },
  star: { color: RED },
  box: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: Maple.borderStrong, backgroundColor: L.white },
  boxBare: { width: 250, height: 40, borderRadius: 20 },
  boxError: { borderColor: RED },
  phoneBox: { paddingLeft: 0 },
  input: { flex: 1, minWidth: 0, height: 38, fontSize: 14.5, color: L.ink },
  value: { flex: 1, minWidth: 0, fontSize: 14.5, color: L.ink },
  placeholder: { color: L.muted },
  error: { fontSize: 12, color: RED },
  code: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: Maple.borderStrong },
  flag: { fontSize: 15 },
  codeText: { fontSize: 14, color: L.ink },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(11,26,63,0.35)' },
  sheet: { width: '100%', maxWidth: 420, gap: 8, padding: 16, borderRadius: 16, backgroundColor: L.white },
  sheetTitle: { marginBottom: 4, fontSize: 16, fontWeight: '700', color: L.navy },
  options: { maxHeight: 360 },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderRadius: 10 },
  optionOn: { backgroundColor: L.soft },
  optionText: { fontSize: 15, color: L.ink },
  optionTextOn: { fontWeight: '600', color: L.blue },
  dateCols: { flexDirection: 'row', gap: 8 },
  dateCol: { flex: 1, gap: 4 },
  dateHead: { fontSize: 13, fontWeight: '600', color: L.body, textAlign: 'center' },
  dateList: { maxHeight: 240 },
  dateItem: { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  done: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: L.blue },
  doneText: { fontSize: 15, fontWeight: '600', color: L.white },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: BRAND_SOFT },
  headTitle: { fontSize: 20, fontWeight: '700', color: L.navy },
  headNote: { fontSize: 17, fontWeight: '500', color: L.body },
  headSub: { marginTop: 2, fontSize: 14, color: L.body },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkBox: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1.5, borderColor: Maple.borderStrong, backgroundColor: L.white },
  checkOn: { borderColor: L.blue, backgroundColor: L.blue },
  checkText: { flex: 1, fontSize: 14, lineHeight: 20, color: L.ink },
  steps: { alignItems: 'center', paddingVertical: 4 },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  stepLine: { width: 44, height: 1.5, marginHorizontal: 8, backgroundColor: Maple.borderStrong },
  stepLineP: { width: 18, marginHorizontal: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 6 },
  stepDot: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 1.5, borderColor: Maple.borderStrong, backgroundColor: L.white },
  stepDotOn: { borderColor: L.blue, backgroundColor: L.blue },
  stepDotDone: { borderColor: L.green, backgroundColor: L.green },
  stepNum: { fontSize: 15, fontWeight: '600', color: L.ink },
  stepNumOn: { color: L.white },
  stepText: { fontSize: 14.5, color: L.ink },
  stepTextOn: { fontWeight: '600', color: L.blue },
  stepUnder: { position: 'absolute', left: -12, right: -12, bottom: 0, height: 3, borderRadius: 2, backgroundColor: L.blue },
});
