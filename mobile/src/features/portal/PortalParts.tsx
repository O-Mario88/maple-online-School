import { Image } from '@/components/picture';
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, Switch, Text, type TextStyle, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';

import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, SELECT, TONES, type Tone, WHITE } from './tokens';
import { Maple } from '@/constants/maple';

/** A white card with the references' hairline border and soft corners. */
export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** A card's title, an optional line under it and an optional link or control on the right. */
export function CardHead({
  title,
  subtitle,
  link,
  onLink,
  right,
  size = 18,
  icon,
}: {
  title: string;
  subtitle?: string;
  link?: string;
  onLink?: () => void;
  right?: ReactNode;
  size?: number;
  icon?: ReactNode;
}) {
  return (
    <View style={styles.head}>
      {icon}
      <View style={styles.headText}>
        <Text style={[styles.headTitle, { fontSize: size }]} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.headSub}>{subtitle}</Text> : null}
      </View>
      {right}
      {link ? (
        <Pressable onPress={onLink} accessibilityRole="link" accessibilityLabel={`${link}: ${title}`} hitSlop={8}>
          <Text style={styles.link}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A small rounded status label ("Active", "Published", "Upcoming"). */
export function Pill({ label, tone, icon, style, size = 13 }: { label: string; tone: Tone; icon?: IconName; style?: StyleProp<ViewStyle>; size?: number }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.soft }, style]}>
      {icon ? <Icon name={icon} size={size} color={t.text} /> : null}
      <Text style={[styles.pillText, { color: t.text, fontSize: size }]}>{label}</Text>
    </View>
  );
}

/** The references' three button looks: solid blue, white with a blue outline, and pale blue. */
export function Btn({
  label,
  icon,
  kind = 'primary',
  onPress,
  style,
  textStyle,
  iconRight,
  height = 44,
  accessibilityLabel,
}: {
  label: string;
  icon?: IconName;
  kind?: 'primary' | 'outline' | 'soft';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconRight?: IconName;
  height?: number;
  accessibilityLabel?: string;
}) {
  const color = kind === 'primary' ? WHITE : BLUE;
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, { minHeight: height }, kind === 'primary' ? styles.btnPrimary : kind === 'outline' ? styles.btnOutline : styles.btnSoft, pressed && styles.pressed, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}>
      {icon ? <Icon name={icon} size={18} color={color} /> : null}
      <Text style={[styles.btnText, { color }, textStyle]} numberOfLines={1}>
        {label}
      </Text>
      {iconRight ? <Icon name={iconRight} size={18} color={color} /> : null}
    </Pressable>
  );
}

/** A rounded square holding an icon, tinted (soft) or filled (solid). */
export function IconTile({ icon, tone, size = 44, solid = false, iconSize, radius }: { icon: IconName; tone: Tone; size?: number; solid?: boolean; iconSize?: number; radius?: number }) {
  const t = TONES[tone];
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: radius ?? size * 0.26, backgroundColor: solid ? t.solid : t.soft }]}>
      <Icon name={icon} size={iconSize ?? size * 0.5} color={solid ? WHITE : t.solid} />
    </View>
  );
}

export type AvatarBadge = 'online' | 'away' | 'mic' | 'check' | 'none';

/** A round photo with an optional corner badge: a green or red dot, a voice-note mic or a blue check. */
export function Avatar({ source, size = 44, badge = 'none' }: { source: number; size?: number; badge?: AvatarBadge }) {
  const dot = Math.max(12, Math.round(size * 0.28));
  return (
    <View style={{ width: size, height: size }}>
      <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />
      {badge === 'online' || badge === 'away' ? (
        <View style={[styles.dot, { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: badge === 'online' ? GREEN : Maple.error }]} />
      ) : null}
      {badge === 'mic' || badge === 'check' ? (
        <View style={[styles.badgeRound, { width: dot + 8, height: dot + 8, borderRadius: (dot + 8) / 2 }]}>
          <Icon name={badge === 'mic' ? 'waveform' : 'check'} size={dot - 2} color={BLUE} />
        </View>
      ) : null}
    </View>
  );
}

/** The references' green switch. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: Maple.borderStrong, true: Maple.success }}
      thumbColor={WHITE}
      ios_backgroundColor={Maple.borderStrong}
      accessibilityLabel={label}
      // react-native-web colours the "on" thumb with its own prop.
      {...({ activeThumbColor: WHITE } as object)}
    />
  );
}

const WAVE = [5, 9, 7, 13, 17, 11, 19, 14, 8, 16, 21, 12, 18, 10, 15, 20, 13, 9, 17, 11, 7, 14, 18, 10, 6, 12, 9, 5];

/** A voice-note waveform; bars up to `played` (0–1) are blue, the rest pale. */
export function Wave({ played = 1, bars = 28, height = 22, color = BLUE }: { played?: number; bars?: number; height?: number; color?: string }) {
  const list = WAVE.slice(0, bars);
  return (
    <View style={[styles.wave, { height }]}>
      {list.map((h, i) => (
        <View key={i} style={[styles.waveBar, { height: (h / 21) * height, backgroundColor: i / list.length < played ? color : Maple.blueLine }]} />
      ))}
    </View>
  );
}

