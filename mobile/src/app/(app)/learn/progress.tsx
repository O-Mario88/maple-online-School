import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { Achievements, Activity, BySubject, Goals, GreatProgress, Milestone, NodeDialog, OverallCard, SideMenu, SideView, SubjectTabs } from '@/features/learner/progress/ProgressParts';
import { Legend, PhoneTree, SkillTreeCard, TREE_CARD } from '@/features/learner/progress/SkillTree';
import { type PhoneTab, type Progress, type ProgressState, useProgress } from '@/features/learner/progress/useProgress';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The progress reference's desktop panel (x 18–1168 of 1536), laid out in its pixels. */
const PROGRESS_REF_WIDTH = 1150;
const MAX_DESK_WIDTH = 1400;
const NAVY = '#16213E';
const BODY = '#3F4A63';
const BLUE = '#1463F3';

function Desktop({ p, s, onExpand }: { p: Progress; s: ProgressState; onExpand: () => void }) {
  const showTree = s.view === 'overview' || s.view === 'tree';
  return (
    <View style={styles.canvas}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={styles.title} accessibilityRole="header">
            My Learning Progress
          </Text>
          <Text style={styles.sub}>Track your mastery, explore new skills, and see your growth across all subjects.</Text>
        </View>
        <View style={styles.great}>
          <GreatProgress p={p} s={s} />
        </View>
      </View>
      <SubjectTabs s={s} />
      <View style={styles.body}>
        <View style={styles.left}>
          <SideMenu s={s} />
          <View style={styles.gap20}>
            <Milestone p={p} s={s} />
          </View>
          <Achievements p={p} s={s} />
        </View>
        <View style={styles.centre}>{showTree ? <SkillTreeCard s={s} onExpand={onExpand} /> : <SideView p={p} s={s} />}</View>
        <View style={styles.right}>
          <OverallCard p={p} s={s} />
          <BySubject s={s} />
          <Activity p={p} s={s} />
          <Goals p={p} s={s} />
        </View>
      </View>
    </View>
  );
}

const PHONE_TABS: readonly { key: PhoneTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'tree', label: 'Skill Tree' },
  { key: 'analytics', label: 'Analytics' },
];

function SubjectPicker({ s }: { s: ProgressState }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.pickerWrap}>
      <Pressable style={styles.picker} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`Subject: ${s.subject.name}`}>
        <Image source={s.subject.icon} style={styles.pickerIcon} contentFit="contain" />
        <Text style={styles.pickerText}>{s.subject.name}</Text>
        <Icon name="chevronDown" size={14} color={NAVY} />
      </Pressable>
      {open ? (
        <View style={styles.pickerMenu}>
          {s.subjects.map((x, i) => (
            <Pressable
              key={x.name}
              style={styles.pickerItem}
              onPress={() => {
                s.setSubject(i);
                setOpen(false);
              }}
              accessibilityRole="menuitem">
              <Image source={x.icon} style={styles.pickerIcon} contentFit="contain" />
              <Text style={[styles.pickerText, i === s.subjectIndex && styles.blue]}>{`${x.name}  •  ${x.done}/${x.total}`}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Phone({ p, s, avatar }: { p: Progress; s: ProgressState; avatar: number }) {
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={styles.phone}>
        <Text style={styles.titleP} accessibilityRole="header">
          My Learning Progress
        </Text>
        <View style={styles.tabsP} accessibilityRole="tablist">
          {PHONE_TABS.map((t) => {
            const on = s.phoneTab === t.key;
            return (
              <Pressable key={t.key} style={[styles.tabP, on && styles.tabPOn]} onPress={() => s.setPhoneTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.tabPText, on && styles.blue]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {s.phoneTab === 'tree' ? (
          <>
            <SubjectPicker s={s} />
            <PhoneTree s={s} />
            <View style={styles.legendP}>
              <Legend inline />
            </View>
          </>
        ) : s.phoneTab === 'overview' ? (
          <>
            <GreatProgress p={p} s={s} phone />
            <OverallCard p={p} s={s} />
            <Milestone p={p} s={s} />
            <Achievements p={p} s={s} />
          </>
        ) : (
          <>
            <BySubject s={s} />
            <Activity p={p} s={s} />
            <Goals p={p} s={s} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ProgressView({ p, avatar }: { p: Progress; avatar: number }) {
  const s = useProgress(p);
  const { wide } = useShell();
  const { width, height } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const dialog = <NodeDialog s={s} />;
  if (!wide)
    return (
      <>
        <Phone p={p} s={s} avatar={avatar} />
        {dialog}
      </>
    );
  const fit = Math.min(width - 80, ((height - 60) * TREE_CARD.w) / TREE_CARD.h);
  return (
    <>
      <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
        <RefScale width={Math.min(width - 32, MAX_DESK_WIDTH)} refWidth={PROGRESS_REF_WIDTH}>
          <Desktop p={p} s={s} onExpand={() => setExpanded(true)} />
        </RefScale>
      </ScrollView>
      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <Pressable style={styles.scrim} onPress={() => setExpanded(false)} accessibilityRole="button" accessibilityLabel="Close the expanded skill tree">
          <Pressable onPress={() => undefined} accessibilityRole="none">
            <RefScale width={fit} refWidth={TREE_CARD.w}>
              <SkillTreeCard s={s} />
            </RefScale>
          </Pressable>
        </Pressable>
      </Modal>
      {dialog}
    </>
  );
}

/** My Learning Progress: the subject skill tree, milestones, analytics and goals. */
export default function ProgressScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen title="My progress">{() => null}</PreviewScreen>;
  return <ProgressView p={mock.learner.progressMap} avatar={mock.learner.dashboard.avatar} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  blue: { color: BLUE, fontWeight: '600' },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: PROGRESS_REF_WIDTH, gap: 13, paddingHorizontal: 12, paddingTop: 18, paddingBottom: 14, borderRadius: 12, backgroundColor: '#F4F7FC' },
  head: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { marginLeft: 10, fontSize: 37, fontWeight: '800', color: NAVY, letterSpacing: -0.9 },
  sub: { marginTop: 6, marginLeft: 10, fontSize: 16, color: BODY },
  great: { width: 458, height: 70 },
  body: { flexDirection: 'row', gap: 13 },
  left: { width: 212, gap: 12 },
  gap20: { marginTop: 10 },
  centre: { width: TREE_CARD.w },
  right: { flex: 1, gap: 8 },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,12,20,0.55)' },
  phoneRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  phone: { gap: 14, padding: 16, paddingBottom: 110 },
  titleP: { fontSize: 22, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  tabsP: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E6ECF5' },
  tabP: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabPOn: { borderBottomColor: '#0B6BFF' },
  tabPText: { fontSize: 13, color: NAVY },
  pickerWrap: { zIndex: 5 },
  picker: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0' },
  pickerIcon: { width: 24, height: 24 },
  pickerText: { flex: 1, fontSize: 13, fontWeight: '500', color: NAVY },
  pickerMenu: { marginTop: 4, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  pickerItem: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10 },
  legendP: { alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
});
