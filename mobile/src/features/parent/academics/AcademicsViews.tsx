import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChildCards, DeskHost, ParentDesk, ParentPhoneTop, ParentTopBar } from '@/features/portal/PortalFrame';
import { Card, CardHead, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, NAVY } from '@/features/portal/tokens';
import type { ParentPortal } from '@/mock/portal';

import {
  FeedbackCard,
  GradesList,
  GradesTable,
  HomeworkList,
  HomeworkTable,
  ReportCardsCard,
  SubjectGrid,
  TeacherNotesCard,
  TermPicker,
} from './AcademicsCards';

const TABS = ['Overview', 'Assignments', 'Grades', 'Report Cards'] as const;
type Tab = (typeof TABS)[number];

/** The tablet reference (no sidebar) is drawn at this width and scaled to the window. */
const TABLET_WIDTH = 1480;

function useTab(): [Tab, (t: string) => void] {
  const [tab, setTab] = useState<Tab>('Overview');
  return [tab, (t: string) => setTab(t as Tab)];
}

/** The page heading: title with its line beside it, and the term picker on the right. */
function Heading({ p, wide }: { p: ParentPortal; wide: boolean }) {
  return (
    <View style={styles.headRow}>
      <View style={[styles.headText, wide && styles.headTextWide]}>
        <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
          Academics
        </Text>
        <Text style={styles.subtitle}>{wide ? 'Track assignments, view grades, and download report cards.' : 'Track assignments, view grades, access feedback, and download report cards.'}</Text>
      </View>
      <TermPicker term={p.term} />
    </View>
  );
}

/** Child Assignments, Grades & Digital Report Cards on the desktop reference (with the Parent sidebar). */
export function AcademicsDesk({ p }: { p: ParentPortal }) {
  const [tab, setTab] = useTab();
  const a = p.academics;
  return (
    <ParentDesk list={p.children} me={p.me} search="Search assignments, grades, or resources..." active="Academics">
      <Heading p={p} wide={false} />
      <UnderTabs items={TABS} active={tab} onChange={setTab} size={16} style={styles.tabs} />
      {tab === 'Overview' ? (
        <>
          <View style={styles.row}>
            <Card style={[styles.col, styles.colSubjects, styles.gap]}>
              <CardHead title="Subject Performance" />
              <SubjectGrid subjects={a.subjects} size="small" />
            </Card>
            <Card style={[styles.col, styles.colAssign, styles.gap]}>
              <CardHead title="Upcoming Assignments" link="View All" onLink={() => setTab('Assignments')} />
              <HomeworkTable items={a.homework} />
            </Card>
            <View style={[styles.col, styles.colNotes]}>
              <TeacherNotesCard notes={a.teacherNotes} layout="phone" />
            </View>
          </View>
          <View style={styles.row}>
            <Card style={[styles.col, styles.colGrades, styles.gap]}>
              <CardHead title="Recent Grades" link="View All" onLink={() => setTab('Grades')} />
              <GradesTable rows={a.grades} feedback />
            </Card>
            <View style={[styles.col, styles.colFeedback]}>
              <FeedbackCard f={a.feedback} title="Annotated Feedback" layout="stack" primary />
            </View>
            <View style={[styles.col, styles.colReports]}>
              <ReportCardsCard a={a} title="Report Cards" compact={false} phone />
            </View>
          </View>
        </>
      ) : (
        <FocusedTab tab={tab} a={a} />
      )}
    </ParentDesk>
  );
}

/** One tab on its own (Assignments, Grades or Report Cards), full width. */
function FocusedTab({ tab, a }: { tab: Tab; a: ParentPortal['academics'] }) {
  if (tab === 'Assignments') {
    return (
      <Card style={[styles.gap, styles.focus]}>
        <CardHead title="Upcoming Assignments" subtitle="Homework and tasks set for this term, soonest first." />
        <HomeworkTable items={a.homework} />
      </Card>
    );
  }
  if (tab === 'Grades') {
    return (
      <View style={styles.row}>
        <Card style={[styles.col, styles.colGrades, styles.gap]}>
          <CardHead title="Recent Grades" subtitle="Released marks, newest first." />
          <GradesTable rows={a.grades} feedback />
        </Card>
        <View style={[styles.col, styles.colFeedback]}>
          <FeedbackCard f={a.feedback} title="Annotated Feedback" layout="stack" />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.focusNarrow}>
      <ReportCardsCard a={a} title="Term Report Cards" compact={false} />
    </View>
  );
}

