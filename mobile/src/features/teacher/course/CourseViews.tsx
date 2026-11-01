import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type SideItem, type TeacherMe, TeacherPhoneTop, TeacherSideNav, TeacherTopBar, useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { PopMenu } from '@/features/teacher/frame/TeacherInputs';
import { BLUE, BODY, CANVAS, INK, IconTile, LINE, MUTED, Panel, RED } from '@/features/teacher/frame/TeacherParts';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { CourseBuilder } from '@/mock/teacher-course';

import { BlockPalette, LessonContent } from './BlocksPanel';
import { CourseHeader, CourseHeaderPhone, StructurePanel } from './CourseTop';
import { CourseSection } from './CourseSections';
import { LessonSettingsPanel, NotesTab, QuizTab } from './LessonPanels';
import { type Builder, type LessonTab, useCourseBuilder } from './useCourseBuilder';
import { Timestamps, usePlayer, VideoPlayer } from './VideoPanel';

/** The course builder reference's desktop (top bar to the end of the editor), laid out in its pixels and scaled. */
export const COURSE_REF_WIDTH = 1180;

const TABS: readonly { key: LessonTab; label: string; icon: IconName }[] = [
  { key: 'content', label: 'Content', icon: 'check' },
  { key: 'video', label: 'Video', icon: 'video' },
  { key: 'interactive', label: 'Interactive', icon: 'hand' },
  { key: 'notes', label: 'Notes', icon: 'notes' },
  { key: 'quiz', label: 'Quiz', icon: 'clipboard' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

function SquareBtn({ icon, label, onPress, disabled }: { icon: IconName; label: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable style={[styles.square, disabled && styles.disabled]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}>
      <Icon name={icon} size={14} color={BLUE} />
    </Pressable>
  );
}

/** The selected lesson: title, actions, tabs and the tab's content. Keyed by lesson so the player starts over. */
function LessonEditor({ c, b }: { c: CourseBuilder; b: Builder }) {
  const go = useTeacherGo();
  const player = usePlayer(c.video.length);
  const cur = b.current;
  if (!cur) return null;
  const at = b.order.indexOf(cur.lesson.id);
  return (
    <View>
      <View style={styles.lessonHead}>
        <Text style={styles.lessonTitle} accessibilityRole="header">{`${cur.number}  ${cur.lesson.title}`}</Text>
        <Pressable onPress={() => b.setTab('settings')} accessibilityRole="button" accessibilityLabel="Rename this lesson" hitSlop={8}>
          <Icon name="edit" size={15} color={BLUE} />
        </Pressable>
        <View style={styles.flex} />
        <PopMenu
          label="Lesson actions"
          width={180}
          items={[
            { label: 'Preview as a learner', icon: 'eye', onPress: () => go('/learn/lesson') },
            { label: 'Duplicate lesson', icon: 'grid', onPress: b.duplicateLesson },
            { label: 'Lesson settings', icon: 'settings', onPress: () => b.setTab('settings') },
          ]}>
          <View style={styles.actionsBtn}>
            <Text style={styles.actionsText}>Lesson Actions</Text>
            <Icon name="chevronDown" size={12} color={BLUE} />
          </View>
        </PopMenu>
        <SquareBtn icon="chevronLeft" label="Previous lesson" onPress={() => b.step(-1)} disabled={at <= 0} />
        <SquareBtn icon="chevronRight" label="Next lesson" onPress={() => b.step(1)} disabled={at >= b.order.length - 1} />
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.key === b.tab;
          return (
            <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => b.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Icon name={t.icon} size={13} color={on ? BLUE : BODY} />
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {b.tab === 'content' || b.tab === 'video' ? (
        <View style={styles.rowA}>
          <View style={styles.videoCol}>
            <View style={styles.sectionHead}>
              <Icon name="video" size={13} color={INK} />
              <Text style={styles.sectionTitle}>Video Lesson</Text>
            </View>
            <VideoPlayer frame={c.video.frame} b={b} player={player} />
          </View>
          <View style={styles.flex}>
            <Timestamps b={b} player={player} />
          </View>
        </View>
      ) : null}
      {b.tab === 'content' ? (
        <View style={styles.rowB}>
          <View style={styles.blocksCol}>
            <BlockPalette c={c} b={b} />
            <LessonContent c={c} b={b} />
          </View>
          <View style={styles.flex}>
            <LessonSettingsPanel c={c} b={b} />
          </View>
        </View>
      ) : null}
      {b.tab === 'interactive' ? (
        <View style={styles.rowB}>
          <View style={styles.blocksCol}>
            <BlockPalette c={c} b={b} />
            <LessonContent c={c} b={b} />
          </View>
          <View style={styles.flex}>
            <Timestamps b={b} player={player} />
          </View>
        </View>
      ) : null}
      {b.tab === 'notes' ? <NotesTab c={c} b={b} /> : null}
      {b.tab === 'quiz' ? <QuizTab c={c} b={b} /> : null}
      {b.tab === 'settings' ? (
        <View style={styles.settingsTab}>
          <LessonSettingsPanel c={c} b={b} />
        </View>
      ) : null}
    </View>
  );
}

export function CourseDesk({ c, me }: { c: CourseBuilder; me: TeacherMe }) {
  const b = useCourseBuilder(c);
  const items: SideItem[] = c.nav.map((n) => ({ label: n.label, icon: n.icon, go: '/teach/course-editor' }));
  const active = c.nav.find((n) => n.key === b.section)?.label ?? 'Content Builder';
  const onItem = (item: SideItem) => {
    const n = c.nav.find((x) => x.label === item.label);
    if (n) b.setSection(n.key);
    return true;
  };
  return (
    <View style={styles.canvas}>
      <TeacherTopBar active="Studio" me={me} placeholder="Search courses, lessons, or students..." />
      <View style={styles.body}>
        <TeacherSideNav dense title="Course Builder" items={items} active={active} onItem={onItem} />
        <View style={styles.main}>
          <CourseHeader c={c} b={b} />
          <View style={styles.panels}>
            <Panel style={styles.structure}>
              <StructurePanel b={b} />
            </Panel>
            <Panel style={styles.editor}>{b.section === 'content' ? <LessonEditor key={b.current?.lesson.id} c={c} b={b} /> : <CourseSection c={c} b={b} />}</Panel>
          </View>
        </View>
      </View>
    </View>
  );
}

type PhoneTab = 'content' | 'resources' | 'settings';
const PHONE_TABS: readonly { key: PhoneTab; label: string; icon: IconName }[] = [
  { key: 'content', label: 'Content', icon: 'check' },
  { key: 'resources', label: 'Resources', icon: 'notes' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

function Fold({ title, open, onToggle, icon, children }: { title: string; open: boolean; onToggle: () => void; icon: IconName; children: React.ReactNode }) {
  return (
    <View style={styles.fold}>
      <Pressable style={styles.foldHead} onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Icon name={icon} size={15} color={BODY} />
        <Text style={styles.foldTitle}>{title}</Text>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={15} color={BODY} />
      </Pressable>
      {open ? <View style={styles.foldBody}>{children}</View> : null}
    </View>
  );
}

export function CoursePhone({ c, me }: { c: CourseBuilder; me: TeacherMe }) {
  const b = useCourseBuilder(c);
  const player = usePlayer(c.video.length);
  const [tab, setTab] = useState<PhoneTab>('content');
  const [palette, setPalette] = useState(false);
  const [fold, setFold] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const toggle = (k: string) => setFold((f) => (f === k ? null : k));
  const del = () => {
    if (!confirm) {
      setConfirm(true);
      return toast('Tap Delete again to delete this lesson.');
    }
    setConfirm(false);
    b.deleteLesson();
  };
  const resources = (
    <View>
      {c.sections.resources.map((r) => (
        <View key={r.title} style={styles.resource}>
          <IconTile icon={r.icon} color={BLUE} size={28} soft />
          <View style={styles.flex}>
            <Text style={styles.resTitle}>{r.title}</Text>
            <Text style={styles.resMeta}>{r.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
  return (
    <View style={styles.phoneRoot}>
      <TeacherPhoneTop me={me} />
      <ScrollView contentContainerStyle={styles.phone}>
        <CourseHeaderPhone c={c} b={b} />
        <View style={styles.pTabs} accessibilityRole="tablist">
          {PHONE_TABS.map((t) => {
            const on = t.key === tab;
            return (
              <Pressable key={t.key} style={[styles.pTab, on && styles.pTabOn]} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Icon name={t.icon} size={13} color={on ? BLUE : BODY} />
                <Text style={[styles.pTabText, on && styles.tabTextOn]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {tab === 'content' ? (
          <>
            <VideoPlayer frame={c.video.frame} b={b} player={player} compact />
            <View style={styles.pHead}>
              <Text style={styles.pHeadTitle}>Lesson Content</Text>
              <Pressable onPress={() => toggle('settings')} accessibilityRole="button" accessibilityLabel="Edit lesson" hitSlop={8}>
                <Text style={styles.link}>Edit</Text>
              </Pressable>
            </View>
            <LessonContent c={c} b={b} phone />
            <Pressable style={styles.addBlock} onPress={() => setPalette((p) => !p)} accessibilityRole="button" accessibilityState={{ expanded: palette }}>
              <Icon name="plus" size={15} color="#FFFFFF" />
              <Text style={styles.addBlockText}>Add Content Block</Text>
            </Pressable>
            {palette ? (
              <View style={styles.paletteP}>
                <BlockPalette c={c} b={b} />
              </View>
            ) : null}
            <View>
              <Fold title={`Interactive Timestamps (${b.marks.length})`} icon="clock" open={fold === 'marks'} onToggle={() => toggle('marks')}>
                <Timestamps b={b} player={player} />
              </Fold>
              <Fold title="Lesson Settings" icon="settings" open={fold === 'settings'} onToggle={() => toggle('settings')}>
                <LessonSettingsPanel c={c} b={b} buttons={false} />
              </Fold>
              <Fold title={`Resources (${c.sections.resources.length})`} icon="notes" open={fold === 'resources'} onToggle={() => toggle('resources')}>
                {resources}
              </Fold>
            </View>
            <View style={styles.pButtons}>
              <Pressable style={[styles.pBtn, styles.pDelete, confirm && styles.pDeleteOn]} onPress={del} accessibilityRole="button" accessibilityLabel={confirm ? 'Confirm: delete this lesson' : 'Delete lesson'}>
                <Icon name="trash" size={14} color={confirm ? '#FFFFFF' : RED} />
                <Text style={[styles.pBtnText, { color: confirm ? '#FFFFFF' : RED }]}>{confirm ? 'Confirm' : 'Delete'}</Text>
              </Pressable>
              <Pressable style={[styles.pBtn, styles.pSave]} onPress={b.saveDraft} accessibilityRole="button" accessibilityLabel="Save changes">
                <Text style={[styles.pBtnText, styles.white]}>Save Changes</Text>
              </Pressable>
            </View>
          </>
        ) : null}
        {tab === 'resources' ? resources : null}
        {tab === 'settings' ? <LessonSettingsPanel c={c} b={b} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  disabled: { opacity: 0.4 },
  canvas: { width: COURSE_REF_WIDTH, padding: 14, gap: 8, backgroundColor: CANVAS },
  body: { flexDirection: 'row', gap: 8 },
  main: { flex: 1, gap: 16, paddingLeft: 6, paddingTop: 10, paddingBottom: 6 },
  panels: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  structure: { width: 254, paddingHorizontal: 10, paddingVertical: 12, alignSelf: 'stretch' },
  editor: { flex: 1, padding: 11, paddingRight: 6 },
  lessonHead: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  lessonTitle: { fontSize: 17, fontWeight: '700', color: INK },
  actionsBtn: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 11, borderRadius: 6, borderWidth: 1, borderColor: LINE },
  actionsText: { fontSize: 10.5, fontWeight: '600', color: BLUE },
  square: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: LINE },
  tabs: { flexDirection: 'row', marginTop: 16, marginBottom: 14, borderBottomWidth: 1, borderColor: LINE },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, borderBottomWidth: 2.5, borderColor: 'transparent' },
  tabOn: { borderColor: BLUE },
  tabText: { fontSize: 11, color: BODY },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  rowA: { flexDirection: 'row', gap: 17, zIndex: 3 },
  videoCol: { width: 425 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  sectionTitle: { fontSize: 12.5, fontWeight: '700', color: INK },
  rowB: { flexDirection: 'row', gap: 20, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: '#EEF2F8', zIndex: 2 },
  blocksCol: { width: 457 },
  settingsTab: { maxWidth: 360 },
  phoneRoot: { flex: 1, backgroundColor: '#F4F7FB' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  pTabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: LINE },
  pTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderBottomWidth: 2.5, borderColor: 'transparent' },
  pTabOn: { borderColor: BLUE },
  pTabText: { fontSize: 12, color: BODY },
  pHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pHeadTitle: { fontSize: 14, fontWeight: '700', color: INK },
  link: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  addBlock: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, backgroundColor: BLUE },
  addBlockText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  paletteP: { padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  fold: { borderTopWidth: 1, borderColor: LINE },
  foldHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  foldTitle: { flex: 1, fontSize: 13.5, fontWeight: '600', color: INK },
  foldBody: { paddingBottom: 12 },
  resource: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#EEF2F8' },
  resTitle: { fontSize: 12.5, color: INK },
  resMeta: { marginTop: 2, fontSize: 11, color: MUTED },
  pButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pBtn: { flex: 1, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8 },
  pDelete: { borderWidth: 1.5, borderColor: RED, backgroundColor: '#FFFFFF' },
  pDeleteOn: { backgroundColor: RED },
  pSave: { flex: 1.4, backgroundColor: BLUE },
  pBtnText: { fontSize: 13, fontWeight: '600' },
});
