import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { Maple } from '@/constants/maple';

/** The teacher references' palette (light-only, like the other reference pages). */
export const INK = Maple.navy;
export const BODY = Maple.body;
export const MUTED = Maple.secondary;
export const BLUE = Maple.blue;
export const LINE = Maple.blueSelected;
export const CANVAS = Maple.blueSelected;
export const GREEN = Maple.successText;
export const RED = Maple.error;

export type Tone = 'red' | 'amber' | 'green' | 'blue' | 'purple' | 'grey';

const TONES: Readonly<Record<Tone, { bg: string; fg: string }>> = {
  red: { bg: Maple.errorSoft, fg: Maple.error },
  amber: { bg: Maple.warningSoft, fg: Maple.warningText },
  green: { bg: Maple.successSoft, fg: Maple.successText },
  blue: { bg: Maple.blueSelected, fg: BLUE },
  purple: { bg: Maple.blueSelected, fg: Maple.blue },
  grey: { bg: Maple.blueSelected, fg: BODY },
};

/** A white card with the references' thin border. */
export function Panel({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

/** A card title with an optional blue link on the right. */
export function PanelHead({ title, link, onLink, size = 17 }: { title: string; link?: string; onLink?: () => void; size?: number }) {
  return (
    <View style={styles.head}>
      <Text style={[styles.headTitle, { fontSize: size }]} accessibilityRole="header">
        {title}
      </Text>
      {link && onLink ? (
        <Pressable onPress={onLink} accessibilityRole="link" accessibilityLabel={`${link}: ${title}`} hitSlop={8}>
          <Text style={styles.link}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A small rounded label, such as "3 overdue". */
export function Pill({ label, tone, icon, style, small = false }: { label: string; tone: Tone; icon?: IconName; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, small && styles.pillSmall, { backgroundColor: t.bg }, style]}>
      {icon ? <Icon name={icon} size={11} color={t.fg} /> : null}
      <Text style={[styles.pillText, small && styles.pillTextSmall, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function toneColor(tone: Tone): string {
  return TONES[tone].fg;
}

/** A coloured rounded square holding an icon, like the references' stat and queue icons. */
export function IconTile({ icon, color, size = 44, soft = false }: { icon: IconName; color: string; size?: number; soft?: boolean }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.26, backgroundColor: soft ? `${color}1F` : color }]}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={soft ? color : Maple.surface} />
    </View>
  );
}

/** The blue numbered circle that starts each studio step. */
export function StepBadge({ n, size = 30 }: { n: number; size?: number }) {
  return (
    <View style={[styles.step, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.stepText, { fontSize: size * 0.47 }]}>{n}</Text>
    </View>
  );
}

interface TButtonProps {
  label: string;
  icon?: IconName;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
  iconRight?: boolean;
  /** The smaller size the studio's step 3 header uses. */
  small?: boolean;
}

/** A filled or outlined button in the references' blue. */
export function TButton({ label, icon, onPress, variant = 'solid', style, iconRight = false, small = false }: TButtonProps) {
  const solid = variant === 'solid';
  const fg = solid ? Maple.surface : BLUE;
  return (
    <Pressable style={({ pressed }) => [styles.btn, small && styles.btnSmall, solid ? styles.btnSolid : styles.btnOutline, pressed && styles.pressed, style]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {icon && !iconRight ? <Icon name={icon} size={16} color={fg} /> : null}
      <Text style={[styles.btnText, small && styles.btnTextSmall, { color: fg }]}>{label}</Text>
      {icon && iconRight ? <Icon name={icon} size={16} color={fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 16, borderRadius: 12, backgroundColor: Maple.surface, borderWidth: 1, borderColor: LINE },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headTitle: { fontWeight: '700', color: INK },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pillText: { fontSize: 11.5, fontWeight: '600' },
  pillSmall: { alignSelf: 'center', paddingHorizontal: 6, paddingVertical: 2 },
  pillTextSmall: { fontSize: 9.5 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  step: { alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  stepText: { fontWeight: '700', color: Maple.surface },
  btn: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 8 },
  btnSolid: { backgroundColor: BLUE },
  btnOutline: { backgroundColor: Maple.surface, borderWidth: 1.5, borderColor: BLUE },
  btnText: { fontSize: 13.5, fontWeight: '600' },
  btnSmall: { height: 33, gap: 6, paddingHorizontal: 10 },
  btnTextSmall: { fontSize: 11 },
  pressed: { opacity: 0.85 },
});