/** The tablet reference: the same page without the sidebar, in three columns. */
export function AcademicsTablet({ p }: { p: ParentPortal }) {
  const [tab, setTab] = useTab();
  const a = p.academics;
  return (
    <DeskHost minWidth={TABLET_WIDTH}>
      <ParentTopBar list={p.children} me={p.me} />
      <View style={styles.tabletMain}>
        <Heading p={p} wide />
        <UnderTabs items={TABS} active={tab} onChange={setTab} size={18} style={styles.tabs} />
        {tab === 'Overview' ? (
          <View style={styles.row}>
            <View style={[styles.col, styles.tCol1]}>
              <Card style={styles.gap}>
                <CardHead title="Academic Overview" size={20} />
                <SubjectGrid subjects={a.subjects} />
              </Card>
              <Card style={styles.gap}>
                <CardHead title="Recent Grades" size={20} link="View All" onLink={() => setTab('Grades')} />
                <GradesTable rows={a.grades} />
              </Card>
            </View>
            <View style={[styles.col, styles.tCol2]}>
              <Card style={styles.gap}>
                <CardHead title="Upcoming Assignments" size={20} link="View All" onLink={() => setTab('Assignments')} />
                <HomeworkList items={a.homework} />
              </Card>
              <FeedbackCard f={a.feedback} title="Latest Feedback" layout="stack" />
            </View>
            <View style={[styles.col, styles.tCol3]}>
              <TeacherNotesCard notes={a.teacherNotes} layout="stack" />
              <ReportCardsCard a={a} title="Term Report Cards" compact={false} />
            </View>
          </View>
        ) : (
          <FocusedTab tab={tab} a={a} />
        )}
      </View>
    </DeskHost>
  );
}

function SectionHead({ title, onAll }: { title: string; onAll?: () => void }) {
  return (
    <View style={styles.phoneHead}>
      <Text style={styles.phoneSection} accessibilityRole="header">
        {title}
      </Text>
      {onAll ? (
        <Pressable onPress={onAll} accessibilityRole="link" accessibilityLabel={`View all ${title}`} hitSlop={8}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** The phone reference: child cards, tabs, upcoming homework and recent grades, then feedback and report cards. */
export function AcademicsPhone({ p }: { p: ParentPortal }) {
  const [tab, setTab] = useTab();
  const a = p.academics;
  const show = (t: Tab) => tab === 'Overview' || tab === t;
  return (
    <View style={styles.phoneRoot}>
      <ParentPhoneTop me={p.me} />
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        <Text style={styles.phoneTitle} accessibilityRole="header">
          Academics
        </Text>
        <ChildCards list={p.children} />
        <UnderTabs items={TABS} active={tab} onChange={setTab} size={14.5} spread style={styles.phoneTabs} />
        <View style={styles.phoneBody}>
          {show('Assignments') ? (
            <View style={styles.phoneSectionWrap}>
              <SectionHead title="Upcoming Homework" onAll={tab === 'Overview' ? () => setTab('Assignments') : undefined} />
              <HomeworkList items={a.homework} size="phone" />
            </View>
          ) : null}
          {show('Grades') ? (
            <View style={styles.phoneSectionWrap}>
              <SectionHead title="Recent Grades" onAll={tab === 'Overview' ? () => setTab('Grades') : undefined} />
              <GradesList rows={a.grades} />
            </View>
          ) : null}
          {tab === 'Overview' ? <TeacherNotesCard notes={a.teacherNotes} layout="phone" /> : null}
          {show('Grades') ? <FeedbackCard f={a.feedback} title="Latest Feedback" layout="phone" /> : null}
          {show('Report Cards') ? <ReportCardsCard a={a} title="Term Report Cards" compact={false} phone /> : null}
          {tab === 'Overview' ? (
            <Pressable onPress={() => router.push('/messages')} accessibilityRole="link" accessibilityLabel="Message a teacher">
              <Text style={styles.footLink}>Questions about a grade? Message the teacher</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  headText: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' },
  headTextWide: { gap: 32 },
  title: { fontSize: 32, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  titleWide: { fontSize: 40 },
  subtitle: { fontSize: 16, color: BODY },
  tabs: { marginTop: 6, marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 20, marginBottom: 20 },
  col: { minWidth: 0, gap: 20 },
  gap: { gap: 16 },
  colSubjects: { flex: 1.25 },
  colAssign: { flex: 1.55 },
  colNotes: { flex: 1.15 },
  colGrades: { flex: 1.85 },
  colFeedback: { flex: 1.4 },
  colReports: { flex: 1.05 },
  focus: { maxWidth: 1000 },
  focusNarrow: { maxWidth: 640 },
  tabletMain: { paddingHorizontal: 36, paddingTop: 30, paddingBottom: 40 },
  tCol1: { flex: 1.5 },
  tCol2: { flex: 1 },
  tCol3: { flex: 1.05 },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneScroll: { paddingBottom: 40 },
  phoneTitle: { marginTop: 6, marginBottom: 12, paddingHorizontal: 20, fontSize: 28, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  phoneTabs: { marginTop: 14, marginHorizontal: 20 },
  phoneBody: { gap: 22, paddingHorizontal: 20, paddingTop: 22 },
  phoneSectionWrap: { gap: 14 },
  phoneHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phoneSection: { fontSize: 21, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  viewAll: { fontSize: 15.5, fontWeight: '500', color: BLUE },
  footLink: { textAlign: 'center', fontSize: 15, fontWeight: '600', color: BLUE },
});
