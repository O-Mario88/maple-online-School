import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';
import type { Career } from '@/mock/career-compass';

import { BRAND_SOFT, BRAND_BLUE } from './CareerParts';
import { Maple, Radii } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';
import { Palette } from '@/constants/palette';

export { BRAND_BLUE };
/** The main study route into a career, e.g. "Degree · 4 years". */
export const routeLabel = (c: Career) => {
  const r = c.pathways[c.pathways.length - 1];
  return r ? `${r.level} · ${r.years}` : '';
};

/** A section's heading: icon tile, title and one line on what it's for (the references' page heads). */
export function SectionHead({ icon, title, sub, phone = false }: { icon: IconName; title: string; sub: string; phone?: boolean }) {
  return (
    <View style={s.head}>
      <LinearGradient colors={[Maple.blue, Maple.blue]} style={[s.headIcon, phone && s.headIconP]}>
        <Icon name={icon} size={phone ? 20 : 26} color={L.white} />
      </LinearGradient>
      <View style={s.flex}>
        <Text style={[s.headTitle, phone && s.headTitleP]} {...PAGE_TITLE}>
          {title}
        </Text>
        <Text style={s.headSub}>{sub}</Text>
      </View>
    </View>
  );
}

function Save({ saved, onPress, label, onPhoto = false }: { saved: boolean; onPress: () => void; label: string; onPhoto?: boolean }) {
  return (
    <Pressable
      style={onPhoto ? s.saveOnPhoto : undefined}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? `Remove ${label} from saved` : `Save ${label}`}>
      <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={17} color={saved ? BRAND_BLUE : L.ink} />
    </Pressable>
  );
}

/** A career with its photo (Recommended for You, Career Explorer grid). */
export function CareerPhotoCard({
  c,
  area,
  saved,
  onSave,
  onOpen,
  compact = false,
  style,
}: {
  c: Career;
  area?: string;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  compact?: boolean;
  /** Sizes the card in a grid; without it the card shares its row equally. */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.card, compact ? s.cardCompact : (style ?? s.cardGrid)]}>
      <Pressable style={s.fill} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${c.title}. ${c.overview}`}>
        <Image decorative source={c.photo} style={compact ? s.photoCompact : s.photo} contentFit="cover" />
        <View style={s.cardBody}>
          <Text style={s.cardTitle} numberOfLines={1}>
            {c.title}
          </Text>
          {!compact ? (
            <View style={s.tags}>
              {area ? <Text style={s.tag}>{area}</Text> : null}
              <Text style={s.tag}>{c.pathways[c.pathways.length - 1]?.level ?? ''}</Text>
            </View>
          ) : null}
          <Text style={s.small} numberOfLines={2}>
            {c.overview}
          </Text>
          {!compact ? (
            <View style={s.more}>
              <Text style={s.moreText}>View Details</Text>
              <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
            </View>
          ) : null}
        </View>
      </Pressable>
      <Save saved={saved} onPress={onSave} label={c.title} onPhoto />
    </View>
  );
}

/** A career as a list row (the phone Career Explorer reference). */
export function CareerListRow({ c, saved, onSave, onOpen }: { c: Career; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return (
    <View>
      <Pressable style={s.row} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${c.title}. ${c.overview}`}>
        <Image decorative source={c.photo} style={s.rowPhoto} contentFit="cover" />
        <View style={s.flex}>
          <View style={s.rowHead}>
            <Text style={[s.cardTitle, s.flex]}>{c.title}</Text>
          </View>
          <Text style={s.small} numberOfLines={2}>
            {c.overview}
          </Text>
          <View style={s.meta}>
            <View style={s.metaItem}>
              <Icon name="cap" size={13} color={BRAND_BLUE} />
              <Text style={s.metaText}>{c.pathways.map((p) => p.level).join(' / ')}</Text>
            </View>
            <View style={s.metaItem}>
              <Icon name="clock" size={13} color={L.body} />
              <Text style={s.metaText}>{c.pathways[c.pathways.length - 1]?.years ?? ''}</Text>
            </View>
          </View>
        </View>
        <Icon name="chevronRight" size={16} color={L.body} />
      </Pressable>
      <View style={s.rowSave}>
        <Save saved={saved} onPress={onSave} label={c.title} />
      </View>
    </View>
  );
}

