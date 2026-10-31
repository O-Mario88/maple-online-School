import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { DOMAINS, GENERIC_SKILLS, LEARNING_OUTCOMES, RACE } from '@/lib/cbc';

import { StatusPill } from './ProjectList';
import { type DetailTab, type Page, type Project, type ProjectsState, type TaskState } from './useProjects';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const TABS: readonly DetailTab[] = ['Overview', 'Instructions', 'Resources', 'Submission', 'Assessment Criteria', 'Discussion'];
const TASK_LABEL: Record<TaskState, { text: string; bg: string; fg: string }> = {
  done: { text: 'Completed', bg: '#E3F6E9', fg: '#15803D' },
  doing: { text: 'In Progress', bg: '#E6EEFC', fg: '#1450C8' },
  todo: { text: 'Not Started', bg: '#EEF1F6', fg: BODY },
};

function Objectives({ page, p, phone }: { page: Page; p: Project; phone: boolean }) {
  const cols = [
    {
      icon: page.sectionIcons.kusva,
      title: 'KUSVA Domains',
      items: (['knowledge', 'skills', 'values'] as const).map((d) => ({ head: DOMAINS[d].label, sub: p.objectives[d] })),
    },
    { icon: page.sectionIcons.skills, title: 'Generic Skills', items: GENERIC_SKILLS.filter((g) => p.skills.includes(g.key)).map((g) => ({ head: g.label })) },
    { icon: page.sectionIcons.profile, title: 'Graduate Profile', items: LEARNING_OUTCOMES.map((o) => ({ head: o })) },
  ];
  return (
    <View style={[styles.objectives, phone && styles.objectivesP]}>
      {cols.map((c, i) => (
        <View key={c.title} style={[styles.objCol, i > 0 && !phone && styles.objDivider]}>
          <View style={styles.objHead}>
            <Image source={c.icon} style={styles.objIcon} />
            <Text style={styles.objTitle}>{c.title}</Text>
          </View>
          {c.items.map((it) => (
            <View key={it.head} style={styles.objItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.flex}>
                <Text style={[styles.objText, 'sub' in it && styles.objStrong]}>{it.head}</Text>
                {'sub' in it && it.sub ? <Text style={styles.objText}>{it.sub}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Tasks({ p, s }: { p: Project; s: ProjectsState }) {
  return (
    <View style={styles.tasks}>
      {p.tasks.map((t, i) => {
        const st = s.taskState(p, i);
        const l = TASK_LABEL[st];
        return (
          <View key={t.title} style={styles.task}>
            <Pressable style={[styles.box, st === 'done' && styles.boxOn]} onPress={() => s.toggleTask(p, i)} accessibilityRole="checkbox" accessibilityState={{ checked: st === 'done' }} accessibilityLabel={t.title} hitSlop={6}>
              {st === 'done' ? <Icon name="check" size={11} color="#FFFFFF" /> : null}
            </Pressable>
            <Text style={styles.taskText}>{t.title}</Text>
            <Text style={[styles.taskState, { backgroundColor: l.bg, color: l.fg }]}>{l.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Attachments({ page, big = false }: { page: Page; big?: boolean }) {
  return (
    <View style={[styles.atts, big && styles.attsBig]}>
      {page.attachments.map((a) => (
        <Pressable key={a.title} style={[styles.att, big && styles.attBig]} onPress={() => router.push('/learn/library')} accessibilityRole="link" accessibilityLabel={`${a.title}, ${a.meta}`}>
          <Image source={a.icon} style={styles.attIcon} />
          <View style={styles.flex}>
            <Text style={styles.attTitle} numberOfLines={1}>
              {a.title}
            </Text>
            <Text style={styles.attMeta}>{a.meta}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function Submission({ p, s }: { p: Project; s: ProjectsState }) {
  const done = p.status === 'completed' || s.isSubmitted(p);
  const ready = p.tasks.every((_, i) => s.taskState(p, i) === 'done');
  return (
    <View style={styles.pane}>
      <Text style={styles.h}>Submission</Text>
      <Text style={styles.para}>Projects are part of your Continuous Assessment (CA). Together with your Activities of Integration they make up 20% of your final UCE result.</Text>
      {done ? (
        <View style={styles.doneBox}>
          <Icon name="check" size={16} color="#15803D" />
          <Text style={styles.doneText}>{p.status === 'completed' ? p.date : 'Submitted for marking. Your teacher will score it with RACE.'}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.para}>{ready ? 'All tasks are done. You can submit now.' : 'Finish every task in Your Tasks before you submit.'}</Text>
          <Pressable style={[styles.submit, !ready && styles.submitOff]} disabled={!ready} onPress={() => s.submit(p)} accessibilityRole="button" accessibilityState={{ disabled: !ready }}>
            <Icon name="send" size={15} color="#FFFFFF" />
            <Text style={styles.submitText}>Submit Project</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function Criteria() {
  return (
    <View style={styles.pane}>
      <Text style={styles.h}>How your project is scored (RACE)</Text>
      {RACE.map((r) => (
        <View key={r.key} style={styles.crit}>
          <Text style={styles.critHead}>{`${r.label} (0–${r.max})`}</Text>
          <Text style={styles.para}>{r.hint}</Text>
        </View>
      ))}
      <Text style={[styles.h, styles.gap]}>Identifiers</Text>
      <Text style={styles.para}>1 = Basic, 2 = Moderate, 3 = Outstanding. Your teacher also rates the KUSVA domains, the five generic skills and the graduate profile.</Text>
    </View>
  );
}

function Discussion({ page }: { page: Page }) {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState(page.discussion);
  return (
    <View style={styles.pane}>
      {posts.map((d, i) => (
        <View key={i} style={styles.post}>
          <Text style={styles.postWho}>{`${d.who} • ${d.when}`}</Text>
          <Text style={styles.para}>{d.text}</Text>
        </View>
      ))}
      <View style={styles.reply}>
        <TextInput style={styles.replyInput} value={text} onChangeText={setText} placeholder="Ask your team or teacher…" placeholderTextColor="#6B7385" accessibilityLabel="Write a message" />
        <Pressable
          style={styles.send}
          disabled={!text.trim()}
          onPress={() => {
            setPosts((p) => [...p, { who: 'You', text: text.trim(), when: 'Now' }]);
            setText('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Send">
          <Icon name="send" size={15} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

export function ProjectDetail({ page, p, s, phone = false }: { page: Page; p: Project; s: ProjectsState; phone?: boolean }) {
  const [menu, setMenu] = useState(false);
  return (
    <View>
      <View style={[styles.hero, phone && styles.heroP]}>
        <Image source={p.hero} style={styles.fill} contentFit="cover" />
        <View style={styles.heroPill}>
          <StatusPill status={p.status} />
        </View>
      </View>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text style={styles.title}>{p.title}</Text>
          <View style={styles.meta}>
            <Image source={page.subjectIcon} style={styles.subjIcon} />
            <Text style={styles.metaText}>{`${p.subject}  •  Primary 6`}</Text>
            <Icon name="calendar" size={13} color={BODY} />
            <Text style={styles.metaText}>{p.date}</Text>
            <View style={styles.metaBar}>
              <Bar value={p.progress} color="#22A35A" track="#E6EBF2" height={7} />
            </View>
            <Text style={styles.metaPct}>{`${Math.round(p.progress * 100)}%`}</Text>
          </View>
        </View>
        {phone ? null : (
          <>
            <Pressable style={styles.cont} onPress={() => s.setTab('Submission')} accessibilityRole="button">
              <Text style={styles.contText}>{p.status === 'completed' ? 'View Work' : 'Continue Work'}</Text>
            </Pressable>
            <View>
              <Pressable style={styles.more} onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityLabel="More actions" accessibilityState={{ expanded: menu }}>
                <Icon name="more" size={16} color={BLUE} />
              </Pressable>
              {menu ? (
                <View style={styles.menu}>
                  {[
                    { label: 'Message my teacher', go: () => router.push('/inbox') },
                    { label: 'Open the project guide', go: () => router.push('/learn/library') },
                  ].map((m) => (
                    <Pressable
                      key={m.label}
                      style={styles.menuItem}
                      onPress={() => {
                        setMenu(false);
                        m.go();
                      }}
                      accessibilityRole="menuitem">
                      <Text style={styles.menuText}>{m.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        )}
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, t === s.tab && styles.tabOnBg]} onPress={() => s.setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: t === s.tab }}>
            <Text style={[styles.tabText, t === s.tab && styles.tabOn]}>{t}</Text>
            {t === s.tab ? <View style={styles.tabLine} /> : null}
          </Pressable>
        ))}
      </View>
      {s.tab === 'Overview' ? (
        <View style={styles.pane}>
          <Text style={styles.h}>Project Description</Text>
          <Text style={styles.para}>{p.description}</Text>
          <Text style={[styles.h, styles.gap]}>Learning Objectives (NCDC)</Text>
          <Objectives page={page} p={p} phone={phone} />
          <Text style={[styles.h, styles.gap]}>Your Tasks</Text>
          <Tasks p={p} s={s} />
          <Text style={[styles.h, styles.gap]}>Attachments & Resources</Text>
          <Attachments page={page} />
        </View>
      ) : null}
      {s.tab === 'Instructions' ? (
        <View style={styles.pane}>
          {p.instructions.map((t, i) => (
            <View key={t} style={styles.step}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={[styles.para, styles.flex]}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {s.tab === 'Resources' ? (
        <View style={styles.pane}>
          <Attachments page={page} big />
        </View>
      ) : null}
      {s.tab === 'Submission' ? <Submission p={p} s={s} /> : null}
      {s.tab === 'Assessment Criteria' ? <Criteria /> : null}
      {s.tab === 'Discussion' ? <Discussion page={page} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  hero: { height: 122, borderRadius: 8, overflow: 'hidden', backgroundColor: '#DCE9F7' },
  heroP: { height: 150 },
  heroPill: { position: 'absolute', top: 14, right: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  title: { fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 8 },
  subjIcon: { width: 15, height: 15 },
  metaText: { fontSize: 11.5, color: BODY, marginRight: 4 },
  metaBar: { width: 56 },
  metaPct: { fontSize: 12, fontWeight: '700', color: INK },
  cont: { height: 32, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 5, backgroundColor: '#0B6BFF' },
  contText: { fontSize: 12.5, fontWeight: '500', color: '#FFFFFF' },
  more: { width: 36, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  menu: { position: 'absolute', top: 36, right: 0, width: 190, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 5 },
  menuItem: { height: 32, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 12, color: INK },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#E3E8F0' },
  tab: { paddingVertical: 7, paddingHorizontal: 8, borderRadius: 4 },
  tabOnBg: { backgroundColor: '#F4F8FF' },
  tabText: { fontSize: 11.5, color: INK },
  tabOn: { color: BLUE, fontWeight: '700' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 2.5, backgroundColor: BLUE },
  pane: { marginTop: 14 },
  h: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  gap: { marginTop: 18 },
  para: { marginTop: 6, fontSize: 12, lineHeight: 17, color: BODY },
  objectives: { flexDirection: 'row', marginTop: 10 },
  objectivesP: { flexDirection: 'column', gap: 12 },
  objCol: { flex: 1, paddingHorizontal: 6 },
  objDivider: { borderLeftWidth: 1, borderLeftColor: '#E8EDF4' },
  objHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  objIcon: { width: 26, height: 26 },
  objTitle: { fontSize: 11.5, fontWeight: '700', color: NAVY },
  objItem: { flexDirection: 'row', gap: 5, marginTop: 5 },
  bullet: { fontSize: 11, color: BLUE },
  objText: { fontSize: 10.5, lineHeight: 14, color: BODY },
  objStrong: { fontWeight: '600', color: NAVY },
  tasks: { marginTop: 8 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 22, paddingVertical: 2 },
  box: { width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 3, borderWidth: 1.5, borderColor: '#9AA4B5' },
  boxOn: { borderColor: '#22A35A', backgroundColor: '#22A35A' },
  taskText: { flex: 1, fontSize: 11.5, color: INK },
  taskState: { width: 66, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: '500', textAlign: 'center', overflow: 'hidden' },
  atts: { flexDirection: 'row', gap: 6, marginTop: 10 },
  attsBig: { flexDirection: 'column' },
  att: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  attBig: { padding: 10 },
  attIcon: { width: 29, height: 30 },
  attTitle: { fontSize: 10.5, fontWeight: '600', color: NAVY },
  attMeta: { marginTop: 2, fontSize: 9.5, color: BODY },
  doneBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#EAF6EE' },
  doneText: { flex: 1, fontSize: 12.5, color: '#15803D' },
  submit: { alignSelf: 'flex-start', height: 38, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingHorizontal: 18, borderRadius: 6, backgroundColor: '#0B6BFF' },
  submitOff: { opacity: 0.45 },
  submitText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  crit: { marginTop: 10 },
  critHead: { fontSize: 12, fontWeight: '700', color: INK },
  step: { flexDirection: 'row', gap: 10, marginTop: 8 },
  stepNum: { width: 22, height: 22, marginTop: 4, borderRadius: 11, backgroundColor: '#DCE8FD', fontSize: 12, lineHeight: 22, fontWeight: '700', color: BLUE, textAlign: 'center', overflow: 'hidden' },
  post: { marginBottom: 10, padding: 10, borderRadius: 8, backgroundColor: '#F5F8FC' },
  postWho: { fontSize: 11, fontWeight: '700', color: NAVY },
  reply: { flexDirection: 'row', gap: 8, marginTop: 6 },
  replyInput: { flex: 1, height: 36, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 12.5, color: INK },
  send: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#0B6BFF' },
});
