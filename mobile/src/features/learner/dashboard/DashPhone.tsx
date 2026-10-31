import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { useSwitcher } from '@/lib/switcher-context';

import { AssignmentRow, type Dash, LiveBadge, LiveRow, panel, ResumeCard, SectionHead } from './DashParts';

const INK = '#0B1424';
const BODY = '#4A5263';
const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The learner's phone top bar: logo, optional language globe, notifications and the avatar that opens the mode switcher. */
export function LearnerPhoneTop({ avatar, globe = false }: { avatar: number; globe?: boolean }) {
  const switcher = useSwitcher();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.top, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <View style={styles.logo}>
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </View>
      <View style={styles.topRight}>
        {globe ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Language: English" hitSlop={8}>
            <Icon name="globe" size={22} color={INK} />
          </Pressable>
        ) : null}
        <Pressable onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8}>
          <Icon name="bell" size={22} color={INK} />
          <View style={styles.redDot} />
        </Pressable>
        <Pressable onPress={switcher?.open} accessibilityRole="button" accessibilityLabel="Switch mode">
          <Image source={avatar} style={styles.avatar} />
        </Pressable>
      </View>
    </View>
  );
}

/** The learner home on phones, as the reference's phone screen draws it. */
export function DashPhone({ d }: { d: Dash }) {
  const [streak, tasks, goal] = d.stats;
  return (
    <View style={styles.root}>
      <LearnerPhoneTop avatar={d.avatar} />
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.hello} accessibilityRole="header">{`Good morning, ${d.name}! 👋`}</Text>
        <Text style={styles.sub}>Let’s keep learning and growing.</Text>

        <View style={styles.statWide}>
          <Image source={streak.icon} style={styles.statIcon} />
          <View style={styles.flex}>
            <Text style={styles.statValue}>{streak.value}</Text>
            <Text style={styles.statLabel}>{streak.label}</Text>
          </View>
          <Text style={styles.keep}>{streak.phoneNote}</Text>
        </View>
        <View style={styles.statPair}>
          {[tasks, goal].map((s) => (
            <View key={s.label} style={styles.statHalf}>
              <Image source={s.icon} style={styles.statIcon} />
              <View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <ResumeCard d={d} phone />

        <View style={styles.subjects}>
          {d.subjects.slice(0, 3).map((s) => (
            <Pressable key={s.name} style={styles.subject} accessibilityRole="link" accessibilityLabel={s.name}>
              <Image source={s.icon} style={styles.subjectIcon} />
              <Text style={styles.subjectName}>{s.short}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.subject} accessibilityRole="button" accessibilityLabel="More subjects">
            <View style={[styles.subjectIcon, styles.moreIcon]}>
              <Icon name="more" size={22} color={INK} />
            </View>
            <Text style={styles.subjectName}>More</Text>
          </Pressable>
        </View>

        <SectionHead title="Upcoming Live Class" link="View All" small />
        <View style={styles.liveCard}>
          <LiveBadge text="LIVE SOON" />
          <View style={styles.liveRow}>
            <LiveRow d={d} phone />
          </View>
        </View>

        <SectionHead title="Urgent Assignments" link="View All" count={d.urgent.length} small />
        <View>
          {d.urgent.map((a) => (
            <AssignmentRow key={a.title} a={a} phone />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#F5F8FD' },
  top: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaf: { width: 32, height: 32 },
  name: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: INK },
  tag: { fontSize: 7.5, color: INK },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  redDot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5484D' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  page: { gap: 12, padding: 16, paddingBottom: 110 },
  hello: { fontSize: 20, fontWeight: '700', color: INK },
  sub: { marginTop: -8, fontSize: 13, color: BODY },
  statWide: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, ...panel, borderRadius: 10 },
  statPair: { flexDirection: 'row', gap: 10 },
  statHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, ...panel, borderRadius: 10 },
  statIcon: { width: 36, height: 36 },
  statValue: { fontSize: 17, fontWeight: '700', color: INK },
  statLabel: { fontSize: 11, color: BODY },
  keep: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#EEF4FF', fontSize: 11.5, fontWeight: '600', color: INK, overflow: 'hidden' },
  subjects: { flexDirection: 'row', justifyContent: 'space-between' },
  subject: { alignItems: 'center', gap: 6 },
  subjectIcon: { width: 54, height: 54, borderRadius: 12 },
  moreIcon: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EAF1' },
  subjectName: { fontSize: 11, color: INK },
  liveCard: { padding: 12, borderRadius: 10, backgroundColor: '#E9F1FE' },
  liveRow: { marginTop: 8 },
});
