import { Image } from '@/components/picture';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdSelect, CmdStat, CountTabs, KpiGrid, OutlineBtn, PageStrip, PrimaryBtn } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { addSubject, cloneTemplate, filterSubjects, gradesIn, type Subject } from '@/features/command/logic/curricula';
import { Btn, Card, IconTile, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, MUTED, NAVY, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { Framework } from '@/mock/command-center/curricula';
import { Maple } from '@/constants/maple';

type K = CommandData['curricula'];
const PER_PAGE = 10;
const CATEGORY_TONE: Readonly<Record<string, Tone>> = { STEM: 'blue', Languages: 'purple', Humanities: 'grey', Business: 'orange', Arts: 'red', Health: 'green' };
const ALL_GRADES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

function useCurricula(k: K, me: string) {
  const [frameworks, setFrameworks] = useState<readonly Framework[]>(k.frameworks);
  const [fid, setFid] = useState(k.frameworks[0].id);
  const [fQuery, setFQuery] = useState('');
  const [region, setRegion, regions] = useChoice(k.regions);
  const [status, setStatus, statuses] = useChoice(k.statuses);
  const [subjectsBy, setSubjectsBy] = useState<Readonly<Record<string, readonly Subject[]>>>({ uneb: k.unebSubjects });
  const [tab, setTab] = useState(k.tabs[0]);
  const [query, setQuery] = useState('');
  const [level, setLevel, levels] = useChoice(k.levels);
  const [category, setCategory, categories] = useChoice(k.categories);
  const [page, setPage] = useState(1);
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const [adding, setAdding] = useState(false);
  const [clones, setClones] = useState<readonly string[]>([]);

  const framework = frameworks.find((f) => f.id === fid) ?? frameworks[0];
  // Frameworks other than UNEB share a sample subject list until their own syllabi are loaded.
  const subjects = subjectsBy[fid] ?? k.unebSubjects.slice(0, Math.min(k.unebSubjects.length, framework.subjects));
  const shownFrameworks = frameworks.filter((f) => (region === 'All Regions' || f.region === region) && (status === 'Status' || (status === 'Active') === f.active) && (!fQuery.trim() || `${f.name} ${f.board}`.toLowerCase().includes(fQuery.trim().toLowerCase())));
  const shown = useMemo(() => filterSubjects(subjects, { level, category, query }), [subjects, level, category, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const subject = subjects.find((s) => s.name === subjectName) ?? subjects[0];

  const pickFramework = (id: string) => {
    setFid(id);
    setPage(1);
    setTab(k.tabs[0]);
  };
  const add = (name: string, cat: string, lv: string) => {
    const r = addSubject(subjects, { name, category: cat, levels: lv });
    if (r.error) return toast(r.error);
    setSubjectsBy((prev) => ({ ...prev, [fid]: r.list }));
    setSubjectName(name.trim());
    setAdding(false);
    toast(`${name.trim()} added to ${framework.short} as a draft. Schools see it after the next template version.`);
  };
  const clone = () =>
    setAsk({
      title: `Clone the ${framework.short} template`,
      body: 'The school gets its own editable copy. The shared template stays unchanged and keeps receiving updates.',
      confirm: 'Clone Template',
      tone: 'blue',
      placeholder: 'School name',
      onConfirm: (school) => {
        const r = cloneTemplate(framework, school);
        setFrameworks((prev) => prev.map((f) => (f.id === fid ? r.framework : f)));
        setClones((prev) => [`${r.copyName} • by ${me}`, ...prev]);
        toast(`Created “${r.copyName}”.`);
      },
    });
  return {
    framework,
    frameworks: shownFrameworks,
    pickFramework,
    fQuery,
    setFQuery,
    region,
    setRegion,
    regions,
    status,
    setStatus,
    statuses,
    subjects,
    rows,
    shown,
    page: p,
    pages,
    setPage,
    tab,
    setTab,
    query,
    setQuery,
    level,
    setLevel,
    levels,
    category,
    setCategory,
    categories,
    subject,
    setSubjectName,
    ask,
    setAsk,
    adding,
    setAdding,
    add,
    clone,
    clones,
  };
}
type U = ReturnType<typeof useCurricula>;

function Crest({ src, size }: { src: number; size: number }) {
  return <Image decorative source={src} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
}

function FrameworkList({ u }: { u: U }) {
  return (
    <Card style={styles.list}>
      <Text style={styles.panelTitle}>Curriculum Frameworks</Text>
      <Search placeholder="Search curricula..." value={u.fQuery} onChange={u.setFQuery} />
      <View style={styles.inline}>
        <View style={styles.flex}>
          <CmdSelect value={u.region} options={u.regions} onChange={u.setRegion} label="Region" />
        </View>
        <View style={styles.flex}>
          <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} label="Status" />
        </View>
      </View>
      {u.frameworks.map((f) => {
        const on = f.id === u.framework.id;
        return (
          <Pressable key={f.id} style={[styles.fw, on && styles.fwOn]} onPress={() => u.pickFramework(f.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${f.name}, ${f.subjects} subjects`}>
            <Crest src={f.crest} size={52} />
            <View style={styles.flex}>
              <View style={styles.inline}>
                <Text style={[styles.fwName, styles.flex]} numberOfLines={2}>
                  {f.name}
                </Text>
                <Icon name="chevronRight" size={14} color={BLUE} />
              </View>
              <Text style={styles.small} numberOfLines={2}>
                {f.board}
              </Text>
              <View style={styles.fwChips}>
                <Text style={styles.chip}>{`${f.subjects} Subjects`}</Text>
                <Text style={styles.chip}>{`${f.grades} Grades`}</Text>
                <View style={styles.pushRight}>
                  <Pill label={f.active ? 'Active' : 'Draft'} tone={f.active ? 'green' : 'grey'} icon="check" size={11} />
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
      {u.frameworks.length === 0 ? <Text style={styles.small}>No frameworks match.</Text> : null}
    </Card>
  );
}

function FrameworkHead({ u, phone = false }: { u: U; phone?: boolean }) {
  const f = u.framework;
  const items = [
    { icon: 'book' as const, tone: 'green' as Tone, value: `${f.subjects} Subjects`, sub: '' },
    { icon: 'layers' as const, tone: 'blue' as Tone, value: `${f.grades} Grades`, sub: f.gradeRange },
    { icon: 'building' as const, tone: 'blue' as Tone, value: `${f.schools.toLocaleString('en-US')} Schools`, sub: 'Using this template' },
    { icon: 'people' as const, tone: 'green' as Tone, value: `${f.teachers.toLocaleString('en-US')} Teacher Users`, sub: 'Teaching from this curriculum' },
    { icon: 'doc' as const, tone: 'green' as Tone, value: `${f.papers.toLocaleString('en-US')} Past Papers`, sub: f.paperYears },
  ];
  return (
    <View style={styles.fwHead}>
      <View style={styles.inline}>
        <Crest src={f.crest} size={phone ? 48 : 60} />
        <View style={styles.flex}>
          <View style={styles.inline}>
            <Text style={styles.fwTitle}>{f.name}</Text>
            <Pill label="Active" tone="green" icon="check" size={11.5} />
          </View>
          <Text style={styles.body}>{f.board}</Text>
        </View>
        {phone ? null : (
          <>
            <OutlineBtn label="Edit" icon="edit" small onPress={() => toast(`Editing ${f.short} opens a draft version; schools keep v${f.version} until you publish.`)} />
            <OutlineBtn label="Clone Template" icon="layers" small onPress={u.clone} />
            <OutlineBtn icon="more" small onPress={() => toast('Archive, export as JSON, or compare versions.')} />
          </>
        )}
      </View>
      <Text style={styles.body}>{f.description}</Text>
      {phone ? (
        <View style={styles.inline}>
          <OutlineBtn label="Edit" icon="edit" small onPress={() => toast(`Editing ${f.short} opens a draft version.`)} style={styles.flex} />
          <OutlineBtn label="Clone Template" icon="layers" small onPress={u.clone} style={styles.flex} />
        </View>
      ) : null}
      <View style={[styles.fwStats, phone && styles.fwStatsPhone]}>
        {items.map((it) => (
          <View key={it.value} style={phone ? styles.fwStatPhone : styles.fwStat}>
            <IconTile icon={it.icon} tone={it.tone} size={34} radius={9} iconSize={18} />
            <View style={styles.flex}>
              <Text style={styles.fwStatValue} numberOfLines={2}>
                {it.value}
              </Text>
              {it.sub ? (
                <Text style={styles.small} numberOfLines={2}>
                  {it.sub}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
      {u.clones.length ? <Text style={styles.small}>{`Cloned this session: ${u.clones.join('; ')}`}</Text> : null}
    </View>
  );
}

function subjectCols(u: U): readonly Column<Subject>[] {
  return [
    { label: '#', width: 26, render: (_s, i) => <Cell small>{(u.page - 1) * PER_PAGE + i + 1}</Cell> },
    {
      label: 'Subject Name',
      flex: 1.7,
      render: (s) => (
        <Text style={styles.subjectLink} numberOfLines={2}>
          {s.name}
        </Text>
      ),
    },
    { label: 'Category', width: 88, render: (s) => <Pill label={s.category} tone={CATEGORY_TONE[s.category] ?? 'grey'} size={10.5} /> },
    { label: 'Level(s)', width: 70, render: (s) => <Cell small>{s.levels}</Cell> },
    { label: 'Resources', width: 70, align: 'center', render: (s) => <Cell small>{s.resources.toLocaleString('en-US')}</Cell> },
    { label: 'Past Papers', width: 74, align: 'center', render: (s) => <Cell small>{s.papers.toLocaleString('en-US')}</Cell> },
    { label: 'Status', width: 74, render: () => <Pill label="Active" tone="green" icon="check" size={10.5} /> },
  ];
}

/** The other framework tabs, each a short read-out. */
function OtherTab({ k, u }: { k: K; u: U }) {
  const f = u.framework;
  if (u.tab === 'Grade Structure') {
    return (
      <View style={styles.grades}>
        {ALL_GRADES.map((g) => (
          <View key={g} style={styles.gradeBox}>
            <Text style={styles.gradeName}>{g}</Text>
            <Text style={styles.small}>{`${u.subjects.filter((s) => gradesIn(s.levels).includes(g)).length} subjects`}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (u.tab === 'Version History') {
    return (
      <View style={styles.listGap}>
        {k.versions.map((v) => (
          <Text key={v.v} style={styles.body}>{`${v.v} • ${v.date} • ${v.by}: ${v.note}`}</Text>
        ))}
      </View>
    );
  }
  const text: Readonly<Record<string, string>> = {
    'Learning Objectives': `${u.subjects.length} subjects carry 1,620 grade-level objectives, each tagged to lessons and questions.`,
    'Assessment Framework': 'Continuous assessment 20%, end-of-cycle exam 80%. Grades D1–F9 (O-Level) and A–F (A-Level).',
    'Past Papers': `${f.papers.toLocaleString('en-US')} papers from ${f.paperYears}, digitised with marking guides and topic tags.`,
    Resources: `${u.subjects.reduce((s, x) => s + x.resources, 0).toLocaleString('en-US')} lessons, notes and videos linked to this framework.`,
    'Schools Using': `${f.schools.toLocaleString('en-US')} schools teach from ${f.short} (v${f.version}); ${f.clones.toLocaleString('en-US')} have their own copy.`,
  };
  return <Text style={styles.body}>{text[u.tab] ?? ''}</Text>;
}

function SubjectsTable({ k, u }: { k: K; u: U }) {
  return (
    <Card style={styles.tableCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={k.tabs.map((label) => ({ label }))} active={u.tab} onChange={u.setTab} size={12.5} dense style={styles.noWrap} />
      </ScrollView>
      {u.tab === 'Subjects' ? (
        <>
          <Text style={styles.panelTitle}>{`Subjects (${u.subjects.length})`}</Text>
          <View style={styles.inline}>
            <Search placeholder="Search subjects..." value={u.query} onChange={u.setQuery} style={styles.flex} />
            <CmdSelect value={u.level} options={u.levels} onChange={u.setLevel} width={110} label="Level" />
            <CmdSelect value={u.category} options={u.categories} onChange={u.setCategory} width={134} label="Category" />
            <PrimaryBtn label="Add Subject" icon="plus" onPress={() => u.setAdding(true)} style={styles.addBtn} />
          </View>
          <DataTable columns={subjectCols(u)} rows={u.rows} rowKey={(s) => s.name} compact menu onMenu={(s) => toast(`${s.name}: edit, retire or move between categories.`)} onRowPress={(s) => u.setSubjectName(s.name)} activeKey={u.subject?.name} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} subjects`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </>
      ) : (
        <OtherTab k={k} u={u} />
      )}
    </Card>
  );
}

function SubjectPreview({ k, u }: { k: K; u: U }) {
  const s = u.subject;
  const [tab, setTab] = useState('Overview');
  if (!s) return null;
  const extra = k.preview[s.name];
  const covered = gradesIn(s.levels);
  const f = u.framework;
  return (
    <Card style={styles.preview}>
      <Text style={styles.panelTitle}>Subject Preview</Text>
      <View style={styles.inline}>
        <View style={styles.sigma}>
          <Icon name="sigma" size={30} color={BLUE} />
        </View>
        <View style={styles.flex}>
          <View style={styles.inline}>
            <Text style={styles.previewName}>{s.name}</Text>
            <Pill label={s.category} tone={CATEGORY_TONE[s.category] ?? 'grey'} size={10.5} />
          </View>
          <Text style={styles.small}>{s.levels}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={['Overview', 'Learning Objectives', 'Past Papers', 'Resources'].map((label) => ({ label }))} active={tab} onChange={setTab} size={11.5} dense style={styles.noWrap} />
      </ScrollView>
      {tab === 'Overview' ? (
        <>
          <Text style={styles.body}>{extra?.about ?? `${s.name} for ${s.levels}, with syllabus, objectives, past papers and marking guides from ${f.board}.`}</Text>
          <View style={styles.previewStats}>
            {[
              [s.resources.toLocaleString('en-US'), 'Resources'],
              [s.papers.toLocaleString('en-US'), 'Past Papers'],
              [(extra?.schools ?? Math.round(f.schools * 0.7)).toLocaleString('en-US'), 'Schools'],
              [(extra?.teachers ?? Math.round(f.teachers * 0.2)).toLocaleString('en-US'), 'Teachers'],
            ].map(([v, l]) => (
              <View key={l} style={styles.previewStat}>
                <Text style={styles.previewValue}>{v}</Text>
                <Text style={styles.tiny}>{l}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.section}>Grade Coverage</Text>
          <View style={styles.coverage}>
            {ALL_GRADES.map((g) => {
              const on = covered.includes(g);
              return (
                <View key={g} style={[styles.coverChip, on && styles.coverOn]} accessible accessibilityLabel={`${g}: ${on ? 'covered' : 'not covered'}`}>
                  <Text style={[styles.coverText, on && styles.coverTextOn]}>{g}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.inline}>
            <Text style={[styles.section, styles.flex]}>{`Sample Topics (${covered.includes('S4') ? 'S4' : covered.at(-1) ?? ''})`}</Text>
            <Pressable onPress={() => setTab('Learning Objectives')} accessibilityRole="link" accessibilityLabel="View all topics">
              <Text style={styles.link}>View All</Text>
            </Pressable>
          </View>
          {(extra?.topics ?? ['Core concepts', 'Applications', 'Problem solving', 'Practical work', 'Revision and past papers']).map((t) => (
            <Pressable key={t} style={styles.topic} onPress={() => toast(`${t}: objectives, lessons and linked past-paper questions.`)} accessibilityRole="button" accessibilityLabel={t}>
              <Icon name="doc" size={15} color={BLUE} />
              <Text style={[styles.topicText, styles.flex]}>{t}</Text>
              <Icon name="chevronRight" size={13} color={BLUE} />
            </Pressable>
          ))}
        </>
      ) : (
        <Text style={styles.body}>{tab === 'Past Papers' ? `${s.papers.toLocaleString('en-US')} papers with marking guides, ${f.paperYears}.` : tab === 'Resources' ? `${s.resources.toLocaleString('en-US')} lessons, notes and videos.` : `${covered.length} grades × about 12 objectives each, tagged to lessons and questions.`}</Text>
      )}
      <View style={styles.inline}>
        <PrimaryBtn label="View Full Syllabus" onPress={() => toast(`Opening the ${f.short} ${s.name} syllabus (${s.levels}).`)} style={styles.flex} />
        <OutlineBtn label="Download Template" icon="download" onPress={() => toast(`${f.short}-${s.name.replace(/\s+/g, '-')}-template.xlsx: units, objectives and tags.`)} style={styles.flex} />
      </View>
    </Card>
  );
}

function AddSubjectModal({ u, k }: { u: U; k: K }) {
  const [name, setName] = useState('');
  const [cat, setCat] = useState('STEM');
  const [lv, setLv] = useState('S1 – S6');
  const ranges = ['P1 – P7', 'S1 – S4', 'S1 – S6', 'S5 – S6', 'P1 – S6'];
  return (
    <Modal visible={u.adding} transparent animationType="fade" onRequestClose={() => u.setAdding(false)}>
      <View style={styles.backdrop}>
        <View style={styles.modal} accessibilityViewIsModal>
          <Text style={styles.modalTitle}>{`Add a subject to ${u.framework.short}`}</Text>
          <Text style={styles.label}>Subject name</Text>
          <TextInput style={styles.field} value={name} onChangeText={setName} placeholder="e.g. Kiswahili" placeholderTextColor={MUTED} accessibilityLabel="Subject name" />
          <Text style={styles.label}>Category</Text>
          <CmdSelect value={cat} options={k.categories.slice(1)} onChange={setCat} label="Category" />
          <Text style={styles.label}>Levels</Text>
          <CmdSelect value={lv} options={ranges} onChange={setLv} label="Levels" />
          <View style={styles.inline}>
            <Btn label="Cancel" kind="outline" onPress={() => u.setAdding(false)} height={44} style={styles.flex} />
            <Btn label="Add Subject" onPress={() => u.add(name, cat, lv)} height={44} style={styles.flex} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Maple Command › Global Curriculum & Living Past-Paper Master Taxonomies on the desktop reference. */
export function CurriculaDesk({ c }: { c: CommandData }) {
  const k = c.curricula;
  const u = useCurricula(k, c.me.name);
  return (
    <CommandDesk me={c.me} search="Search curricula, subjects, grades, or past papers..." active="Curricula">
      <CmdHead
        icon="library"
        title="Global Curriculum & Living Past-Paper Master Taxonomies"
        subtitle="Manage shared national curriculum templates, subject taxonomies, and living past-paper banks for schools and teachers to clone from."
        right={<PrimaryBtn label="Add Curriculum" icon="plus" chevron onPress={() => toast('Add a framework: board, grades, subjects; import a syllabus PDF or spreadsheet.')} />}
      />
      <View style={styles.kpis}>
        {k.stats.map((x) => (
          <CmdStat key={x.label} k={x} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <View style={styles.colList}>
          <FrameworkList u={u} />
        </View>
        <View style={styles.flex}>
          <Card style={styles.mid}>
            <FrameworkHead u={u} />
          </Card>
          <View style={[styles.row, styles.midRow]}>
            <View style={styles.flex}>
              <SubjectsTable k={k} u={u} />
            </View>
            <View style={styles.colPreview}>
              <SubjectPreview k={k} u={u} />
            </View>
          </View>
        </View>
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      <AddSubjectModal u={u} k={k} />
    </CommandDesk>
  );
}

/** The phone version: framework chips, its header and stats, subjects as a list; tapping one previews it. */
export function CurriculaPhone({ c }: { c: CommandData }) {
  const k = c.curricula;
  const u = useCurricula(k, c.me.name);
  const [view, setView] = useState<'list' | 'subject'>('list');
  if (view === 'subject') {
    return (
      <CommandPhone key="subject" me={c.me}>
        <PageHead title={u.subject?.name ?? 'Subject'} subtitle={`${u.framework.short} • ${u.subject?.levels ?? ''}`} phone onBack={() => setView('list')} />
        <SubjectPreview k={k} u={u} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Curricula" subtitle="Shared national templates schools and teachers clone from." phone />
      <KpiGrid items={k.stats.slice(0, 4)} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fwChipsRow}>
        {k.frameworks.map((f) => {
          const on = f.id === u.framework.id;
          return (
            <Pressable key={f.id} style={[styles.fwChip, on && styles.fwChipOn]} onPress={() => u.pickFramework(f.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={f.name}>
              <Crest src={f.crest} size={26} />
              <Text style={[styles.fwChipText, on && styles.fwChipTextOn]}>{f.short}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Card style={styles.mid}>
        <FrameworkHead u={u} phone />
      </Card>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={k.tabs.map((label) => ({ label }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      {u.tab === 'Subjects' ? (
        <>
          <Search placeholder="Search subjects" value={u.query} onChange={u.setQuery} />
          <View style={styles.inline}>
            <View style={styles.flex}>
              <CmdSelect value={u.level} options={u.levels} onChange={u.setLevel} label="Level" />
            </View>
            <View style={styles.flex}>
              <CmdSelect value={u.category} options={u.categories} onChange={u.setCategory} label="Category" />
            </View>
          </View>
          {u.rows.map((s) => (
            <Pressable
              key={s.name}
              style={styles.subjectCard}
              onPress={() => {
                u.setSubjectName(s.name);
                setView('subject');
              }}
              accessibilityRole="button"
              accessibilityLabel={`${s.name}, ${s.category}, ${s.levels}`}>
              <View style={styles.flex}>
                <Text style={styles.subjectLink}>{s.name}</Text>
                <Text style={styles.small}>{`${s.levels} • ${s.resources.toLocaleString('en-US')} resources • ${s.papers.toLocaleString('en-US')} papers`}</Text>
              </View>
              <Pill label={s.category} tone={CATEGORY_TONE[s.category] ?? 'grey'} size={11} />
            </Pressable>
          ))}
          <PageStrip label={`${u.shown.length} subjects`} page={u.page} pages={u.pages} onPage={u.setPage} />
          <PrimaryBtn label="Add Subject" icon="plus" onPress={() => u.setAdding(true)} />
        </>
      ) : (
        <Card style={styles.tableCard}>
          <OtherTab k={k} u={u} />
        </Card>
      )}
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      <AddSubjectModal u={u} k={k} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  midRow: { marginTop: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pushRight: { marginLeft: 'auto' },
  noWrap: { flexWrap: 'nowrap' },
  small: { fontSize: 11.5, color: BODY },
  tiny: { fontSize: 10.5, color: BODY },
  body: { fontSize: 12.5, lineHeight: 18, color: BODY },
  link: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  panelTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  section: { fontSize: 14, fontWeight: '800', color: NAVY },
  colList: { width: 316 },
  colPreview: { width: 318 },
  list: { gap: 10, padding: 12 },
  fw: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  fwOn: { borderColor: BLUE, borderLeftWidth: 4, backgroundColor: Maple.blueSoft },
  fwName: { fontSize: 14, fontWeight: '700', color: BLUE },
  fwChips: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  chip: { flexShrink: 0, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Maple.blueSelected, fontSize: 11, color: NAVY },
  mid: { padding: 14 },
  fwHead: { gap: 10 },
  fwTitle: { fontSize: 20, fontWeight: '800', color: NAVY },
  fwStats: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: LINE },
  fwStatsPhone: { flexWrap: 'wrap' },
  fwStat: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRightWidth: 1, borderColor: LINE },
  fwStatPhone: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderColor: LINE },
  fwStatValue: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  tableCard: { gap: 10, padding: 12 },
  addBtn: { height: 38 },
  subjectLink: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gradeBox: { width: 92, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  gradeName: { fontSize: 15, fontWeight: '800', color: NAVY },
  listGap: { gap: 8 },
  preview: { gap: 10, padding: 12 },
  sigma: { width: 50, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSoft },
  previewName: { fontSize: 17, fontWeight: '800', color: BLUE },
  previewStats: { flexDirection: 'row', gap: 6 },
  previewStat: { flex: 1, minWidth: 0, padding: 7, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  previewValue: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  coverage: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  coverChip: { width: 36, paddingVertical: 5, borderRadius: 6, alignItems: 'center', backgroundColor: Maple.blueSoft },
  coverOn: { backgroundColor: Maple.blueSelected },
  coverText: { fontSize: 11.5, color: MUTED },
  coverTextOn: { color: BLUE, fontWeight: '700' },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  topicText: { fontSize: 12, color: NAVY },
  fwChipsRow: { gap: 8 },
  fwChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  fwChipOn: { borderColor: BLUE, backgroundColor: Maple.blueSoft },
  fwChipText: { fontSize: 13, fontWeight: '600', color: NAVY },
  fwChipTextOn: { color: BLUE },
  subjectCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  modal: { width: '100%', maxWidth: 420, gap: 8, padding: 20, borderRadius: 16, backgroundColor: WHITE },
  modalTitle: { fontSize: 18, fontWeight: '800', color: NAVY },
  label: { marginTop: 4, fontSize: 13, fontWeight: '600', color: NAVY },
  field: { height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY },
});
