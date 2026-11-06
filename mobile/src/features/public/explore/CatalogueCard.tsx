import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { CatalogueEntry } from '@/mock/public';

import { Brand, CARD_SHADOW } from '../palette';
import { Maple } from '@/constants/maple';

/** The thumbnail's height on a 263px-wide card in the reference. */
export const THUMB_HEIGHT = 139;
const THUMB_RATIO = 263 / THUMB_HEIGHT;

function reviewCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

/**
 * One Explore result as the reference draws it: photo (its badge, heart and
 * duration are part of the photo), title, level, teacher, rating, and that a study pass includes it.
 */
interface CardProps {
  item: CatalogueEntry;
  coursePage: string;
  width?: number;
  list?: boolean;
  /** Phones: two narrow cards per row, with smaller type. */
  compact?: boolean;
}

export function CatalogueCard({ item, coursePage, width, list = false, compact = false }: CardProps) {
  const c = compact;
  return (
    <Pressable
      style={[styles.card, width === undefined ? styles.cardFull : { width }, list && styles.cardList]}
      onPress={() => router.push(`/courses/${coursePage}`)}
      accessibilityRole="link"
      accessibilityLabel={`${item.title}, ${item.meta}, included in every study pass`}>
      <View style={[styles.thumb, (width === undefined || c) && !list ? styles.thumbFluid : null, list && styles.thumbList, { backgroundColor: item.tint }]}>
        {item.photo ? <Image source={item.photo} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={`${item.teacher}, ${item.title}`} /> : null}
      </View>
      <View style={[styles.info, c && styles.infoC, list && styles.infoList]}>
        <Text style={[styles.title, c && styles.titleC]} numberOfLines={c ? 2 : 1}>
          {item.title}
        </Text>
        <Text style={[styles.meta, c && styles.metaC]} numberOfLines={1}>
          {item.meta}
        </Text>
        <View style={[styles.teacher, c && styles.rowC]}>
          {item.face ? <Image source={item.face} style={[styles.face, c && styles.faceC]} /> : <View style={[styles.face, c && styles.faceC]} />}
          <Text style={[styles.teacherName, c && styles.smallC]} numberOfLines={1}>
            {item.teacher}
          </Text>
        </View>
        <View style={[styles.rating, c && styles.rowC]}>
          <Text style={[styles.stars, c && styles.smallC]}>
            ★ <Text style={styles.starSoft}>★</Text>
          </Text>
          <Text style={[styles.ratingText, c && styles.smallC]}>{`${item.rating} (${reviewCount(item.reviews)})`}</Text>
        </View>
        <View style={[styles.footer, c && styles.footerC]}>
          <Text style={[styles.included, c && styles.includedC]}>Included in every study pass</Text>
          <Icon name="chevronRight" size={16} color={Brand.blue} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, backgroundColor: Brand.surface, overflow: 'hidden', ...CARD_SHADOW },
  cardFull: { width: '100%' },
  infoC: { paddingTop: 9, paddingHorizontal: 10, paddingBottom: 11 },
  titleC: { fontSize: 13.5, lineHeight: 17, minHeight: 34, letterSpacing: 0 },
  metaC: { marginTop: 3, fontSize: 11.5, lineHeight: 15 },
  rowC: { marginTop: 7, gap: 6 },
  faceC: { width: 20, height: 20, borderRadius: 10 },
  smallC: { fontSize: 11.5 },
  footerC: { marginTop: 7, alignItems: 'flex-end' },
  cardList: { flexDirection: 'row' },
  thumb: { height: THUMB_HEIGHT, overflow: 'hidden' },
  thumbFluid: { height: 'auto', aspectRatio: THUMB_RATIO },
  thumbList: { width: 263, height: 'auto' },
  info: { paddingTop: 11, paddingHorizontal: 13, paddingBottom: 16 },
  infoList: { flex: 1 },
  title: { fontSize: 15, lineHeight: 20, fontWeight: '700', color: Brand.ink, letterSpacing: -0.2 },
  meta: { marginTop: 5, fontSize: 13.5, lineHeight: 18, color: Maple.body },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11 },
  face: { width: 24, height: 24, borderRadius: 12, backgroundColor: Maple.disabledBorder },
  teacherName: { flex: 1, fontSize: 13.5, color: Maple.navy },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 11, height: 17 },
  stars: { fontSize: 13, color: Maple.warning, letterSpacing: 1 },
  starSoft: { color: '#FBBF5A' },
  ratingText: { fontSize: 12.5, color: Maple.body },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  included: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: Brand.blue },
  includedC: { fontSize: 11.5 },
});
