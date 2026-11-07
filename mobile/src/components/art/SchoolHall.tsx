import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Maple } from '@/constants/maple';

const LINE = 'rgba(255, 255, 255, 0.16)';
const LEAVES: readonly (readonly [number, number, number])[] = [
  [24, 210, 5],
  [40, 192, 4],
  [16, 236, 3],
  [396, 188, 5],
  [380, 214, 4],
  [404, 230, 3],
];

/**
 * A quiet line drawing of a school hall with a few gold leaves, for dark Maple Blue surfaces
 * (the Messages banner, the site footer) in place of a photograph. Decorative only.
 */
export function SchoolHall({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 420 300" preserveAspectRatio="xMaxYMax meet">
        <Path d="M70 300V150h280v150" stroke={LINE} strokeWidth={2} fill="none" />
        <Path d="M56 150 210 70l154 80Z" stroke={LINE} strokeWidth={2} fill="none" />
        <Rect x={182} y={18} width={56} height={60} stroke={LINE} strokeWidth={2} fill="none" />
        <Path d="M176 18h68M210 0v18" stroke={LINE} strokeWidth={2} />
        <Circle cx={210} cy={112} r={14} stroke={LINE} strokeWidth={2} fill="none" />
        {[96, 148, 200, 252, 304].map((x) => (
          <Path key={x} d={`M${x} 300v-78a20 20 0 0 1 40 0v78`} stroke={LINE} strokeWidth={2} fill="none" />
        ))}
        {LEAVES.map(([cx, cy, r]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={Maple.gold} opacity={0.55} />
        ))}
      </Svg>
    </View>
  );
}