/** "See Your Pathway": from careers to the Career Path in My Plan. */
export function PathwayBanner({ onPress, phone = false }: { onPress: () => void; phone?: boolean }) {
  return (
    <View style={[s.banner, phone && s.bannerP]}>
      <Icon name="map" size={30} color={BRAND_BLUE} />
      <View style={s.flex}>
        <Text style={s.bannerTitle}>See Your Pathway</Text>
        <Text style={s.small}>Find the subjects, qualifications and universities for a career, then add the steps to My Plan.</Text>
      </View>
      <Pressable style={s.bannerBtn} onPress={onPress} accessibilityRole="link">
        <Text style={s.bannerBtnText}>View Pathway</Text>
        <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  small: { fontSize: 12.5, lineHeight: 17, color: L.body },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  headIconP: { width: 44, height: 44, borderRadius: 12 },
  headTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: L.navy,
    letterSpacing: -0.5,
  },
  headTitleP: { fontSize: 22, lineHeight: 28 },
  headSub: { marginTop: 2, fontSize: 14, lineHeight: 19, color: L.ink },
  cardGrid: { flexGrow: 1, flexBasis: 220 },
  card: {
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  cardCompact: { width: 170 },
  photo: { width: '100%', height: 150 },
  photoCompact: { width: '100%', height: 92 },
  saveOnPhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  cardBody: { gap: 6, padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: L.navy },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
    color: BRAND_BLUE,
    backgroundColor: BRAND_SOFT,
  },
  more: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  moreText: { fontSize: 13, fontWeight: '600', color: BRAND_BLUE },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  rowPhoto: { width: 86, height: 82, borderRadius: 10 },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 26,
  },
  rowSave: { position: 'absolute', top: 14, right: 40 },
  fill: { flexGrow: 1 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontWeight: '500', color: L.ink },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Maple.blueSelected,
    backgroundColor: Maple.blueSoft,
  },
  bannerP: { flexWrap: 'wrap' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: L.navy },
  bannerBtn: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: Radii.control,
    borderWidth: 1.5,
    borderColor: Maple.blueLine,
    backgroundColor: L.white,
  },
  bannerBtnText: { fontSize: 13.5, fontWeight: '600', color: BRAND_BLUE },
});

export interface HeroButton {
  label: string;
  icon: IconName;
  onPress: () => void;
}

