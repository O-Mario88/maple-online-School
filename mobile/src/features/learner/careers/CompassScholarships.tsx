import { Image } from '@/components/picture';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import type { IconName } from '@/lib/icons';
import type { Scholarship } from '@/mock/career-compass';

import { cs, BRAND_SOFT, BRAND_BLUE, shortDate } from './CareerParts';
import { Pager, PurpleHero, SideCard } from './CompassCards';
import { paginate, STUDY_LEVELS } from './directory';
import { toggleScholarship, toggleScholarshipPlan } from './saved';
import { filterScholarships, forMe, isOpen, levelCounts, NO_SCHOLARSHIP_FILTERS, type ScholarshipFilters, sortScholarships } from './scholarships';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

type Tab = 'all' | 'forMe' | 'saved' | 'applications';
const PAGE = 4;
const TYPES = ['Full tuition', 'Partial tuition', 'Grant'] as const;
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const toggle = (xs: readonly string[], v: string) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]);

function useScholarshipsPage(x: Compass) {
  const [tab, setTabState] = useState<Tab>('all');
  const [f, setF] = useState<ScholarshipFilters>(NO_SCHOLARSHIP_FILTERS);
  const [sort, setSort] = useState<'deadline' | 'az'>('deadline');
  const [page, setPage] = useState(1);
  const [openSections, setOpenSections] = useState<readonly string[]>(['level', 'area']);
  const all = x.cc.scholarships;
  const linked = [...x.savedPrograms, ...x.goalPrograms].flatMap((p) => p.scholarshipIds);
  const mine = forMe(all, { areas: x.areaScores.slice(0, 3).map((a) => a.area), linked }, x.today);
  const base: Record<Tab, readonly Scholarship[]> = {
    all,
    forMe: mine,
    saved: all.filter((s) => x.saves.scholarships.includes(s.id)),
    applications: all.filter((s) => x.saves.scholarshipPlans.includes(s.id)),
  };
  const shown = sortScholarships(filterScholarships(base[tab], f, x.today), sort);
  const set = (patch: Partial<ScholarshipFilters>) => {
    setF({ ...f, ...patch });
    setPage(1);
  };
  const setTab = (t: Tab) => {
    setTabState(t);
    setPage(1);
  };
  const planApp = (s: Scholarship) => {
    if (x.saves.scholarshipPlans.includes(s.id)) return setTab('applications');
    toggleScholarshipPlan(s.id);
    x.plan(`Apply for the ${s.title}`, s.deadline);
  };
  return { tab, setTab, f, set, clear: () => set(NO_SCHOLARSHIP_FILTERS), sort, setSort, pageInfo: paginate(shown, page, PAGE), setPage, counts: { all: all.length, forMe: mine.length, saved: base.saved.length, applications: base.applications.length }, levels: levelCounts(all, x.today), openSections, setOpenSections, planApp };
}
type SP = ReturnType<typeof useScholarshipsPage>;

