import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { sharePage } from '@/lib/save-text';

import { Brand } from '../palette';
import { LiveBooking, type Session } from './LiveBooking';
import { AboutLive, card, LearnList, MoreLive, TeacherCard } from './LiveCards';
import { crumbHref } from '@/features/public/HomeNav';

/** The live class reference's desktop width; this layout uses its pixels (render inside RefScale). */
export const LIVE_REF_WIDTH = 1252;
const TABS = ['Overview', 'Syllabus', 'Teacher', 'Reviews', 'FAQ'] as const;
const NAVY = ['#011E52', '#0B2D5C'] as const;

function Hero({ s }: { s: Session }) {
  const [saved, setSaved] = useState(false);
  const meta = [
    { icon: 'calendar' as const, title: s.when.day, detail: s.when.time },
    { icon: 'people' as const, title: s.where.title, detail: s.where.detail },
    { icon: 'chart' as const, title: s.level.title, detail: s.level.detail },
  ];
  return (
    <View style={styles.hero}>
      <LinearGradient colors={NAVY} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Image source={s.photo} style={styles.heroPhoto} contentFit="fill" accessibilityLabel="The teacher at a whiteboard of key exam strategies" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{`(•) ${s.badge.toUpperCase()}`}</Text>
      </View>
      <Text style={styles.heroTitle} accessibilityRole="header">
        {`${s.title.lead}\n`}
        <Text style={styles.heroAccent}>{s.title.accent}</Text>
      </Text>
      <Text style={styles.heroSub}>{s.sub}</Text>
      <View style={styles.meta}>
        {meta.map((m) => (
          <View key={m.title} style={styles.metaItem}>
            <Icon name={m.icon} size={22} color={Brand.surface} />
            <View>
              <Text style={styles.metaTitle}>{m.title}</Text>
              <Text style={styles.metaDetail}>{m.detail}</Text>
            </View>
          </View>
        ))}
      </View>
      {/* Drawn over the copies printed in the photo, so they stay sharp and tappable. */}
      <Pressable style={styles.share} onPress={() => sharePage(`Join "${s.title.lead} ${s.title.accent}" live on Maple Global Online School.`)} accessibilityRole="button" accessibilityLabel="Share this live class">
        <Icon name="share" size={12} color={Brand.ink} />
        <Text style={styles.shareText}>Share</Text>
      </Pressable>
      <Pressable style={styles.heart} onPress={() => setSaved((v) => !v)} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save'}>
        <Icon name="heart" size={13} color={saved ? '#FF4D5E' : Brand.surface} />
      </Pressable>
    </View>
  );
}

function Features({ s }: { s: Session }) {
  return (
    <View style={styles.features}>
      {s.features.map((f) => (
        <View key={f.title} style={styles.feature}>
          <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
            <Icon name={f.icon} size={17} color={f.fg} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDetail}>{f.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The live class page on desktop, positioned in the reference's pixels. */
export function LiveDesk({ s }: { s: Session }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  return (
    <View style={styles.canvas}>
      <Text style={styles.crumbs}>
        {s.breadcrumb.map((c) => (
          <Text key={c}>
            <Text onPress={() => router.push(crumbHref(c))} accessibilityRole="link">
              {c}
            </Text>
            {'  ›  '}
          </Text>
        ))}
        {`${s.title.lead} ${s.title.accent}`}
      </Text>
      <Hero s={s} />
      <View style={[styles.featuresWrap]}>
        <Features s={s} />
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <Pressable key={t} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t}</Text>
              {on ? <View style={styles.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.box, styles.about]}>
        <AboutLive s={s} />
      </View>
      <View style={[styles.box, styles.learn]}>
        <LearnList s={s} />
      </View>
      <View style={[styles.box, styles.teacher]}>
        <TeacherCard s={s} />
      </View>
      <View style={[styles.box, styles.booking]}>
        <LiveBooking s={s} />
      </View>
      <View style={styles.more}>
        <MoreLive s={s} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Body coordinates: the reference's y minus its 60px top bar.
  canvas: { width: LIVE_REF_WIDTH, height: 970 },
  crumbs: { position: 'absolute', left: 32, top: 4, fontSize: 9.5, color: '#2A3242' },
  hero: { position: 'absolute', left: 14, top: 25, width: 1230, height: 315, borderRadius: 14, overflow: 'hidden', backgroundColor: '#0A2A55' },
  heroPhoto: { position: 'absolute', left: 486, top: 1, width: 418, height: 282 },
  badge: { position: 'absolute', left: 32, top: 38, height: 22, justifyContent: 'center', paddingHorizontal: 9, borderRadius: 11, backgroundColor: '#E5484D' },
  badgeText: { fontSize: 10, fontWeight: '700', color: Brand.surface, letterSpacing: 0.3 },
  heroTitle: { position: 'absolute', left: 32, top: 68, fontSize: 36, lineHeight: 44, fontWeight: '700', color: Brand.surface, letterSpacing: -0.4 },
  heroAccent: { color: '#3D8BFF' },
  heroSub: { position: 'absolute', left: 32, top: 162, width: 370, fontSize: 14.5, lineHeight: 22, color: '#E1E8F5' },
  meta: { position: 'absolute', left: 32, top: 227, flexDirection: 'row', gap: 22 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  metaTitle: { fontSize: 10.5, fontWeight: '600', color: Brand.surface },
  metaDetail: { marginTop: 2, fontSize: 10, color: '#D3DCEC' },
  share: { position: 'absolute', left: 781, top: 7, height: 24, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 6, backgroundColor: Brand.surface },
  shareText: { fontSize: 10, fontWeight: '500', color: Brand.ink },
  heart: { position: 'absolute', left: 854, top: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: '#8E9AA6', alignItems: 'center', justifyContent: 'center' },
  featuresWrap: { position: 'absolute', left: 30, top: 308, width: 875, height: 64 },
  features: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17, ...card },
  feature: { width: 173, flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 10.5, fontWeight: '700', color: Brand.ink },
  featureDetail: { marginTop: 2, fontSize: 9, color: '#4A5263' },
  tabs: { position: 'absolute', left: 30, top: 392, flexDirection: 'row', gap: 4 },
  tab: { height: 36, justifyContent: 'center', paddingHorizontal: 14 },
  tabOn: { borderRadius: 8, backgroundColor: '#EAF1FE' },
  tabText: { fontSize: 12.5, color: Brand.ink },
  tabTextOn: { color: Brand.blue, fontWeight: '500' },
  tabLine: { position: 'absolute', left: 10, right: 10, bottom: -1, height: 2.5, borderRadius: 2, backgroundColor: Brand.blue },
  box: { position: 'absolute', padding: 17, ...card },
  about: { left: 30, top: 438, width: 470, height: 352, paddingLeft: 15 },
  learn: { left: 517, top: 438, width: 388, height: 352 },
  teacher: { left: 920, top: 438, width: 308, height: 352 },
  booking: { left: 920, top: 20, width: 308, height: 407, paddingTop: 18 },
  more: { position: 'absolute', left: 36, top: 806, width: 1190 },
});
