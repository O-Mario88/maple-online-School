import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { VideoSheet } from '@/features/shared/VideoSheet';
import { sharePage } from '@/lib/save-text';

import { Brand } from '../palette';
import { LiveBooking, register, type Session } from './LiveBooking';
import { AboutLive, card, LearnList, MoreLive, TeacherCard } from './LiveCards';

const TABS = ['Overview', 'Syllabus', 'Teacher', 'Reviews'] as const;
type Tab = (typeof TABS)[number];
const LEAF = require('@/assets/images/maple-leaf.png') as number;
const REGISTER_BAR = 76;

function TopBar() {
  const [saved, setSaved] = useState(false);
  return (
    <View style={styles.top}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.push('/welcome'))} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}>
        <Icon name="chevronLeft" size={24} color={Brand.ink} />
      </Pressable>
      <View style={styles.logo}>
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.logoName}>Maple</Text>
          <Text style={styles.logoTag}>Global Online School</Text>
        </View>
      </View>
      <View style={styles.topActions}>
        <Pressable onPress={() => setSaved((v) => !v)} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save'} hitSlop={8}>
          <Icon name="heart" size={21} color={saved ? '#FF4D5E' : Brand.ink} />
        </Pressable>
        <Pressable onPress={() => sharePage('Join this live class on Maple Global Online School.')} accessibilityRole="button" accessibilityLabel="Share" hitSlop={8}>
          <Icon name="share" size={20} color={Brand.ink} />
        </Pressable>
      </View>
    </View>
  );
}

/** The live class page on phones, as the reference's phone screen draws it. */
export function LivePhone({ s }: { s: Session }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('Overview');
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const info = [
    { icon: 'calendar' as const, lines: [s.when.day.replace('Saturday', 'Sat'), s.when.time] },
    { icon: 'people' as const, lines: [s.where.title, s.where.detail] },
    { icon: 'person' as const, lines: [`${s.level.title} • ${s.level.detail}`] },
  ];
  const t = s.teacher;

  return (
    <View style={styles.flex}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: REGISTER_BAR + insets.bottom + 16 }}>
        <View style={styles.hero}>
          <Image source={s.photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="right" accessibilityLabel="The teacher at a whiteboard of key exam strategies" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{`(•) ${s.badge.toUpperCase()}`}</Text>
          </View>
          <Pressable style={styles.play} onPress={() => setPlaying(true)} accessibilityRole="button" accessibilityLabel="Play the introduction">
            <Text style={styles.playIcon}>▶</Text>
          </Pressable>
          <VideoSheet visible={playing} poster={s.photo} title={`${s.title.lead} ${s.title.accent}: introduction`} onClose={() => setPlaying(false)} />
        </View>

        <View style={styles.pad}>
          <Text style={styles.title} accessibilityRole="header">{`${s.title.lead}\n${s.title.accent}`}</Text>
          <View style={styles.info}>
            {info.map((row) => (
              <View key={row.lines[0]} style={styles.infoRow}>
                <Icon name={row.icon} size={20} color={Brand.blue} />
                <View>
                  {row.lines.map((l) => (
                    <Text key={l} style={styles.infoText}>
                      {l}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.box, styles.bookingBox]}>
          <LiveBooking s={s} phone />
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((x) => {
            const on = x === tab;
            return (
              <Pressable key={x} style={styles.tab} onPress={() => setTab(x)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{x}</Text>
                {on ? <View style={styles.tabLine} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          {tab === 'Overview' ? (
            <>
              <AboutLive s={s} phone collapsed={!expanded} />
              <Pressable onPress={() => setExpanded((e) => !e)} accessibilityRole="button" style={styles.readMore}>
                <Text style={styles.readMoreText}>{expanded ? 'Show less' : 'Read more →'}</Text>
              </Pressable>
            </>
          ) : null}
          {tab === 'Syllabus' ? <LearnList s={s} phone /> : null}
          {tab === 'Teacher' ? <TeacherCard s={s} phone /> : null}
          {tab === 'Reviews' ? (
            <View>
              <Text style={styles.reviewScore}>{`★ ${t.stats[2].value}`}</Text>
              <Text style={styles.infoText}>{`Average rating from ${t.stats[2].label.replace(/[()]/g, '')} of ${t.name}'s classes.`}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.pad}>
          <MoreLive s={s} phone />
        </View>
      </ScrollView>

      <View style={[styles.registerBar, { paddingBottom: insets.bottom + 10 }]}>
        <Pressable style={styles.registerBtn} onPress={register} accessibilityRole="button">
          <Icon name="cart" size={18} color={Brand.surface} />
          <Text style={styles.registerText}>Register Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F9FC' },
  top: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, backgroundColor: Brand.surface },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  leaf: { width: 30, height: 30 },
  logoName: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: Brand.ink },
  logoTag: { fontSize: 7, color: Brand.ink },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hero: { height: 196, marginHorizontal: 10, marginTop: 4, borderRadius: 14, overflow: 'hidden', backgroundColor: '#0A2A55' },
  badge: { position: 'absolute', left: 10, top: 10, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, backgroundColor: '#E5484D' },
  badgeText: { fontSize: 10.5, fontWeight: '700', color: Brand.surface },
  play: { position: 'absolute', alignSelf: 'center', top: 72, width: 52, height: 52, borderRadius: 26, borderWidth: 5, borderColor: 'rgba(255,255,255,0.45)', backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 18, color: Brand.surface, marginLeft: 3 },
  pad: { paddingHorizontal: 16 },
  title: { marginTop: 16, fontSize: 22, lineHeight: 27, fontWeight: '700', color: Brand.ink, letterSpacing: -0.3 },
  info: { marginTop: 12, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoText: { fontSize: 13, lineHeight: 18, color: '#3D4656' },
  box: { marginHorizontal: 12, padding: 16, ...card },
  bookingBox: { marginTop: 18 },
  tabs: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E6EAF1' },
  tab: { paddingVertical: 10 },
  tabText: { fontSize: 14, color: Brand.ink },
  tabTextOn: { color: Brand.blue, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 2.5, borderRadius: 2, backgroundColor: Brand.blue },
  section: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 22 },
  readMore: { marginTop: 8 },
  readMoreText: { fontSize: 13.5, fontWeight: '500', color: Brand.blue },
  reviewScore: { fontSize: 26, fontWeight: '700', color: Brand.ink, marginBottom: 6 },
  registerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 10, paddingHorizontal: 16, backgroundColor: '#F7F9FC', borderTopWidth: 1, borderTopColor: '#E6EAF1' },
  registerBtn: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 10, backgroundColor: Brand.blue },
  registerText: { fontSize: 16, fontWeight: '600', color: Brand.surface },
});
