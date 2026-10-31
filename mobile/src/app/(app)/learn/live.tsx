import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { BookingSheet, BootcampRow, Head, LiveClassCard, LiveClassRow, TutorCard, WeekRow } from '@/features/learner/live/HubCards';
import { BODY, CalendarHeader, DayStrip, dayTitle, INK, MonthGrid, ScheduleRow } from '@/features/learner/live/HubSchedule';
import { type Hub, type HubState, TABS, useLiveHub } from '@/features/learner/live/useLiveHub';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The live hub reference's page (x 18–1168 at 1536 wide); the desktop layout uses its pixels. */
const HUB_REF_WIDTH = 1150;
const MAX_DESK_WIDTH = 1400;
const VISIBLE_TUTORS = 3;

function Empty({ s }: { s: HubState }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{s.tab === 'recordings' ? 'No recordings yet this week.' : 'Nothing on this day. Book a tutor or pick another day.'}</Text>
    </View>
  );
}

function Schedule({ hub, s, phone = false }: { hub: Hub; s: HubState; phone?: boolean }) {
  if (s.list.length === 0) return <Empty s={s} />;
  return (
    <View style={phone ? styles.listP : undefined}>
      {s.list.map((x) => (
        <ScheduleRow key={x.id} hub={hub} x={x} s={s} phone={phone} showDay={s.tab === 'recordings'} />
      ))}
    </View>
  );
}

