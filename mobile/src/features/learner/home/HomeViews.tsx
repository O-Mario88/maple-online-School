import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { greeting } from '@/lib/home';

import { CardHead, Hero, MyLearning, MyLibrary, MyProgress, MyProjects, QuickActions, ResultRow, UpcomingLive, UpcomingTutoring } from './HomeCards';
import { BLUE, BODY, type Home, HomeHeader, HomeSidebar, INK } from './HomeFrame';
import { MyGoals, MyRewards, MyTasks, Schedule } from './HomeSide';

/** The learner home reference's desktop (x 0–1252 at 1536 wide, sidebar included); laid out in its pixels. */
export const HOME_REF_WIDTH = 1252;
const PHONE_QUICK = 4;

function Card({ style, children }: { style: object; children: ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function HomeDesk({ h, now }: { h: Home; now: Date }) {
  return (
    <View style={styles.canvas}>
      <HomeSidebar h={h} />
      <HomeHeader h={h} />
      <View style={styles.heroPos}>
        <Hero h={h} greeting={greeting(now)} />
      </View>
      <View style={styles.quickPos}>
        <QuickActions h={h} />
      </View>
      <Card style={styles.learning}>
        <MyLearning h={h} />
      </Card>
      <Card style={styles.live}>
        <UpcomingLive h={h} />
      </Card>
      <Card style={styles.tutoring}>
        <UpcomingTutoring h={h} />
      </Card>
      <Card style={styles.progress}>
        <CardHead icon="chart" color="#22A35A" title="My Progress" link="View Detailed Progress" onLink={() => router.push('/learn/progress')} />
        <MyProgress h={h} />
      </Card>
      <Card style={styles.results}>
        <CardHead icon="check" color={INK} title="Latest Results" link="View All" onLink={() => router.push('/learn/passport')} />
        <View style={styles.resultList}>
          {h.results.map((r) => (
            <ResultRow key={r.title} r={r} />
          ))}
        </View>
      </Card>
      <Card style={styles.library}>
        <MyLibrary h={h} />
      </Card>
      <Card style={styles.projects}>
        <MyProjects h={h} />
      </Card>
      <Card style={styles.schedule}>
        <Schedule h={h} />
      </Card>
      <Card style={styles.tasks}>
        <MyTasks h={h} />
      </Card>
      <Card style={styles.goals}>
        <MyGoals h={h} />
      </Card>
      <Card style={styles.rewards}>
        <MyRewards h={h} />
      </Card>
    </View>
  );
}

function PhoneHero({ h, now }: { h: Home; now: Date }) {
  const x = h.hero;
  return (
    <View style={styles.heroP}>
      <View style={styles.heroImageP}>
        <Image source={x.image} style={[styles.fill, styles.mirror]} contentFit="cover" contentPosition="left" accessibilityLabel="A smiling girl resting her chin on her hand" />
        <LinearGradient colors={['#DCE9F7', 'rgba(220,233,247,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroFadeP} />
      </View>
      <Text style={styles.helloP}>{`${greeting(now)},`}</Text>
      <Text style={styles.nameP}>{h.name}</Text>
      <Text style={styles.subP}>{x.phoneSub}</Text>
      <View style={styles.levelP}>
        <Image source={x.crown} style={styles.crownP} />
        <View style={styles.flex}>
          <View style={styles.levelRowP}>
            <Text style={styles.levelTextP}>{`Level ${x.level}`}</Text>
            <Text style={styles.xpP}>{`${x.xp} / ${x.xpNext} XP`}</Text>
          </View>
          <Bar value={x.xp / x.xpNext} color={BLUE} track="#E1E9F6" height={5} />
        </View>
        <Image source={x.fire} style={styles.fireP} />
        <Text style={styles.streakP}>{x.streak}</Text>
      </View>
    </View>
  );
}

export function HomePhone({ h, now }: { h: Home; now: Date }) {
  const course = h.learning['In Progress'][0];
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={h.avatar} />
      <ScrollView contentContainerStyle={styles.phone}>
        <PhoneHero h={h} now={now} />
        <View style={styles.quickP}>
          {h.quick.slice(0, PHONE_QUICK).map((q) => (
            <Pressable key={q.label} style={styles.quickItemP} onPress={() => router.push(q.href)} accessibilityRole="link" accessibilityLabel={q.label}>
              <Image source={q.icon} style={styles.quickIconP} />
              <Text style={styles.quickTextP}>{q.short}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.cardP}>
          <Schedule h={h} phone limit={3} />
        </View>
        <View style={styles.cardP}>
          <MyTasks h={h} phone />
        </View>
        <View style={styles.cardP}>
          <CardHead icon="book" color={INK} title="Continue Learning" link="See All" onLink={() => router.push('/learn/explore')} />
          <Pressable style={styles.continueP} onPress={() => router.push('/learn/course')} accessibilityRole="button" accessibilityLabel={`Continue ${course.subject}: ${course.topic}`}>
            <Image source={course.thumb} style={styles.continueThumb} contentFit="cover" />
            <View style={styles.flex}>
              <Text style={styles.continueTitle}>{course.subject}</Text>
              <Text style={styles.continueSub}>{course.topic}</Text>
              <View style={styles.continueBar}>
                <View style={styles.flex}>
                  <Bar value={course.progress} color={BLUE} track="#E1E9F6" height={6} />
                </View>
                <Text style={styles.continuePct}>{`${Math.round(course.progress * 100)}%`}</Text>
              </View>
            </View>
            <View style={styles.continuePlay}>
              <Icon name="playFill" size={12} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
        <View style={styles.cardP}>
          <CardHead icon="chart" color={INK} title="My Progress" link="See All" onLink={() => router.push('/learn/progress')} />
          <MyProgress h={h} phone />
        </View>
        <View style={styles.cardP}>
          <CardHead icon="check" color={INK} title="Latest Result" link="See All" onLink={() => router.push('/learn/passport')} />
          <ResultRow r={h.results[0]} phone />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  mirror: { transform: [{ scaleX: -1 }] },
  canvas: { width: HOME_REF_WIDTH, height: 1024, backgroundColor: '#EEF3FA' },
  card: { position: 'absolute', padding: 13, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EDF4' },
  heroPos: { position: 'absolute', left: 200, top: 60, width: 775 },
  quickPos: { position: 'absolute', left: 200, top: 240, width: 775 },
  learning: { left: 200, top: 322, width: 760, height: 223 },
  live: { left: 200, top: 562, width: 370, height: 122, paddingHorizontal: 12 },
  tutoring: { left: 580, top: 562, width: 370, height: 122, paddingHorizontal: 12 },
  progress: { left: 200, top: 697, width: 370, height: 163 },
  results: { left: 580, top: 697, width: 370, height: 163 },
  resultList: { marginTop: 10 },
  library: { left: 200, top: 872, width: 430, height: 143 },
  projects: { left: 640, top: 872, width: 310, height: 143 },
  schedule: { left: 987, top: 62, width: 251, height: 250 },
  tasks: { left: 965, top: 322, width: 273, height: 296 },
  goals: { left: 965, top: 628, width: 273, height: 172 },
  rewards: { left: 965, top: 810, width: 273, height: 160 },
  phoneRoot: { flex: 1, backgroundColor: '#F4F7FB' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  heroP: { height: 150, padding: 12, borderRadius: 12, backgroundColor: '#DCE9F7', overflow: 'hidden' },
  heroImageP: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%' },
  heroFadeP: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%' },
  helloP: { fontSize: 11, fontWeight: '500', color: INK },
  nameP: { fontSize: 18, fontWeight: '800', color: INK },
  subP: { marginTop: 2, fontSize: 11, color: '#3D4656' },
  levelP: { position: 'absolute', left: 10, right: 10, bottom: 10, height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#FFFFFF' },
  crownP: { width: 18, height: 18 },
  levelRowP: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  levelTextP: { fontSize: 11, fontWeight: '700', color: INK },
  xpP: { fontSize: 9, color: BODY },
  fireP: { width: 16, height: 18, marginLeft: 4 },
  streakP: { fontSize: 14, fontWeight: '800', color: INK },
  quickP: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  quickItemP: { alignItems: 'center', gap: 4 },
  quickIconP: { width: 40, height: 40 },
  quickTextP: { fontSize: 10, color: INK },
  cardP: { padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EDF4' },
  continueP: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  continueThumb: { width: 62, height: 56, borderRadius: 6 },
  continueTitle: { fontSize: 12, fontWeight: '600', color: INK },
  continueSub: { marginTop: 2, fontSize: 10.5, color: BODY },
  continueBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  continuePct: { fontSize: 10, color: INK },
  continuePlay: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: BLUE },
});
