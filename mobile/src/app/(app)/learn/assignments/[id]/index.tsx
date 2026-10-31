import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { ScannerCard, ScannerPanel, VivaCard, VivaPanel } from '@/features/learner/work/Capture';
import { BLUE, BODY, INK } from '@/features/learner/work/MathText';
import { WorkEditor } from '@/features/learner/work/WorkEditor';
import { ChecklistCard, Crumbs, DetailsCard, DueChip, FilesCard, InstructionsCard, ProgressCard, ResourcesCard, SubmitButton } from '@/features/learner/work/WorkSide';
import { LiveWork } from '@/features/learner/work/LiveWork';
import { useWork, type Work, type WorkState } from '@/features/learner/work/useWork';
import { RefScale } from '@/features/public/home/RefScale';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';

/** The workspace reference's page (x 18–1176 at 1536 wide); the desktop layout uses its pixels. */
const WORK_REF_WIDTH = 1158;
const MAX_DESK_WIDTH = 1400;
type Top = 'Instructions' | 'My Work' | 'Submit' | 'Feedback';
const TOP_TABS: readonly { key: Top; icon?: IconName }[] = [{ key: 'Instructions' }, { key: 'My Work', icon: 'notes' }, { key: 'Submit', icon: 'edit' }, { key: 'Feedback', icon: 'star' }];

const openFeedback = (id: string) => router.push({ pathname: '/learn/assignments/[id]/feedback', params: { id } });