function Hero({ hub, s }: { hub: Hub; s: HubState }) {
  return (
    <View style={styles.hero}>
      <LinearGradient colors={['#EEF6FF', '#E4F0FD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Image source={hub.hero} style={styles.heroPhoto} contentFit="fill" accessibilityLabel="A smiling learner with headphones beside the words Learn, Ask, Practice, Grow" />
      <Text style={styles.title} accessibilityRole="header">
        {hub.title}
      </Text>
      <Text style={styles.sub}>{hub.sub}</Text>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = s.tab === t.key;
          return (
            <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => s.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.white]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.nowOuter}>
        <Pressable style={styles.now} onPress={() => s.setTab('tutor')} accessibilityRole="button" accessibilityLabel="Available now: get 1-on-1 help in 15 minutes">
          <Image source={hub.nowIcon} style={styles.nowIcon} />
          <View style={styles.flex}>
            <Text style={styles.nowTitle}>Available Now</Text>
            <Text style={styles.nowSub} numberOfLines={1}>{`Get 1-on-1 help in ${hub.sessionMinutes} minutes`}</Text>
          </View>
          <Icon name="chevronRight" size={16} color={INK} />
        </Pressable>
      </View>
    </View>
  );
}

function Tutors({ hub, s }: { hub: Hub; s: HubState }) {
  const [offset, setOffset] = useState(0);
  const more = offset + VISIBLE_TUTORS < hub.tutors.length;
  return (
    <View style={styles.tutors}>
      {hub.tutors.slice(offset, offset + VISIBLE_TUTORS).map((t) => (
        <TutorCard key={t.id} hub={hub} t={t} s={s} />
      ))}
      {offset > 0 ? (
        <Pressable style={[styles.carouselBtn, styles.carouselPrev]} onPress={() => setOffset((o) => o - 1)} accessibilityRole="button" accessibilityLabel="Previous tutors">
          <Icon name="chevronLeft" size={14} color={INK} />
        </Pressable>
      ) : null}
      {more ? (
        <Pressable style={[styles.carouselBtn, styles.carouselNext]} onPress={() => setOffset((o) => o + 1)} accessibilityRole="button" accessibilityLabel="More tutors">
          <Icon name="chevronRight" size={14} color={INK} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Desktop({ hub, s }: { hub: Hub; s: HubState }) {
  return (
    <View style={styles.canvas}>
      <Hero hub={hub} s={s} />
      <View style={styles.cols}>
        <View style={styles.left}>
          <View style={[styles.card, styles.calendar]}>
            <CalendarHeader s={s} />
            <View style={styles.strip}>{s.view === 'week' ? <DayStrip s={s} /> : <MonthGrid s={s} />}</View>
            <Text style={styles.dayTitle}>{dayTitle(hub, s)}</Text>
            <Schedule hub={hub} s={s} />
          </View>
          <View style={[styles.card, styles.upcoming]}>
            <Head title="Upcoming Live Classes" link="View All" onLink={() => router.push('/learn/explore')} />
            <View style={styles.classes}>
              {hub.liveClasses.map((c) => (
                <LiveClassCard key={c.id} hub={hub} c={c} s={s} />
              ))}
            </View>
          </View>
        </View>
        <View style={styles.right}>
          <View style={[styles.card, styles.panel]}>
            <Head title="Available Now: 15-Min Homework Rescue" link="See All" onLink={() => s.setTab('tutor')} sub="Get quick 1-on-1 help from verified tutors. Usually responds in under 2 minutes." />
            <Tutors hub={hub} s={s} />
          </View>
          <View style={[styles.card, styles.panel, styles.camps]}>
            <Head title="My Enrolled Bootcamps" link="View All" onLink={() => s.setTab('bootcamp')} />
            <View style={styles.campList}>
              {hub.bootcamps.map((b) => (
                <BootcampRow key={b.id} b={b} />
              ))}
            </View>
          </View>
          <View style={[styles.card, styles.panel, styles.weekPanel]}>
            <Head title="Upcoming This Week" link="See All" onLink={s.today} />
            <View style={styles.weekList}>
              {hub.thisWeek.map((x) => (
                <WeekRow key={x.id} hub={hub} x={x} s={s} />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Phone({ hub, s, avatar }: { hub: Hub; s: HubState; avatar: number }) {
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={styles.phone}>
        <Text style={styles.titleP} accessibilityRole="header">
          {hub.title}
        </Text>
        <Text style={styles.subP}>{hub.phoneSub}</Text>
        <View style={styles.tabsP} accessibilityRole="tablist">
          {TABS.filter((t) => t.phone).map((t) => {
            const on = s.tab === t.key;
            return (
              <Pressable key={t.key} style={[styles.tabP, on && styles.tabOn]} onPress={() => s.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.tabTextP, on && styles.white]}>{t.phone}</Text>
              </Pressable>
            );
          })}
        </View>
        <DayStrip s={s} phone />
        <View style={styles.gapP}>
          <Head title={dayTitle(hub, s, true)} link="See All" onLink={() => s.setTab('all')} small />
        </View>
        <Schedule hub={hub} s={s} phone />
        <View style={styles.gapP}>
          <Head title="Available Now: 15-Min Homework Rescue" link="See All" onLink={() => s.setTab('tutor')} small />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tutorsP}>
          {hub.tutors.map((t) => (
            <TutorCard key={t.id} hub={hub} t={t} s={s} phone />
          ))}
        </ScrollView>
        <View style={styles.gapP}>
          <Head title="Upcoming Live Classes" link="See All" onLink={() => router.push('/learn/explore')} small />
        </View>
        <View style={styles.listP}>
          {hub.liveClasses.map((c) => (
            <LiveClassRow key={c.id} hub={hub} c={c} s={s} />
          ))}
        </View>
        <View style={styles.gapP}>
          <Head title="My Enrolled Bootcamps" small />
        </View>
        <View style={styles.listP}>
          {hub.bootcamps.map((b) => (
            <BootcampRow key={b.id} b={b} />
          ))}
        </View>
        <View style={styles.gapP}>
          <Head title="Upcoming This Week" small />
        </View>
        <View style={styles.listP}>
          {hub.thisWeek.map((x) => (
            <WeekRow key={x.id} hub={hub} x={x} s={s} phone />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/** Inventory 24: the learner's live schedule and booking hub: calendar, bootcamps and 15-minute homework rescue. */
export default function LiveScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen title="Live classes">{() => null}</PreviewScreen>;
  return <HubView hub={mock.learner.liveHub} avatar={mock.learner.dashboard.avatar} />;
}

function HubView({ hub, avatar }: { hub: Hub; avatar: number }) {
  const s = useLiveHub(hub);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const sheet = <BookingSheet hub={hub} s={s} />;
  if (!wide)
    return (
      <>
        <Phone hub={hub} s={s} avatar={avatar} />
        {sheet}
      </>
    );
  return (
    <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
      <RefScale width={Math.min(width - 48, MAX_DESK_WIDTH)} refWidth={HUB_REF_WIDTH}>
        <Desktop hub={hub} s={s} />
      </RefScale>
      {sheet}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: HUB_REF_WIDTH, paddingBottom: 16, borderRadius: 12, backgroundColor: '#F4F8FD', overflow: 'hidden' },
  hero: { height: 178, overflow: 'hidden' },
  heroPhoto: { position: 'absolute', left: 574, top: 0, width: 574, height: 175 },
  title: { position: 'absolute', left: 28, top: 28, fontSize: 37, fontWeight: '800', color: INK, letterSpacing: -1 },
  sub: { position: 'absolute', left: 28, top: 76, fontSize: 16.5, color: BODY },
  tabs: { position: 'absolute', left: 26, top: 132, height: 35, flexDirection: 'row', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.85)' },
  tab: { height: 35, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 5 },
  tabOn: { backgroundColor: '#0B6BFF' },
  tabText: { fontSize: 13.5, color: INK },
  nowOuter: { position: 'absolute', left: 868, top: 36, width: 269, height: 95, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.45)' },
  now: { height: 70, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 11, paddingRight: 8, borderRadius: 8, backgroundColor: '#FFFFFF' },
  nowIcon: { width: 32, height: 32 },
  nowTitle: { fontSize: 14.5, fontWeight: '600', color: '#15803D' },
  nowSub: { marginTop: 4, fontSize: 11, color: BODY },
  cols: { flexDirection: 'row', gap: 16, marginTop: 6, paddingHorizontal: 16 },
  left: { width: 656, gap: 14 },
  right: { width: 449 },
  card: { borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEFF6' },
  calendar: { padding: 16, minHeight: 422, zIndex: 2 },
  strip: { marginTop: 12 },
  dayTitle: { marginTop: 22, marginBottom: 6, fontSize: 17, fontWeight: '700', color: INK, letterSpacing: -0.2 },
  listP: { gap: 14 },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 13, color: BODY },
  upcoming: { padding: 16, minHeight: 278 },
  classes: { flexDirection: 'row', gap: 12, marginTop: 16 },
  panel: { paddingVertical: 14, paddingHorizontal: 10 },
  tutors: { flexDirection: 'row', gap: 7, marginTop: 16 },
  carouselBtn: { position: 'absolute', top: 108, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E7F0' },
  carouselNext: { right: -6 },
  carouselPrev: { left: -10 },
  camps: { marginTop: 5 },
  campList: { gap: 18, marginTop: 18 },
  weekPanel: { marginTop: 8 },
  weekList: { gap: 14, marginTop: 14 },
  phoneRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  phone: { gap: 12, padding: 16, paddingBottom: 110 },
  titleP: { fontSize: 20, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  subP: { marginTop: -6, fontSize: 12.5, color: BODY },
  tabsP: { flexDirection: 'row', marginTop: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E1E7F0', overflow: 'hidden' },
  tabP: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center' },
  tabTextP: { fontSize: 12, color: INK },
  gapP: { marginTop: 8 },
  tutorsP: { gap: 10 },
});
