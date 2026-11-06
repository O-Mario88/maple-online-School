import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type Engagement, formatCount, ratingLabel, statsSpoken } from '@/lib/engagement';
import { Maple } from '@/constants/maple';

const MUTED = Maple.secondary;
const BODY = Maple.body;
const STAR = Maple.warning;

interface ContentStatsProps {
  e: Engagement;
  /** The text size; icons match it. */
  size?: number;
  /** Show "who uploaded it" above the numbers (on by default). */
  uploader?: boolean;
  /** The text colour, for pages on the app theme (light designs use the default). */
  color?: string;
}

/** Who uploaded a piece of content, and its views, rating out of five, likes and comments. Used on every kind of content. */
export function ContentStats({ e, size = 12, uploader = true, color }: ContentStatsProps) {
  return (
    <View style={s.stats} accessible accessibilityLabel={statsSpoken(e)}>
      {uploader ? (
        <Text style={[s.uploader, { fontSize: size }, color ? { color } : null]} numberOfLines={1}>
          {e.uploader}
        </Text>
      ) : null}
      <View style={s.row}>
        <Stat icon="eye" text={formatCount(e.views)} size={size} color={color} />
        <Stat icon="star" text={`${ratingLabel(e.rating)}/5`} size={size} color={color} iconColor={STAR} />
        <Stat icon="heart" text={formatCount(e.likes)} size={size} color={color} />
        <Stat icon="chat" text={formatCount(e.comments)} size={size} color={color} />
      </View>
    </View>
  );
}

function Stat({ icon, text, size, color = MUTED, iconColor = color }: { icon: 'eye' | 'star' | 'heart' | 'chat'; text: string; size: number; color?: string; iconColor?: string }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={size} color={iconColor} />
      <Text style={{ fontSize: size - 0.5, color }}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  stats: { gap: 3 },
  uploader: { fontWeight: '500', color: BODY },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 2 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
