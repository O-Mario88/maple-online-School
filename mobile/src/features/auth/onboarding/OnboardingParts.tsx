import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { IconName } from '@/lib/icons';

import type { Onboarding, Wizard } from './useOnboarding';

const STEP_LABELS = ['Your Role', 'Country & Curriculum', 'Grade & Subjects'] as const;

function Tick({ size = 22 }: { size?: number }) {
  return (
    <View style={[styles.tick, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name="check" size={size * 0.62} color={Brand.surface} />
    </View>
  );
}

/** 1 Your Role — 2 Country & Curriculum — 3 Grade & Subjects (step 1 current). */
export function Steps({ phone = false }: { phone?: boolean }) {
  return (
    <View style={[styles.steps, phone && styles.stepsP]}>
      {STEP_LABELS.map((l, i) => (
        <View key={l} style={[styles.step, phone && styles.stepP]}>
          <View style={phone ? styles.stepTopP : styles.stepTop}>
            <View style={[styles.num, phone && styles.numP, i === 0 && styles.numOn]}>
              <Text style={[styles.numText, phone && styles.numTextP]}>{String(i + 1)}</Text>
            </View>
            {phone ? null : <Text style={[styles.stepText, i === 0 && styles.stepTextOn]}>{l}</Text>}
            {i < STEP_LABELS.length - 1 ? <View style={[styles.stepLine, phone && styles.stepLineP]} /> : null}
          </View>
          {phone ? <Text style={[styles.stepTextP, i === 0 && styles.stepTextOn]}>{l}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** The four "I am a…" cards: photos on desktop, icon tiles on phones. */
export function RoleCards({ w, o, phone = false }: { w: Wizard; o: Onboarding; phone?: boolean }) {
  return (
    <View style={[styles.roles, phone && styles.rolesP]}>
      {w.roles.map((r) => {
        const on = r.key === o.role;
        return (
          <Pressable key={r.key} style={[styles.role, phone && styles.roleP, on && styles.roleOn]} onPress={() => o.setRole(r.key)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={r.title}>
            {phone ? null : <Image source={r.photo} style={styles.rolePhoto} contentFit="cover" />}
            <View style={[styles.roleIcon, phone && styles.roleIconP]}>
              <Icon name={r.icon} size={phone ? 26 : 24} color={r.tint} />
            </View>
            <Text style={[styles.roleTitle, phone && styles.roleTitleP]}>{r.title}</Text>
            {phone ? null : <Text style={styles.roleBody}>{r.body}</Text>}
            {on ? (
              <View style={[styles.roleTick, phone && styles.roleTickP]}>
                <Tick size={phone ? 20 : 22} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** A select that steps to the next choice on each tap. */
export function Select({ label, onPress, lead, children, phone = false, chevron = 'chevronDown' }: { label: string; onPress: () => void; lead?: ReactNode; children: ReactNode; phone?: boolean; chevron?: IconName }) {
  return (
    <Pressable style={[styles.select, phone && styles.selectP]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}. Tap to change.`}>
      {lead}
      <View style={styles.flex}>{children}</View>
      <Icon name={chevron} size={16} color={Brand.ink} />
    </Pressable>
  );
}

export function CountryFlag({ country, size = 26 }: { country: Onboarding['country']; size?: number }) {
  if ('flag' in country && country.flag) return <Image source={country.flag} style={{ width: size, height: size * 0.62 }} />;
  return <Text style={{ fontSize: size * 0.7 }}>{'flagEmoji' in country ? country.flagEmoji : ''}</Text>;
}

export function SubjectChips({ w, o, phone = false, limit }: { w: Wizard; o: Onboarding; phone?: boolean; limit?: number }) {
  return (
    <View style={[styles.chips, phone && styles.chipsP]}>
      {w.subjects.slice(0, limit).map((s) => {
        const on = o.subjects.includes(s.name);
        return (
          <Pressable key={s.name} style={[styles.chip, phone && styles.chipP, on && styles.chipOn]} onPress={() => o.toggleSubject(s.name)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
            <Icon name={s.icon} size={phone ? 17 : 16} color={on ? Brand.blue : Brand.ink} />
            <Text style={[styles.chipText, phone && styles.chipTextP, on && styles.chipTextOn]} numberOfLines={1}>
              {s.name}
            </Text>
            {on ? <Tick size={phone ? 18 : 16} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Desktop: "Your Setup Summary" with the five choices and the reassurance tip. */
export function Summary({ o }: { o: Onboarding }) {
  const rows: { icon: IconName; label: string; value: string; lead?: ReactNode }[] = [
    { icon: 'people', label: 'Role', value: o.roleTitle },
    { icon: 'flag', label: 'Country', value: o.country.name, lead: <CountryFlag country={o.country} size={24} /> },
    { icon: 'school', label: 'Curriculum', value: o.curriculum.code, lead: <Image source={o.curriculum.crest} style={styles.crest} /> },
    { icon: 'calendar', label: 'Grade', value: o.grade },
    { icon: 'notes', label: 'Subjects', value: o.subjects.length === 0 ? 'None yet' : o.subjects.length === 1 ? o.subjects[0] : `${o.subjects[0]} +${o.subjects.length - 1}` },
  ];
  return (
    <View style={styles.summary}>
      <Text style={styles.sumTitle}>Your Setup Summary</Text>
      <Text style={styles.sumSub}>Here’s what you’ve selected.</Text>
      <View style={styles.sumRows}>
        {rows.map((r) => (
          <View key={r.label} style={styles.sumRow}>
            <View style={styles.sumIcon}>{r.lead ?? <Icon name={r.icon} size={18} color={Brand.blue} />}</View>
            <Text style={styles.sumLabel}>{r.label}</Text>
            <Text style={styles.sumValue}>{r.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.tip}>
        <Icon name="sparkle" size={26} color={Brand.blue} />
        <Text style={styles.tipText}>You can always change these settings later in your profile.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tick: { backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', alignItems: 'center' },
  stepsP: { justifyContent: 'space-between' },
  step: { flexDirection: 'row', alignItems: 'center' },
  stepP: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 6 },
  stepTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepTopP: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  num: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#A9B4C6', alignItems: 'center', justifyContent: 'center' },
  numP: { width: 26, height: 26, borderRadius: 13 },
  numOn: { backgroundColor: Brand.blue },
  numText: { fontSize: 16, fontWeight: '600', color: Brand.surface },
  numTextP: { fontSize: 12 },
  stepText: { fontSize: 15.5, color: '#6B7385' },
  stepTextP: { fontSize: 10.5, color: '#6B7385', textAlign: 'center' },
  stepTextOn: { color: Brand.blue, fontWeight: '600' },
  stepLine: { width: 120, height: 1, marginHorizontal: 16, backgroundColor: '#B8C3D4' },
  stepLineP: { position: 'absolute', right: -24, width: 48, marginHorizontal: 0 },
  roles: { flexDirection: 'row', gap: 15 },
  rolesP: { flexWrap: 'wrap', gap: 8 },
  role: { flex: 1, height: 256, overflow: 'hidden', borderRadius: 9, borderWidth: 1, borderColor: '#E3E8F0', backgroundColor: Brand.surface },
  roleP: { flexGrow: 0, flexShrink: 0, flexBasis: '48.5%', height: 72, alignItems: 'center', justifyContent: 'center', gap: 4 },
  roleOn: { borderWidth: 2, borderColor: Brand.blue },
  rolePhoto: { width: '100%', height: 145 },
  roleIcon: { width: 52, height: 52, borderRadius: 26, marginTop: -26, marginLeft: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.surface },
  roleIconP: { width: 30, height: 30, marginTop: 0, marginLeft: 0, backgroundColor: 'transparent' },
  roleTitle: { marginTop: 8, marginLeft: 20, fontSize: 15, fontWeight: '700', color: Brand.ink },
  roleTitleP: { marginTop: 0, marginLeft: 0, fontSize: 12.5, fontWeight: '500' },
  roleBody: { marginTop: 4, marginHorizontal: 20, fontSize: 13, lineHeight: 17, color: '#4A5263' },
  roleTick: { position: 'absolute', top: 9, right: 12 },
  roleTickP: { top: 6, right: 6 },
  select: { height: 37, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, borderRadius: 7, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface },
  selectP: { height: 36 },
  crest: { width: 24, height: 24, borderRadius: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chipsP: { gap: 8 },
  chip: { width: 133, height: 37, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface },
  chipP: { width: '48.5%', height: 38 },
  chipOn: { borderColor: Brand.blue, backgroundColor: '#EEF4FF' },
  chipText: { flex: 1, fontSize: 11.5, color: Brand.ink, letterSpacing: -0.2 },
  chipTextP: { fontSize: 11 },
  chipTextOn: { color: Brand.blue },
  summary: { padding: 15, paddingTop: 20, borderRadius: 10, backgroundColor: Brand.surface },
  sumTitle: { fontSize: 16.5, fontWeight: '700', color: Brand.ink },
  sumSub: { marginTop: 8, fontSize: 13, color: '#4A5263' },
  sumRows: { marginTop: 10 },
  sumRow: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  sumIcon: { width: 30, alignItems: 'center' },
  sumLabel: { width: 100, fontSize: 13, color: '#2A3242' },
  sumValue: { flex: 1, fontSize: 13, fontWeight: '600', color: Brand.ink },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14, paddingHorizontal: 14, paddingVertical: 16, borderRadius: 9, backgroundColor: '#EBF2FB' },
  tipText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: '#3D4656' },
});