function TopTabs({ w, s, on, setOn, phone = false }: { w: Work; s: WorkState; on: Top; setOn: (t: Top) => void; phone?: boolean }) {
  const tabs = phone ? TOP_TABS.slice(0, 3) : TOP_TABS;
  return (
    <View style={phone ? styles.tabsP : styles.tabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const active = on === t.key;
        const press = () => {
          if (t.key === 'Feedback') openFeedback(w.id);
          else if (t.key === 'Submit' && !phone) s.submit();
          else setOn(t.key);
        };
        return (
          <Pressable key={t.key} style={[styles.tab, phone && styles.tabP]} onPress={press} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            {t.icon && !phone ? <Icon name={t.icon} size={15} color={active ? BLUE : INK} /> : null}
            <Text style={[styles.tabText, phone && styles.tabTextP, active && styles.tabOn]}>{t.key}</Text>
            {active ? <View style={styles.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function Desktop({ w, s }: { w: Work; s: WorkState }) {
  const [on, setOn] = useState<Top>('Instructions');
  return (
    <View style={styles.canvas}>
      <View style={styles.crumbsPos}>
        <Crumbs items={w.crumbs} />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          {w.title}
        </Text>
        <DueChip text={w.due} />
        <Text style={styles.kind}>{w.kind}</Text>
      </View>
      <Text style={styles.sub}>{w.sub}</Text>
      <View style={styles.progressPos}>
        <ProgressCard s={s} />
      </View>
      <View style={styles.tabsPos}>
        <TopTabs w={w} s={s} on={on} setOn={setOn} />
      </View>

      <View style={[styles.col, styles.colLeft]}>
        <View style={[styles.card, styles.instructions]}>
          <InstructionsCard w={w} />
        </View>
        <View style={styles.card}>
          <ResourcesCard w={w} s={s} />
        </View>
      </View>
      <View style={[styles.col, styles.colMid]}>
        <View style={[styles.card, styles.work]}>
          <WorkEditor w={w} s={s} scanner={<ScannerCard s={s} />} viva={<VivaCard w={w} s={s} />} />
        </View>
        <View style={styles.pair}>
          <View style={[styles.card, styles.scan]}>
            <ScannerCard s={s} />
          </View>
          <View style={[styles.card, styles.viva]}>
            <VivaCard w={w} s={s} />
          </View>
        </View>
      </View>
      <View style={[styles.col, styles.colRight]}>
        <View style={styles.card}>
          <ChecklistCard s={s} />
        </View>
        <View style={styles.card}>
          <FilesCard w={w} s={s} />
        </View>
        <View style={styles.card}>
          <DetailsCard w={w} s={s} />
        </View>
      </View>
    </View>
  );
}

function Phone({ w, s, avatar }: { w: Work; s: WorkState; avatar: number }) {
  const [on, setOn] = useState<Top>('My Work');
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} globe />
      <ScrollView contentContainerStyle={styles.phone}>
        <Crumbs items={w.phoneCrumbs} phone />
        <Text style={styles.titleP} accessibilityRole="header">
          {w.title}
        </Text>
        <DueChip text={w.due} phone />
        <TopTabs w={w} s={s} on={on} setOn={setOn} phone />
        {on === 'Instructions' ? (
          <>
            <View style={styles.cardP}>
              <InstructionsCard w={w} />
            </View>
            <View style={styles.cardP}>
              <ResourcesCard w={w} s={s} />
            </View>
          </>
        ) : null}
        {on === 'My Work' ? (
          <>
            <ScannerPanel s={s} />
            <VivaPanel w={w} s={s} />
            <View style={styles.cardP}>
              <WorkEditor w={w} s={s} phone scanner={<Text style={styles.hint}>Your scanned pages are in the Camera Scanner above.</Text>} viva={<Text style={styles.hint}>Your viva is in the recorder above.</Text>} />
            </View>
          </>
        ) : null}
        {on === 'Submit' ? (
          <>
            <ProgressCard s={s} />
            <View style={styles.cardP}>
              <ChecklistCard s={s} />
            </View>
            <View style={styles.cardP}>
              <FilesCard w={w} s={s} />
            </View>
            <View style={styles.cardP}>
              <DetailsCard w={w} s={s} />
            </View>
          </>
        ) : (
          <SubmitButton s={s} phone />
        )}
      </ScrollView>
    </View>
  );
}

function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
      <Text style={styles.toastText}>{text}</Text>
    </View>
  );
}

/** Inventory 27: the assignment workspace: maths editor, code and files, camera scanner and 60-second viva. */
export default function AssignmentWorkScreen() {
  const mock = useMemo(() => mockData(), []);
  const { id } = useLocalSearchParams<{ id: string }>();
  // Real builds work on the API's assignment; design builds keep the reference's sample.
  if (!mock) return <LiveWork id={Number(id)} />;
  return <WorkView w={mock.learner.assignmentWork} avatar={mock.learner.dashboard.avatar} />;
}

function WorkView({ w, avatar }: { w: Work; avatar: number }) {
  const s = useWork(w);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  return (
    <View style={styles.flex}>
      {wide ? (
        <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
          <RefScale width={Math.min(width - 48, MAX_DESK_WIDTH)} refWidth={WORK_REF_WIDTH}>
            <Desktop w={w} s={s} />
          </RefScale>
        </ScrollView>
      ) : (
        <Phone w={w} s={s} avatar={avatar} />
      )}
      <Toast text={s.toastText} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: WORK_REF_WIDTH, minHeight: 1030, borderRadius: 12, backgroundColor: '#F4F8FD' },
  kind: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 5, backgroundColor: '#E6EEFC', fontSize: 12.5, fontWeight: '600', color: '#1450C8', overflow: 'hidden' },
  crumbsPos: { position: 'absolute', left: 18, top: 14 },
  titleRow: { position: 'absolute', left: 18, top: 40, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 25, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  sub: { position: 'absolute', left: 18, top: 77, width: 694, fontSize: 12, color: BODY },
  progressPos: { position: 'absolute', left: 715, top: 26, width: 433 },
  tabsPos: { position: 'absolute', left: 14, top: 104 },
  tabs: { height: 40, flexDirection: 'row', borderRadius: 6, backgroundColor: '#FFFFFF' },
  tabsP: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E3E8F0' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  tabP: { flex: 1, height: 38, justifyContent: 'center', paddingHorizontal: 0 },
  tabText: { fontSize: 13, color: INK },
  tabTextP: { fontSize: 12 },
  tabOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 4, right: 4, bottom: 0, height: 2.5, backgroundColor: BLUE },
  col: { position: 'absolute', top: 151, gap: 9 },
  colLeft: { left: 16, width: 338 },
  colMid: { left: 368, width: 554, gap: 10 },
  colRight: { left: 930, width: 218, gap: 9 },
  card: { padding: 12, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEFF6' },
  instructions: { minHeight: 570 },
  work: { padding: 16 },
  pair: { flexDirection: 'row', gap: 8 },
  scan: { width: 277 },
  viva: { width: 269 },
  phoneRoot: { flex: 1, backgroundColor: '#F7F9FC' },
  phone: { gap: 12, padding: 16, paddingBottom: 110 },
  titleP: { fontSize: 21, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  cardP: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E6EBF2', backgroundColor: '#FFFFFF' },
  hint: { fontSize: 12.5, color: BODY },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toastText: { maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.92)', fontSize: 13, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
});
