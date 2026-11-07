import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Maple } from '@/constants/maple';
import { SOCIAL_LINKS } from '@/lib/public-footer';

type Network = keyof typeof SOCIAL_LINKS;

const LABELS: Readonly<Record<Network, string>> = { linkedin: 'LinkedIn', youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook' };

/** Simple white marks for each network, drawn here (the icon set has no brand marks). */
function Mark({ network }: { network: Network }) {
  const c = Maple.white;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {network === 'linkedin' ? (
        <>
          <Rect x={2} y={2} width={20} height={20} rx={3} fill={c} />
          <Path d="M6.5 9.5h2.6V18H6.5zM7.8 5.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10.8 9.5h2.5v1.2c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.1 1.8 3.1 4V18h-2.6v-4.1c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.6z" fill={Maple.navyDeep} />
        </>
      ) : null}
      {network === 'youtube' ? (
        <>
          <Rect x={1.5} y={5} width={21} height={14} rx={4} fill={c} />
          <Path d="M10 9l5 3-5 3z" fill={Maple.navyDeep} />
        </>
      ) : null}
      {network === 'instagram' ? (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={5} stroke={c} strokeWidth={2} fill="none" />
          <Circle cx={12} cy={12} r={4} stroke={c} strokeWidth={2} fill="none" />
          <Circle cx={17.2} cy={6.8} r={1.2} fill={c} />
        </>
      ) : null}
      {network === 'facebook' ? (
        <>
          <Circle cx={12} cy={12} r={10} fill={c} />
          <Path d="M13.2 21v-6.6h2.2l.4-2.6h-2.6v-1.6c0-.8.3-1.3 1.3-1.3h1.4V6.6c-.3 0-1.1-.1-2-.1-2 0-3.3 1.2-3.3 3.4v1.9H8.4v2.6h2.2V21z" fill={Maple.navyDeep} />
        </>
      ) : null}
    </Svg>
  );
}

/** Maple's social profiles; a network shows only once its link is set (lib/public-footer). */
export function SocialLinks() {
  const shown = (Object.keys(SOCIAL_LINKS) as Network[]).filter((n) => SOCIAL_LINKS[n]);
  if (shown.length === 0) return null;
  return (
    <View style={styles.row}>
      {shown.map((n) => (
        <Pressable key={n} onPress={() => void Linking.openURL(SOCIAL_LINKS[n] as string)} accessibilityRole="link" accessibilityLabel={`Maple on ${LABELS[n]}`} hitSlop={6}>
          <Mark network={n} />
        </Pressable>
      ))}
    </View>
  );
}

/** True when at least one social link is set, so the bar can leave out its divider otherwise. */
export const HAS_SOCIAL = Object.values(SOCIAL_LINKS).some(Boolean);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 22 },
});