/** The purple section hero of the Career Compass references: kicker, headline, two buttons and a photo on the right. */
/** `wide` gives the photo more of the banner (heroes with no right column beside them). */
export function PurpleHero({ kicker, icon, title, sub, photo, buttons, phone = false, wide = false }: { kicker: string; icon: IconName; title: string; sub: string; photo: number; buttons: readonly [HeroButton, HeroButton]; phone?: boolean; wide?: boolean }) {
  return (
    <View style={[h.hero, phone ? h.heroP : h.heroD]}>
      <LinearGradient colors={[Maple.blue, BRAND_BLUE, Maple.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={phone ? h.photoP : wide ? h.photoWide : h.photo} pointerEvents="none">
        {/* On phones the photo strip is narrow, so keep its left side, where the person is. */}
        <Image decorative source={photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={phone ? 'top left' : 'top'} />
        <LinearGradient colors={[Maple.blue, 'rgba(106,68,223,0.55)', 'rgba(106,68,223,0)']} locations={[0, 0.3, 0.7]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={phone ? h.textP : h.text}>
        <View style={h.kicker}>
          <Icon name={icon} size={phone ? 15 : 18} color={L.white} />
          <Text style={[h.kickerText, phone && h.kickerTextP]}>{kicker}</Text>
        </View>
        <Text style={[h.title, phone && h.titleP]} accessibilityRole="header">
          {title}
        </Text>
        <Text style={[h.sub, phone && h.subP]}>{sub}</Text>
        <View style={[h.btns, phone && h.btnsP]}>
          <Pressable style={h.solid} onPress={buttons[0].onPress} accessibilityRole="button">
            <Icon name={buttons[0].icon} size={15} color={BRAND_BLUE} />
            <Text style={h.solidText}>{buttons[0].label}</Text>
          </Pressable>
          <Pressable style={h.ghost} onPress={buttons[1].onPress} accessibilityRole="button">
            <Icon name={buttons[1].icon} size={15} color={L.white} />
            <Text style={h.ghostText}>{buttons[1].label}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** A photo badge (event type, member count, Sponsored, Mentored). */
export function PhotoPill({ text, icon, tone = 'white', side = 'left' }: { text: string; icon?: IconName; tone?: 'white' | 'gold'; side?: 'left' | 'right' }) {
  return (
    <View style={[h.pill, side === 'left' ? h.pillLeft : h.pillRight, tone === 'gold' && h.pillGold]}>
      {icon ? <Icon name={icon} size={14} color={tone === 'gold' ? Maple.warningText : BRAND_BLUE} /> : null}
      <Text style={[h.pillText, tone === 'gold' && h.pillTextGold]}>{text}</Text>
    </View>
  );
}

/** "Showing 1 – 6 of 12 events" with page buttons. */
export function Pager({ info, noun, onPage }: { info: { page: number; pages: number; from: number; to: number; total: number }; noun: string; onPage: (n: number) => void }) {
  return (
    <View style={h.pager}>
      <Text style={s.small}>{`Showing ${info.from} – ${info.to} of ${info.total} ${noun}`}</Text>
      {info.pages > 1 ? (
        <View style={h.pages}>
          <Pressable style={h.pageBtn} onPress={() => onPage(info.page - 1)} disabled={info.page === 1} accessibilityRole="button" accessibilityLabel="Previous page">
            <Icon name="chevronLeft" size={16} color={L.ink} />
          </Pressable>
          {Array.from({ length: info.pages }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} style={[h.pageBtn, n === info.page && h.pageOn]} onPress={() => onPage(n)} accessibilityRole="button" accessibilityState={{ selected: n === info.page }} accessibilityLabel={`Page ${n}`}>
              <Text style={[h.pageText, n === info.page && h.pageTextOn]}>{n}</Text>
            </Pressable>
          ))}
          <Pressable style={h.pageBtn} onPress={() => onPage(info.page + 1)} disabled={info.page === info.pages} accessibilityRole="button" accessibilityLabel="Next page">
            <Icon name="chevronRight" size={16} color={L.ink} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** A white right-column card with an icon title (the references' side cards). */
export function SideCard({ title, icon, sub, right, children }: { title: string; icon: IconName; sub?: string; right?: ReactNode; children?: ReactNode }) {
  return (
    <View style={h.side}>
      <View style={h.sideHead}>
        <Icon name={icon} size={22} color={BRAND_BLUE} />
        <View style={s.flex}>
          <Text style={h.sideTitle}>{title}</Text>
          {sub ? <Text style={s.small}>{sub}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

/** Colour tiles under a hero (Get Guidance, Scholarships, …). */
export function ColorTiles({ items, phone = false }: { items: readonly { key: string; title: string; sub: string; icon: IconName; tint: string; color: string; onPress: () => void }[]; phone?: boolean }) {
  const row = (
    <View style={h.tiles}>
      {items.map((t) => (
        <Pressable key={t.key} style={[h.tile, phone ? h.tileP : h.tileD, { backgroundColor: t.tint }]} onPress={t.onPress} accessibilityRole="button" accessibilityLabel={`${t.title}: ${t.sub}`}>
          <Icon name={t.icon} size={phone ? 24 : 30} color={t.color} />
          <Text style={h.tileTitle}>{t.title}</Text>
          <Text style={[s.small, h.center]}>{t.sub}</Text>
        </Pressable>
      ))}
    </View>
  );
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  ) : (
    row
  );
}

const h = StyleSheet.create({
  center: { textAlign: 'center' },
  hero: { overflow: 'hidden', borderRadius: 20 },
  heroD: { minHeight: 212 },
  heroP: { minHeight: 220, borderRadius: 16 },
  photo: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 440 },
  photoWide: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 680 },
  photoP: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 160 },
  text: { maxWidth: 560, gap: 8, paddingLeft: 30, paddingTop: 22, paddingBottom: 22 },
  textP: { gap: 7, padding: 16, paddingRight: 120 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerText: { fontSize: 17, fontWeight: '700', color: L.white },
  kickerTextP: { fontSize: 14 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '800', color: L.white, letterSpacing: -0.8 },
  titleP: { fontSize: 23, lineHeight: 28, letterSpacing: -0.4 },
  sub: { fontSize: 14.5, lineHeight: 20, color: Maple.blueSoft },
  subP: { fontSize: 12.5, lineHeight: 17 },
  btns: { flexDirection: 'row', gap: 12, marginTop: 6 },
  btnsP: { flexWrap: 'wrap', gap: 8 },
  solid: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderRadius: 21, backgroundColor: L.white },
  solidText: { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
  ghost: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderRadius: Radii.control, borderWidth: 1.5, borderColor: L.white },
  ghostText: { fontSize: 14, fontWeight: '600', color: L.white },
  pill: { position: 'absolute', top: 4, height: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: L.white },
  pillLeft: { left: 4 },
  pillRight: { right: 4 },
  pillGold: { backgroundColor: Palette.yellow400b },
  pillText: { fontSize: 12.5, fontWeight: '700', color: L.navy },
  pillTextGold: { color: Maple.warningText },
  pager: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pages: { flexDirection: 'row', gap: 6 },
  pageBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  pageOn: { backgroundColor: BRAND_BLUE },
  pageText: { fontSize: 14, fontWeight: '600', color: L.ink },
  pageTextOn: { color: L.white },
  side: { gap: 12, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sideTitle: { fontSize: 17.5, fontWeight: '800', color: L.navy },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 16, paddingHorizontal: 8, borderRadius: 14 },
  tileD: { flex: 1 },
  tileP: { width: 140 },
  tileTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy, textAlign: 'center' },
});
