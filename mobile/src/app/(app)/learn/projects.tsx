import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { type Home, HomeHeader, HomeSidebar } from '@/features/learner/home/HomeFrame';
import { ProjectAssessment } from '@/features/learner/projects/ProjectAssessment';
import { ProjectDetail } from '@/features/learner/projects/ProjectDetail';
import { ProjectList, StatCards } from '@/features/learner/projects/ProjectList';
import { type Page, type ProjectsState, useProjects } from '@/features/learner/projects/useProjects';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The Projects reference is a full 1536-wide page, sidebar included; the desktop layout uses its pixels. */
const PROJ_REF_WIDTH = 1536;
const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const QUOTE = '“Big ideas\ntoday, a brighter\nUganda tomorrow.”';

function SubjectMenu({ page, s }: { page: Page; s: ProjectsState }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.subjectWrap}>
      <Pressable style={styles.subject} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={styles.subjectText}>{s.subject ?? 'All Subjects'}</Text>
        <Icon name="chevronDown" size={13} color={INK} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {[undefined, ...page.subjects].map((x) => (
            <Pressable
              key={x ?? 'all'}
              style={styles.menuItem}
              onPress={() => {
                s.setSubject(x);
                setOpen(false);
              }}
              accessibilityRole="menuitem">
              <Text style={[styles.menuText, x === s.subject && styles.menuOn]}>{x ?? 'All Subjects'}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** A learner proposes their own project idea; it waits for the teacher's approval. */
function NewProject({ page, s, open, onClose }: { page: Page; s: ProjectsState; open: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(page.subjects[0]);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.scrim, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Propose a new project</Text>
          <Text style={styles.sheetSub}>Your teacher approves it and links it to the right NCDC competencies.</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Project title, e.g. Clean Water for Our Village" placeholderTextColor="#6B7385" accessibilityLabel="Project title" />
          <View style={styles.chips}>
            {page.subjects.map((x) => (
              <Pressable key={x} style={[styles.chip, x === subject && styles.chipOn]} onPress={() => setSubject(x)} accessibilityRole="radio" accessibilityState={{ checked: x === subject }}>
                <Text style={[styles.chipText, x === subject && styles.white]}>{x}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.sheetBtns}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose} accessibilityRole="button">
              <Text style={[styles.btnText, { color: BLUE }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, !title.trim() && styles.off]}
              disabled={!title.trim()}
              onPress={() => {
                s.propose(title.trim(), subject);
                setTitle('');
                onClose();
              }}
              accessibilityRole="button">
              <Text style={styles.btnText}>Send to teacher</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Desktop({ page, h, s, onNew }: { page: Page; h: Home; s: ProjectsState; onNew: () => void }) {
  return (
    <View style={styles.canvas}>
      <HomeSidebar h={h} active="Projects" quote={QUOTE} />
      <HomeHeader h={h} placeholder="Search projects, subjects, or skills..." />
      <Image source={page.pageIcon} style={styles.pageIcon} />
      <View style={styles.titleBlock}>
        <View style={styles.crumbs}>
          <Text style={styles.crumbLink}>Home</Text>
          <Icon name="chevronRight" size={11} color={BODY} />
          <Text style={styles.crumbOn}>Projects</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Projects
        </Text>
        <Text style={styles.sub}>Explore, create, and submit projects that build real-world skills and NCDC competencies.</Text>
      </View>
      <View style={styles.subjectPos}>
        <SubjectMenu page={page} s={s} />
      </View>
      <Pressable style={styles.newBtn} onPress={onNew} accessibilityRole="button">
        <Icon name="plus" size={16} color="#FFFFFF" />
        <Text style={styles.newText}>New Project</Text>
      </Pressable>
      <View style={styles.statsPos}>
        <StatCards page={page} s={s} />
      </View>
      <View style={styles.listPos}>
        <ProjectList s={s} />
      </View>
      <View style={[styles.card, styles.detailPos]}>
        <ProjectDetail page={page} p={s.open} s={s} />
      </View>
      {s.panel ? (
        <View style={[styles.card, styles.panelPos]}>
          <ProjectAssessment page={page} p={s.open} onClose={() => s.setPanel(false)} />
        </View>
      ) : (
        <Pressable style={styles.showPanel} onPress={() => s.setPanel(true)} accessibilityRole="button">
          <Text style={styles.showPanelText}>Show assessment (RACE)</Text>
        </Pressable>
      )}
    </View>
  );
}

function Phone({ page, h, s, onNew }: { page: Page; h: Home; s: ProjectsState; onNew: () => void }) {
  const [detail, setDetail] = useState(false);
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={h.avatar} />
      <ScrollView contentContainerStyle={styles.phone}>
        {detail ? (
          <>
            <Pressable style={styles.back} onPress={() => setDetail(false)} accessibilityRole="button">
              <Icon name="chevronLeft" size={14} color={BLUE} />
              <Text style={styles.crumbLink}>All projects</Text>
            </Pressable>
            <View style={styles.cardP}>
              <ProjectDetail page={page} p={s.open} s={s} phone />
            </View>
            <View style={styles.cardP}>
              <ProjectAssessment page={page} p={s.open} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.phoneHead}>
              <View style={styles.flex}>
                <Text style={styles.titleP} accessibilityRole="header">
                  Projects
                </Text>
                <Text style={styles.subP}>Real-world projects that build your NCDC competencies.</Text>
              </View>
              <Pressable style={styles.newBtnP} onPress={onNew} accessibilityRole="button" accessibilityLabel="New project">
                <Icon name="plus" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            <StatCards page={page} s={s} phone />
            <SubjectMenu page={page} s={s} />
            <ProjectList s={s} onOpen={() => setDetail(true)} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Inventory: the learner's NCDC projects: list, detail, RACE assessment and competency identifiers. */
export default function ProjectsScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen title="Projects">{() => null}</PreviewScreen>;
  return <ProjectsView page={mock.learner.projectsPage} h={mock.learner.learnerHome} />;
}

function ProjectsView({ page, h }: { page: Page; h: Home }) {
  const s = useProjects(page);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const [newOpen, setNewOpen] = useState(false);
  return (
    <View style={styles.flex}>
      {wide ? (
        <ScrollView style={styles.deskBg}>
          <RefScale width={width} refWidth={PROJ_REF_WIDTH}>
            <Desktop page={page} h={h} s={s} onNew={() => setNewOpen(true)} />
          </RefScale>
        </ScrollView>
      ) : (
        <Phone page={page} h={h} s={s} onNew={() => setNewOpen(true)} />
      )}
      <NewProject page={page} s={s} open={newOpen} onClose={() => setNewOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  deskBg: { backgroundColor: '#EEF3FA' },
  canvas: { width: PROJ_REF_WIDTH, height: 1024, backgroundColor: '#EEF3FA' },
  pageIcon: { position: 'absolute', left: 217, top: 62, width: 58, height: 58 },
  titleBlock: { position: 'absolute', left: 291, top: 60 },
  crumbs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  crumbLink: { fontSize: 11.5, color: BLUE },
  crumbOn: { fontSize: 11.5, fontWeight: '600', color: NAVY },
  title: { marginTop: 2, fontSize: 26, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  sub: { marginTop: 2, fontSize: 13.5, color: BODY },
  subjectPos: { position: 'absolute', left: 1171, top: 73, width: 195, zIndex: 3 },
  subjectWrap: { zIndex: 3 },
  subject: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  subjectText: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  menu: { position: 'absolute', top: 38, left: 0, right: 0, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 4 },
  menuItem: { height: 30, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 12, color: INK },
  menuOn: { color: BLUE, fontWeight: '700' },
  newBtn: { position: 'absolute', left: 1378, top: 73, width: 136, height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, backgroundColor: '#0B6BFF' },
  newText: { fontSize: 12.5, fontWeight: '600', color: '#FFFFFF' },
  statsPos: { position: 'absolute', left: 216, top: 139, width: 934 },
  listPos: { position: 'absolute', left: 216, top: 238, width: 381 },
  card: { position: 'absolute', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  detailPos: { left: 608, top: 226, width: 542, height: 776 },
  panelPos: { left: 1160, top: 138, width: 370, height: 866, padding: 13 },
  showPanel: { position: 'absolute', left: 1160, top: 138, width: 370, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#BBD0F4', backgroundColor: '#FFFFFF' },
  showPanelText: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  phoneRoot: { flex: 1, backgroundColor: '#F4F7FB' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  phoneHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleP: { fontSize: 22, fontWeight: '800', color: NAVY },
  subP: { marginTop: 2, fontSize: 12, color: BODY },
  newBtnP: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#0B6BFF' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardP: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(8,12,20,0.55)' },
  sheet: { width: '100%', maxWidth: 440, padding: 20, gap: 12, borderRadius: 14, backgroundColor: '#FFFFFF' },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: INK },
  sheetSub: { marginTop: -6, fontSize: 12.5, color: BODY },
  input: { height: 42, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 13.5, color: INK },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { height: 30, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 15, borderWidth: 1, borderColor: '#DCE3EE' },
  chipOn: { borderColor: '#0B6BFF', backgroundColor: '#0B6BFF' },
  chipText: { fontSize: 12, color: INK },
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0B6BFF' },
  btnGhost: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: '#FFFFFF' },
  btnText: { fontSize: 13.5, fontWeight: '600', color: '#FFFFFF' },
  off: { opacity: 0.45 },
});