function Tabs({ p, phone }: { p: SP; phone: boolean }) {
  const tabs: readonly { key: Tab; label: string; icon: IconName }[] = [
    { key: 'all', label: `All Scholarships (${p.counts.all})`, icon: 'trophy' },
    { key: 'forMe', label: `For Me (${p.counts.forMe})`, icon: 'person' },
    { key: 'saved', label: `Saved (${p.counts.saved})`, icon: 'bookmark' },
    { key: 'applications', label: `My Applications (${p.counts.applications})`, icon: 'clipboard' },
  ];
  const row = (
    <View style={[s.tabs, !phone && s.tabsD]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = p.tab === t.key;
        return (
          <Pressable key={t.key} style={s.tab} onPress={() => p.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={17} color={on ? BRAND_BLUE : L.ink} />
            <Text style={[s.tabText, on && s.tabOn]}>{t.label}</Text>
            {on ? <View style={s.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  ) : (
    row
  );
}

function Check({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={s.check} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <View style={[s.box, on && s.boxOn]}>{on ? <Icon name="tick" size={12} color={L.white} /> : null}</View>
      <Text style={s.checkText}>{label}</Text>
    </Pressable>
  );
}

function Group({ id, title, p, children }: { id: string; title: string; p: SP; children: ReactNode }) {
  const open = p.openSections.includes(id);
  return (
    <View style={s.group}>
      <Pressable style={s.groupHead} onPress={() => p.setOpenSections(toggle(p.openSections, id))} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={s.groupTitle}>{title}</Text>
        <Icon name="chevronDown" size={15} color={L.navy} />
      </Pressable>
      {open ? <View style={s.groupBody}>{children}</View> : null}
    </View>
  );
}

function FilterPanel({ x, p }: { x: Compass; p: SP }) {
  return (
    <View style={s.panel}>
      <View style={s.panelHead}>
        <Text style={s.sideTitle}>Filter Scholarships</Text>
        <Pressable onPress={p.clear} accessibilityRole="button">
          <Text style={s.link}>Clear All</Text>
        </Pressable>
      </View>
      <Group id="level" title="Study Level" p={p}>
        {STUDY_LEVELS.map((lv) => (
          <Check key={lv} label={`${lv} (${p.levels[lv] ?? 0})`} on={p.f.levels.includes(lv)} onPress={() => p.set({ levels: toggle(p.f.levels, lv) })} />
        ))}
      </Group>
      <Group id="area" title="Study Area" p={p}>
        <Check label="All Areas" on={p.f.areas.length === 0} onPress={() => p.set({ areas: [] })} />
        {x.cc.areas.map((a) => (
          <Check key={a.id} label={a.label} on={p.f.areas.includes(a.id)} onPress={() => p.set({ areas: toggle(p.f.areas, a.id) })} />
        ))}
      </Group>
      <Group id="type" title="Funding Type" p={p}>
        {TYPES.map((t) => (
          <Check key={t} label={t} on={p.f.types.includes(t)} onPress={() => p.set({ types: toggle(p.f.types, t) })} />
        ))}
      </Group>
      <Group id="deadline" title="Application Deadline" p={p}>
        {(
          [
            ['all', 'Any time'],
            ['quarter', 'In the next 3 months'],
            ['later', 'Later'],
          ] as const
        ).map(([v, label]) => (
          <Check key={v} label={label} on={p.f.deadline === v} onPress={() => p.set({ deadline: v })} />
        ))}
      </Group>
    </View>
  );
}

function Row({ x, sch, p }: { x: Compass; sch: Scholarship; p: SP }) {
  const open = isOpen(sch, x.today);
  const saved = x.saves.scholarships.includes(sch.id);
  const planned = x.saves.scholarshipPlans.includes(sch.id);
  const area = x.cc.areas.find((a) => a.id === sch.area)?.label;
  return (
    <View style={s.row}>
      <View style={[s.iconTile, { backgroundColor: sch.tint }]}>
        <Icon name={sch.icon} size={26} color={sch.color} />
      </View>
      <View style={s.flex}>
        <Text style={s.title}>{sch.title}</Text>
        <View style={s.inline}>
          <Icon name="building" size={13} color={L.ink} />
          <Text style={cs.small}>{`${sch.provider}  |  ${sch.amount}`}</Text>
        </View>
        <Text style={cs.body}>{sch.eligibility}</Text>
        <View style={s.tags}>
          <Text style={s.tag}>{sch.level}</Text>
          {area ? <Text style={[s.tag, s.tagBlue]}>{area}</Text> : null}
        </View>
      </View>
      <View style={s.rowSide}>
        <View style={s.inline}>
          <Text style={[s.status, open ? s.statusOpen : s.statusClosed]}>{open ? 'Open' : 'Closed'}</Text>
          <Pressable onPress={() => toggleScholarship(sch.id)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={saved ? `Remove ${sch.title} from saved` : `Save ${sch.title}`}>
            <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={18} color={saved ? BRAND_BLUE : L.navy} />
          </Pressable>
        </View>
        <View style={s.inline}>
          <Icon name="calendar" size={13} color={L.navy} />
          <Text style={s.deadline}>{`Deadline: ${shortDate(sch.deadline)}`}</Text>
        </View>
        {open ? (
          <Pressable style={[s.plan, planned && s.planned]} onPress={() => p.planApp(sch)} accessibilityRole="button" accessibilityLabel={planned ? `${sch.title} is in My Applications` : `Plan my application: ${sch.title}`}>
            {planned ? <Icon name="tick" size={13} color={Maple.successText} /> : null}
            <Text style={[s.planText, planned && s.plannedText]}>{planned ? 'In My Applications' : 'Plan My Application'}</Text>
            {!planned ? <Icon name="arrowRight" size={13} color={BRAND_BLUE} /> : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function List({ x, p, phone }: { x: Compass; p: SP; phone: boolean }) {
  const empty: Record<Tab, string> = {
    all: 'No scholarships match these filters.',
    forMe: 'Save programs or take the interest assessment to see scholarships for you.',
    saved: 'Bookmark scholarships to keep them here.',
    applications: 'Choose “Plan My Application” on a scholarship to track it here.',
  };
  return (
    <View style={s.stack}>
      <View style={[s.listHead, phone && s.listHeadP]}>
        <Text style={s.count}>{`${p.pageInfo.total} Scholarships`}</Text>
        <View style={s.inline}>
          <Text style={cs.small}>Sort by:</Text>
          <Picker
            compact
            label="Sort by"
            icon="filter"
            value={p.sort}
            options={[
              { value: 'deadline', label: 'Deadline (Soonest)' },
              { value: 'az', label: 'Name A–Z' },
            ]}
            onChange={p.setSort}
          />
        </View>
      </View>
      {p.pageInfo.items.length ? (
        p.pageInfo.items.map((sch) => <Row key={sch.id} x={x} sch={sch} p={p} />)
      ) : (
        <View style={s.empty}>
          <Text style={cs.body}>{empty[p.tab]}</Text>
        </View>
      )}
      <Pager info={p.pageInfo} noun="scholarships" onPage={p.setPage} />
      <Text style={cs.note}>Eligibility shown here is a summary. Check the full rules with each provider, and never pay anyone to apply for a scholarship.</Text>
    </View>
  );
}

function Planner({ x, p, phone }: { x: Compass; p: SP; phone: boolean }) {
  return (
    <View style={[s.planner, !phone && s.plannerD]}>
      <View style={s.flex}>
        <View style={s.inline}>
          <Icon name="calendar" size={22} color={BRAND_BLUE} />
          <Text style={s.sideTitle}>Scholarship Planner</Text>
        </View>
        <Text style={[cs.body, s.gap]}>Track, prepare and manage all your scholarship applications in one place.</Text>
        <Pressable style={s.cta} onPress={() => p.setTab('applications')} accessibilityRole="button">
          <Text style={s.ctaText}>{p.counts.applications ? 'Open My Plan' : 'Create My Plan'}</Text>
          <Icon name="arrowRight" size={14} color={L.white} />
        </Pressable>
      </View>
      {!phone ? <Image source={x.cc.photos.art.planner} style={s.plannerArt} contentFit="contain" /> : null}
    </View>
  );
}

function Side({ x, p }: { x: Compass; p: SP }) {
  const next = sortScholarships(
    x.cc.scholarships.filter((sch) => isOpen(sch, x.today)),
    'deadline',
  ).slice(0, 3);
  return (
    <>
      <SideCard title="Upcoming Deadlines" icon="calendar">
        {next.map((sch) => {
          const [, m, d] = sch.deadline.split('-').map(Number);
          return (
            <View key={sch.id} style={s.dl}>
              <View style={s.date}>
                <Text style={s.dateMon}>{MON[m - 1]}</Text>
                <Text style={s.dateDay}>{d}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.dlTitle}>{sch.title}</Text>
                <Text style={cs.small}>{sch.provider}</Text>
              </View>
            </View>
          );
        })}
        <Pressable
          style={s.inline}
          onPress={() => {
            p.setTab('all');
            p.setSort('deadline');
          }}
          accessibilityRole="link">
          <Text style={s.link}>View All Deadlines</Text>
          <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
        </Pressable>
      </SideCard>
      <View style={s.help}>
        <View style={s.helpHead}>
          <View style={s.flex}>
            <View style={s.inline}>
              <Icon name="headset" size={22} color={BRAND_BLUE} />
              <Text style={s.sideTitle}>Need Help?</Text>
            </View>
            <Text style={cs.small}>Get guidance on eligibility, required documents and a strong application.</Text>
          </View>
          <Image source={x.cc.photos.art.help} style={s.helpArt} contentFit="contain" />
        </View>
        <Pressable
          style={s.helpBtn}
          onPress={() => {
            x.setTopic('Scholarships and funding');
            x.setTab('counselor');
          }}
          accessibilityRole="button">
          <Text style={s.planText}>Book a Counselor Session</Text>
          <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
        </Pressable>
      </View>
      <SideCard title="Scholarship Tips" icon="bulb">
        {['Check eligibility requirements early.', 'Prepare your documents on time.', 'Write a clear and honest personal statement.', 'Keep track of all your deadlines.'].map((t) => (
          <View key={t} style={s.tip}>
            <Icon name="sealCheck" size={18} color={Maple.successText} />
            <Text style={[cs.body, s.flex]}>{t}</Text>
          </View>
        ))}
      </SideCard>
    </>
  );
}

/** Scholarships (its reference): find funding, filter it, save it and plan applications, each deadline added to My Plan. */
export function ScholarshipsSection({ x, phone }: { x: Compass; phone: boolean }) {
  const p = useScholarshipsPage(x);
  const hero = (
    <PurpleHero
      phone={phone}
      kicker="Scholarships"
      icon="trophy"
      title="Find Funding for Your Education"
      sub="Discover scholarships, grants and bursaries that match your goals, programs and background, and plan your applications with ease."
      photo={x.cc.photos.heroes.scholarships}
      buttons={[
        {
          label: 'Search Scholarships',
          icon: 'search',
          onPress: () => {
            p.setTab('all');
            p.clear();
          },
        },
        { label: 'My Applications', icon: 'calendar', onPress: () => p.setTab('applications') },
      ]}
    />
  );
  if (phone)
    return (
      <View style={s.stack}>
        {hero}
        <Planner x={x} p={p} phone />
        <Tabs p={p} phone />
        <FilterPanel x={x} p={p} />
        <List x={x} p={p} phone />
        <Side x={x} p={p} />
      </View>
    );
  return (
    <View style={s.stack}>
      <View style={s.topRow}>
        <View style={s.flex}>{hero}</View>
        <Planner x={x} p={p} phone={false} />
      </View>
      <Tabs p={p} phone={false} />
      <View style={s.cols}>
        <FilterPanel x={x} p={p} />
        <View style={s.flex}>
          <List x={x} p={p} phone={false} />
        </View>
        <View style={s.right}>
          <Side x={x} p={p} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gap: { marginVertical: 8 },
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  topRow: { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  right: { width: 330, gap: 18 },
  tabs: { flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: L.line },
  tabsD: { paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  tab: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  tabText: { fontSize: 14.5, fontWeight: '600', color: L.ink },
  tabOn: { fontWeight: '800', color: BRAND_BLUE },
  tabLine: { position: 'absolute', left: 8, right: 8, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  panel: { width: 250, gap: 4, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  group: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  groupTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  groupBody: { gap: 2, marginTop: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  box: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1.5, borderColor: Maple.faint },
  boxOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  checkText: { flex: 1, fontSize: 13, color: L.ink },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  listHeadP: { flexWrap: 'wrap' },
  count: { fontSize: 21, fontWeight: '800', color: L.navy },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  iconTile: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  title: { fontSize: 16.5, fontWeight: '800', color: L.navy, marginBottom: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, fontSize: 11.5, fontWeight: '600', color: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  tagBlue: { color: Maple.blue, backgroundColor: Maple.blueSoft },
  rowSide: { gap: 10, alignItems: 'flex-start' },
  status: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  statusOpen: { color: Maple.successText, backgroundColor: Maple.successSoft },
  statusClosed: { color: Maple.secondary, backgroundColor: Maple.blueSoft },
  deadline: { fontSize: 13, fontWeight: '500', color: L.navy },
  plan: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1.5, borderColor: BRAND_BLUE },
  planned: { borderColor: '#BBE5C8', backgroundColor: Maple.successSoft },
  planText: { fontSize: 13.5, fontWeight: '700', color: BRAND_BLUE },
  plannedText: { color: Maple.successText },
  empty: { padding: 24, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideTitle: { fontSize: 17, fontWeight: '800', color: L.navy },
  link: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  planner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  plannerD: { width: 370 },
  plannerArt: { width: 110, height: 150 },
  cta: { alignSelf: 'flex-start', height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  ctaText: { fontSize: 14, fontWeight: '700', color: L.white },
  dl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  date: { width: 46, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  dateMon: { fontSize: 11, fontWeight: '700', color: BRAND_BLUE },
  dateDay: { fontSize: 18, fontWeight: '800', color: L.navy },
  dlTitle: { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
  help: { gap: 12, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  helpHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  helpArt: { width: 80, height: 96 },
  helpBtn: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE, backgroundColor: L.white },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
});
