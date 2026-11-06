import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';

import { levelFor } from './plan';
import { Maple, Radii } from '@/constants/maple';

/** My Plan's tab references use a purple accent. */
export const BRAND_BLUE = Maple.blue;
export const LAV = Maple.blueSoft;
const GREEN = Maple.successText;
const ORANGE = Maple.warning;

/** Progress bars: green once a subject is going well, orange while it's developing. */
export const barColor = (progress: number) => (levelFor(progress) === 'Developing' ? ORANGE : GREEN);

export function Card({
  title,
  icon,
  sub,
  right,
  children,
  style,
}: {
  title?: string;
  icon?: IconName;
  sub?: string;
  right?: ReactNode;
  children?: ReactNode;
  style?: object;
}) {
  return (
    <View style={[k.card, style]}>
      {title ? (
        <View style={k.head}>
          {icon ? <Icon name={icon} size={24} color={BRAND_BLUE} /> : null}
          <View style={k.flex}>
            <Text style={k.title}>{title}</Text>
            {sub ? <Text style={k.small}>{sub}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Bar({ value, color = BRAND_BLUE, height = 7 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={[k.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          k.fill,
          { width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height, borderRadius: height / 2, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export function SubjectIcon({ icon, tint, size = 40 }: { icon: IconName; tint: string; size?: number }) {
  return (
    <View style={[k.subjectIcon, { width: size, height: size, borderRadius: size / 4, backgroundColor: tint }]}>
      <Icon name={icon} size={size * 0.55} color={L.white} />
    </View>
  );
}

type Tone = 'green' | 'purple' | 'grey' | 'orange';
const TONES: Readonly<Record<Tone, { fg: string; bg: string }>> = {
  green: { fg: Maple.successText, bg: Maple.successSoft },
  purple: { fg: BRAND_BLUE, bg: LAV },
  grey: { fg: Maple.body, bg: Maple.blueSoft },
  orange: { fg: Maple.warningText, bg: Maple.warningSoft },
};
export function Pill({ text, tone }: { text: string; tone: Tone }) {
  return <Text style={[k.pill, { color: TONES[tone].fg, backgroundColor: TONES[tone].bg }]}>{text}</Text>;
}

export function OutlineBtn({
  label,
  icon,
  onPress,
  solid = false,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  solid?: boolean;
}) {
  return (
    <Pressable style={[k.btn, solid ? k.btnSolid : k.btnOutline]} onPress={onPress} accessibilityRole="button">
      {icon ? <Icon name={icon} size={14} color={solid ? L.white : BRAND_BLUE} /> : null}
      <Text style={[k.btnText, solid && k.btnTextSolid]}>{label}</Text>
    </Pressable>
  );
}

/** A labelled text field for the plan's small add-sheets. */
export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={k.field}>
      <Text style={k.fieldLabel}>{label}</Text>
      <TextInput
        style={k.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={L.body}
        accessibilityLabel={label}
      />
    </View>
  );
}

export const k = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 12, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 19, fontWeight: '800', color: L.navy, letterSpacing: -0.2 },
  small: { fontSize: 12.5, lineHeight: 17, color: L.body },
  body: { fontSize: 14, lineHeight: 19, color: L.ink },
  track: { flex: 1, overflow: 'hidden', backgroundColor: Maple.blueSelected },
  fill: {},
  subjectIcon: { alignItems: 'center', justifyContent: 'center' },
  pill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  btn: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: Radii.control,
  },
  btnSolid: { backgroundColor: BRAND_BLUE },
  btnOutline: { borderWidth: 1.5, borderColor: Maple.blueLine, backgroundColor: L.white },
  btnText: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  btnTextSolid: { color: L.white },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: L.navy },
  input: { height: 44, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: L.line, fontSize: 14, color: L.ink },
});
