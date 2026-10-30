import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import type { CatalogueEntry } from '@/mock/public';

import { Brand } from '../palette';

const BADGE_COLOURS: Readonly<Record<string, string>> = {
  Bestseller: '#F5C542',
  Live: Brand.live,
  'Past papers': '#C7D7FE',
  Course: Brand.purple,
  Bootcamp: '#8B5CF6',
  Free: Brand.green,
};
const DARK_BADGE_TEXT = new Set(['Bestseller', 'Past papers']);

function initials(name: string): string {
  return name
    .replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

/** Badge, save heart and duration drawn over a thumbnail that has no photo. */
function ThumbOverlay({ item, saved, onSave, badgeText }: { item: CatalogueEntry; saved: boolean; onSave: () => void; badgeText: string }) {
  return (
    <>
      <Icon name={item.icon} size={36} color="rgba(255,255,255,0.85)" />
      <Text style={[styles.badge, { backgroundColor: BADGE_COLOURS[item.badge] ?? Brand.blue, color: badgeText }]}>{item.badge.toUpperCase()}</Text>
      <Pressable style={styles.heart} onPress={onSave} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save for later'} hitSlop={8}>
        <Text style={styles.heartText}>{saved ? '♥' : '♡'}</Text>
      </Pressable>
      {item.startsIn ? <Text style={styles.starts}>{`Starts in ${item.startsIn}`}</Text> : <Text style={styles.hours}>{`◷ ${item.hours}`}</Text>}
    </>
  );
}

/** One catalogue result: thumbnail with badge, title, teacher, rating, price and add-to-cart. */
export function CatalogueCard({ item, coursePage, list }: { item: CatalogueEntry; coursePage: string; list: boolean }) {
  const [saved, setSaved] = useState(false);
  const free = item.priceUGX === 0;
  const badgeText = DARK_BADGE_TEXT.has(item.badge) ? Brand.ink : Brand.surface;
  return (
    <Pressable
      style={[styles.card, list && styles.cardList]}
      onPress={() => router.push(`/courses/${coursePage}`)}
      accessibilityRole="link"
      accessibilityLabel={`${item.title}, ${item.meta}, ${free ? 'free' : formatMoney(item.priceUGX, 'UGX')}`}>
      <View style={[styles.thumb, list && styles.thumbList, { backgroundColor: item.tint }]}>
        {item.photo ? (
          // The reference photo already carries its badge, heart and duration.
          <Image source={item.photo} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={`${item.teacher}, ${item.title}`} />
        ) : (
          <ThumbOverlay item={item} saved={saved} onSave={() => setSaved((s) => !s)} badgeText={badgeText} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta}>{item.meta}</Text>
        <View style={styles.teacher}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(item.teacher)}</Text>
          </View>
          <Text style={styles.teacherName} numberOfLines={1}>
            {item.teacher}
          </Text>
        </View>
        <Text style={styles.rating}>
          <Text style={styles.star}>★ </Text>
          {`${item.rating} (${item.reviews >= 1000 ? `${(item.reviews / 1000).toFixed(1)}K` : item.reviews})`}
        </Text>
        <View style={styles.footer}>
          <View style={styles.prices}>
            <Text style={[styles.price, item.wasUGX ? styles.priceSale : null]}>{free ? 'Free' : formatMoney(item.priceUGX, 'UGX')}</Text>
            {item.wasUGX ? <Text style={styles.was}>{formatMoney(item.wasUGX, 'UGX')}</Text> : null}
          </View>
          <Pressable style={styles.cart} onPress={() => router.push('/checkout')} accessibilityRole="button" accessibilityLabel={`Add ${item.title} to cart`}>
            <Icon name="wallet" size={16} color={Brand.blue} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: 220, maxWidth: 360, borderRadius: 14, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  cardList: { flexDirection: 'row', maxWidth: undefined, flexBasis: '100%' },
  thumb: { height: 128, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbList: { width: 200, height: undefined },
  badge: { position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  heart: { position: 'absolute', top: 6, right: 8 },
  heartText: { fontSize: 22, color: Brand.surface },
  hours: { position: 'absolute', left: 10, bottom: 8, fontSize: 11, fontWeight: '600', color: Brand.surface },
  starts: { position: 'absolute', left: 10, bottom: 8, fontSize: 11, fontWeight: '700', color: Brand.ink, backgroundColor: Brand.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  info: { flex: 1, gap: 4, padding: 12 },
  title: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  meta: { fontSize: 12, color: Brand.muted },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  avatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8D5524', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 9, fontWeight: '700', color: Brand.surface },
  teacherName: { flex: 1, fontSize: 12, color: Brand.body },
  rating: { fontSize: 12, color: Brand.body },
  star: { color: Brand.amber },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexShrink: 1, flexWrap: 'wrap' },
  price: { fontSize: 15, fontWeight: '800', color: Brand.ink },
  priceSale: { color: Brand.live },
  was: { fontSize: 11, color: Brand.muted, textDecorationLine: 'line-through' },
  cart: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, alignItems: 'center', justifyContent: 'center' },
});