/** A round blue play/pause button. */
export function PlayButton({ playing, onPress, size = 40, label }: { playing: boolean; onPress: () => void; size?: number; label: string }) {
  return (
    <Pressable
      style={[styles.play, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={playing ? `Pause ${label}` : `Play ${label}`}>
      <Icon name={playing ? 'pause' : 'playFill'} size={size * 0.42} color={WHITE} />
    </Pressable>
  );
}

/** Underlined tabs ("Overview · Assignments · Grades"), optionally with icons. */
export function UnderTabs({
  items,
  active,
  onChange,
  size = 15,
  icons,
  stretch = false,
  spread = false,
  iconTop = false,
  style,
}: {
  items: readonly string[];
  active: string;
  onChange: (tab: string) => void;
  size?: number;
  icons?: readonly IconName[];
  stretch?: boolean;
  /** Natural-width tabs spread across the row (the phone references). */
  spread?: boolean;
  /** Icons above the labels (the phone Settings reference). */
  iconTop?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.tabs, spread && styles.tabsSpread, style]} accessibilityRole="tablist">
      {items.map((t, i) => {
        const on = t === active;
        return (
          <Pressable
            key={t}
            style={[styles.tab, stretch && styles.tabStretch, spread && styles.tabSpread]}
            onPress={() => onChange(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t}>
            <View style={[styles.tabInner, iconTop && styles.tabInnerTop]}>
              {icons?.[i] ? <Icon name={icons[i]} size={iconTop ? size + 12 : size + 3} color={on ? BLUE : BODY} /> : null}
              <Text style={[styles.tabText, { fontSize: size }, on && styles.tabTextOn]} numberOfLines={1}>
                {t}
              </Text>
            </View>
            <View style={[styles.tabLine, on && styles.tabLineOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** A thin rounded progress bar. */
export function Bar({ value, color, height = 6, style }: { value: number; color: string; height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.bar, { height, borderRadius: height / 2 }, style]}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

/** A letter grade on a soft chip: green for A and B+, amber for B and below. */
export function GradeChip({ grade, size = 40 }: { grade: string; size?: number }) {
  const good = grade.startsWith('A') || grade === 'B+';
  const tone = good ? TONES.green : TONES.orange;
  return (
    <View style={[styles.grade, { width: size, height: size * 0.82, borderRadius: size * 0.28, backgroundColor: tone.soft }]}>
      <Text style={[styles.gradeText, { color: tone.text, fontSize: size * 0.42 }]}>{grade}</Text>
    </View>
  );
}

/** A red count bubble (unread messages, alerts). */
export function CountBadge({ count, size = 20, style }: { count: number; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.count, { minWidth: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.countText, { fontSize: size * 0.6 }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 16, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headText: { flex: 1, minWidth: 0, gap: 3 },
  headTitle: { fontWeight: '800', color: NAVY, letterSpacing: -0.2 },
  headSub: { fontSize: 13, color: BODY, lineHeight: 18 },
  link: { fontSize: 14, fontWeight: '600', color: BLUE },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 8 },
  pillText: { fontWeight: '600' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, borderRadius: 10 },
  btnPrimary: { backgroundColor: BLUE },
  btnOutline: { backgroundColor: WHITE, borderWidth: 1.5, borderColor: Maple.blueLine },
  btnSoft: { backgroundColor: SELECT, borderWidth: 1, borderColor: Maple.blueLine },
  btnText: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2, borderColor: WHITE },
  badgeRound: { position: 'absolute', right: -4, bottom: -4, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  waveBar: { width: 2.5, borderRadius: 2 },
  play: { alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: LINE },
  tab: { paddingHorizontal: 18, paddingTop: 10 },
  tabStretch: { flex: 1, paddingHorizontal: 4 },
  tabsSpread: { justifyContent: 'space-between' },
  tabSpread: { paddingHorizontal: 4 },
  tabInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 12 },
  tabText: { color: BODY, fontWeight: '500' },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  tabInnerTop: { flexDirection: 'column', gap: 6 },
  tabLine: { height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: -1 },
  tabLineOn: { backgroundColor: BLUE },
  bar: { backgroundColor: Maple.blueSelected, overflow: 'hidden' },
  grade: { alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontWeight: '800' },
  count: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, backgroundColor: Maple.error },
  countText: { color: WHITE, fontWeight: '700' },
});

export { MUTED };
