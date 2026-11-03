import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { BLUE, BODY, type Home, HomeHeader, HomeSidebar, INK } from '@/features/learner/home/HomeFrame';
import { TONES } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { continueLearning, type Curriculum, filterCourses, goalsDone, justForYou, type Kind, liveNow, toggleGoal, upcoming } from './explore';

export type ExploreData = MockData['learner']['explore'];
type Course = ExploreData['catalogue'][number];
type Live = ExploreData['sessions'][number];

/** The explore page is laid out at the library reference's width (sidebar included) and scaled. */
export const EXPLORE_REF_WIDTH = 1276;
const NAVY = '#0B2A6B';
const LINE = '#E8EDF4';
const POPULAR = 4;

const time = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const dayTime = (iso: string, now: string) => `${iso.slice(0, 10) === now.slice(0, 10) ? 'Today' : 'Tomorrow'}, ${time(iso)}`;
const price = (n: number) => (n ? `UGX ${n.toLocaleString('en-US')}` : 'Free');

export function useExplore(d: ExploreData) {
  const [curriculum, setCurriculum] = useState<Curriculum>(d.myCurriculum);
  const [kind, setKind] = useState<Kind | undefined>(undefined);
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [goals, setGoals] = useState(d.goals);
  const popular = useMemo(() => filterCourses(d.catalogue, { curriculum, kind, subject, query }), [d.catalogue, curriculum, kind, subject, query]);
  const resume = continueLearning(d.catalogue);
  const forYou = justForYou(d.catalogue, d.myCurriculum, d.weakest).slice(0, 3);
  const now = liveNow(d.sessions, d.NOW);
  const next = upcoming(d.sessions, d.NOW).slice(0, 3);
  const g = goalsDone(goals);
  const count = (k: Kind) => d.catalogue.filter((c) => c.kind === k && c.curriculum === curriculum).length;
  const subjectCount = (s: string) => d.catalogue.filter((c) => c.subject === s && c.curriculum === curriculum).length;
  const pickKind = (k: Kind) => setKind((x) => (x === k ? undefined : k));
  const pickSubject = (s: string) => setSubject((x) => (x === s ? undefined : s));
  const flip = (id: string) => {
    const updated = toggleGoal(goals, id);
    setGoals(updated);
    const r = goalsDone(updated);
    if (r.done === r.total) toast("All of today's goals done. Great work!");
  };
  const open = (c: Course) => router.push(c.href);
  const join = (s: Live) => {
    toast(`Joining ${s.title} with ${s.teacher}…`);
    router.push('/learn/live-room');
  };
  const remind = (s: Live) => toast(`We will remind you 10 minutes before ${s.title} (${dayTime(s.start, d.NOW)}).`);
  const filters = [kind, subject, query.trim() && `“${query.trim()}”`].filter(Boolean).join(' • ');
  const reset = () => {
    setKind(undefined);
    setSubject(undefined);
    setQuery('');
  };
  return { d, curriculum, setCurriculum, kind, pickKind, subject, pickSubject, query, setQuery, goals, flip, g, popular, resume, forYou, now, next, count, subjectCount, open, join, remind, filters, reset };
}
type U = ReturnType<typeof useExplore>;

function Head({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) {
  return (
    <View style={styles.head}>
      <Text style={styles.headTitle} accessibilityRole="header">
        {title}
      </Text>
      {link ? (
        <Pressable onPress={onLink} accessibilityRole="link" hitSlop={6}>
          <Text style={styles.headLink}>{`${link} →`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Curricula({ u }: { u: U }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {u.d.curricula.map((c) => {
        const on = c === u.curriculum;
        return (
          <Pressable key={c} style={[styles.chip, on && styles.chipOn]} onPress={() => u.setCurriculum(c)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Hero({ u, name }: { u: U; name: string }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroHi}>{`Hello, ${name}`}</Text>
      <Text style={styles.heroTitle} accessibilityRole="header">
        Explore & Learn
      </Text>
      <Text style={styles.heroSub}>Courses, past papers, live classes and practice for your curriculum.</Text>
      <View style={styles.heroSearch}>
        <Icon name="search" size={16} color={BLUE} />
        <TextInput style={styles.heroInput} value={u.query} onChangeText={u.setQuery} placeholder="What do you want to learn today?" placeholderTextColor="#6B7385" accessibilityLabel="Search courses" />
      </View>
      <Curricula u={u} />
    </View>
  );
}

function Categories({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <View style={[styles.cats, phone && styles.catsPhone]}>
      {u.d.categories.map((c) => {
        const t = TONES[c.tone];
        const on = u.kind === c.kind;
        return (
          <Pressable key={c.kind} style={[styles.cat, phone && styles.catPhone, { backgroundColor: t.soft + 'B0', borderColor: on ? t.solid : t.soft }]} onPress={() => u.pickKind(c.kind)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${c.kind}: ${c.note}`}>
            <View style={[styles.catIcon, { backgroundColor: t.solid }]}>
              <Icon name={c.icon} size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.catTitle}>{c.kind}</Text>
            {phone ? null : (
              <Text style={styles.catNote} numberOfLines={2}>
                {c.note}
              </Text>
            )}
            <Text style={[styles.catCount, { color: t.text }]}>{u.count(c.kind) ? `${u.count(c.kind)} in ${u.curriculum}` : 'Browse all'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CourseCard({ c, onPress, wide = false }: { c: Course; onPress: () => void; wide?: boolean }) {
  return (
    <Pressable style={[styles.course, wide && styles.courseWide]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${c.title} by ${c.teacher}`}>
      <Image source={c.photo} style={styles.coursePhoto} contentFit="cover" accessibilityIgnoresInvertColors />
      <View style={styles.courseBadge}>
        <Text style={styles.courseBadgeText}>{`${c.curriculum} • ${c.level}`}</Text>
      </View>
      <View style={styles.courseBody}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {c.title}
        </Text>
        <View style={styles.inline}>
          <Image source={c.face} style={styles.face} contentFit="cover" />
          <Text style={styles.small} numberOfLines={1}>
            {c.teacher}
          </Text>
        </View>
        <View style={styles.inline}>
          <Icon name="star" size={12} color="#F5B731" />
          <Text style={styles.small}>{`${c.rating} • ${c.learners.toLocaleString('en-US')} learners`}</Text>
        </View>
        <View style={styles.courseFoot}>
          <Text style={styles.price}>{price(c.priceUGX)}</Text>
          <Text style={styles.cta}>{c.progress > 0 ? 'Continue' : c.kind === 'Courses' ? 'Enrol' : 'Open'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Popular({ u, phone = false }: { u: U; phone?: boolean }) {
  const list = u.popular.slice(0, phone ? 8 : POPULAR);
  const category = u.d.categories.find((c) => c.kind === u.kind);
  return (
    <View style={phone ? styles.phoneBlock : styles.card}>
      <Head title={u.filters ? `In ${u.curriculum}: ${u.filters}` : 'Popular Courses for You'} link={u.filters ? 'Clear' : undefined} onLink={u.filters ? u.reset : undefined} />
      {list.length === 0 ? <Text style={styles.empty}>{`Nothing matches in ${u.curriculum} yet. Try another curriculum or clear the filters.`}</Text> : null}
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowGap}>
          {list.map((c) => (
            <CourseCard key={c.id} c={c} onPress={() => u.open(c)} wide />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.rowGap}>
          {list.map((c) => (
            <CourseCard key={c.id} c={c} onPress={() => u.open(c)} />
          ))}
        </View>
      )}
      {category ? (
        <Pressable onPress={() => router.push(category.href)} accessibilityRole="link">
          <Text style={styles.headLink}>{`Open all ${category.kind.toLowerCase()} →`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Resume({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <View style={phone ? styles.phoneBlock : styles.card}>
      <Head title="Continue Learning" link="My Courses" onLink={() => router.push('/learn/course')} />
      {u.resume.map((c) => (
        <Pressable key={c.id} style={styles.resume} onPress={() => u.open(c)} accessibilityRole="button" accessibilityLabel={`Continue ${c.title}, ${Math.round(c.progress * 100)}% done`}>
          <Image source={c.photo} style={styles.resumePhoto} contentFit="cover" />
          <View style={styles.flex}>
            <Text style={styles.resumeTitle} numberOfLines={1}>
              {c.title}
            </Text>
            <Text style={styles.small}>{`${c.teacher} • ${Math.round(c.lessons * c.progress)} of ${c.lessons} lessons`}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(c.progress * 100)}%` }]} />
            </View>
          </View>
          <Text style={styles.pct}>{`${Math.round(c.progress * 100)}%`}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Subjects({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <View style={phone ? styles.phoneBlock : styles.card}>
      <Head title="Explore by Subject" />
      <View style={styles.subjects}>
        {u.d.subjects.map((s) => {
          const t = TONES[s.tone];
          const on = u.subject === s.name;
          return (
            <Pressable key={s.name} style={[styles.subject, { backgroundColor: t.soft + 'B0', borderColor: on ? t.solid : t.soft }]} onPress={() => u.pickSubject(s.name)} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <Icon name={s.icon} size={20} color={t.solid} />
              <Text style={styles.subjectName} numberOfLines={1}>
                {s.name}
              </Text>
              <Text style={styles.small}>{`${u.subjectCount(s.name)} offerings`}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Today({ u }: { u: U }) {
  return (
    <View style={styles.side}>
      <Head title="Today's Learning" />
      <View style={styles.todayTop}>
        <View style={styles.ring}>
          <Text style={styles.ringText}>{`${u.g.done}/${u.g.total}`}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.resumeTitle}>{u.g.done === u.g.total ? 'All goals done!' : `${u.g.total - u.g.done} goal${u.g.total - u.g.done === 1 ? '' : 's'} to go`}</Text>
          <Text style={styles.small}>{`${u.g.pct}% of today's plan`}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, styles.fillGreen, { width: `${u.g.pct}%` }]} />
          </View>
        </View>
      </View>
      {u.goals.map((g) => (
        <Pressable key={g.id} style={styles.goal} onPress={() => u.flip(g.id)} accessibilityRole="checkbox" accessibilityState={{ checked: g.done }} accessibilityLabel={g.label}>
          <View style={[styles.box, g.done && styles.boxOn]}>{g.done ? <Icon name="check" size={12} color="#FFFFFF" /> : null}</View>
          <Text style={[styles.goalText, g.done && styles.goalDone]}>{g.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function LiveNow({ u }: { u: U }) {
  const s = u.now[0];
  return (
    <View style={styles.side}>
      <View style={styles.inline}>
        <View style={styles.liveDot} />
        <Text style={styles.headTitle}>Live Now</Text>
      </View>
      {s ? (
        <>
          <Image source={s.photo} style={styles.livePhoto} contentFit="cover" />
          <Text style={styles.resumeTitle}>{s.title}</Text>
          <Text style={styles.small}>{`${s.teacher} • ${s.subject} • ${s.attendees} watching`}</Text>
          <Pressable style={styles.join} onPress={() => u.join(s)} accessibilityRole="button" accessibilityLabel={`Join ${s.title}`}>
            <Icon name="live" size={14} color="#FFFFFF" />
            <Text style={styles.joinText}>Join Live Class</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.small}>No class is live right now. See what is coming up below.</Text>
      )}
    </View>
  );
}

function Upcoming({ u }: { u: U }) {
  return (
    <View style={styles.side}>
      <Head title="Upcoming Live Classes" link="All" onLink={() => router.push('/learn/live')} />
      {u.next.map((s) => (
        <View key={s.id} style={styles.up}>
          <Image source={s.photo} style={styles.upPhoto} contentFit="cover" />
          <View style={styles.flex}>
            <Text style={styles.upTitle} numberOfLines={2}>
              {s.title}
            </Text>
            <Text style={styles.small}>{`${dayTime(s.start, u.d.NOW)} • ${s.teacher}`}</Text>
          </View>
          <Pressable onPress={() => u.remind(s)} accessibilityRole="button" accessibilityLabel={`Remind me about ${s.title}`} hitSlop={6}>
            <Icon name="bell" size={16} color={BLUE} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function ForYou({ u }: { u: U }) {
  return (
    <View style={styles.side}>
      <Head title="Just for You" />
      <Text style={styles.small}>{`Picked for ${u.d.myCurriculum} from the subjects you are working to improve.`}</Text>
      {u.forYou.map((c) => (
        <Pressable key={c.id} style={styles.up} onPress={() => u.open(c)} accessibilityRole="button" accessibilityLabel={c.title}>
          <Image source={c.photo} style={styles.upPhoto} contentFit="cover" />
          <View style={styles.flex}>
            <Text style={styles.upTitle} numberOfLines={2}>
              {c.title}
            </Text>
            <Text style={styles.small}>{`${c.subject} • ${price(c.priceUGX)}`}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/** Explore & Learn on the desktop reference: the learner sidebar and header, the catalogue and the day's plan. */
export function ExploreDesk({ d, h }: { d: ExploreData; h: Home }) {
  const u = useExplore(d);
  return (
    <View style={styles.canvas}>
      <HomeSidebar h={h} active="Explore / Learn" heading="Keep exploring!" quote={'“Every expert\nwas once a\nbeginner.”'} />
      <HomeHeader h={h} placeholder="Search courses, past papers, live classes or topics..." />
      <View style={styles.body}>
        <View style={styles.main}>
          <Hero u={u} name={h.name.split(' ')[0]} />
          <Categories u={u} />
          <Popular u={u} />
          <View style={styles.twoCol}>
            <View style={styles.flex}>
              <Resume u={u} />
            </View>
            <View style={styles.flex}>
              <Subjects u={u} />
            </View>
          </View>
        </View>
        <View style={styles.sideCol}>
          <Today u={u} />
          <LiveNow u={u} />
          <Upcoming u={u} />
          <ForYou u={u} />
        </View>
      </View>
    </View>
  );
}

/** Explore & Learn on phones. */
export function ExplorePhone({ d, h }: { d: ExploreData; h: Home }) {
  const u = useExplore(d);
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={h.avatar} />
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        <Hero u={u} name={h.name.split(' ')[0]} />
        <Categories u={u} phone />
        <Today u={u} />
        <LiveNow u={u} />
        <Popular u={u} phone />
        <Resume u={u} phone />
        <Subjects u={u} phone />
        <Upcoming u={u} />
        <ForYou u={u} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  canvas: { width: EXPLORE_REF_WIDTH, minHeight: 1024, backgroundColor: '#EEF3FA' },
  body: { flexDirection: 'row', gap: 15, paddingTop: 56, paddingLeft: 198, paddingRight: 11, paddingBottom: 20 },
  main: { width: 827, gap: 10, paddingTop: 10 },
  sideCol: { flex: 1, gap: 10, paddingTop: 10 },
  twoCol: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  card: { gap: 10, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  phoneBlock: { gap: 10 },
  side: { gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headTitle: { flexShrink: 1, fontSize: 14, fontWeight: '800', color: NAVY },
  headLink: { fontSize: 11.5, fontWeight: '700', color: BLUE },
  hero: { gap: 6, padding: 16, borderRadius: 10, backgroundColor: '#0B2A6B' },
  heroHi: { fontSize: 13, fontWeight: '600', color: '#BFD4FF' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 12.5, color: '#DCE7FF' },
  heroSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, marginTop: 6, paddingHorizontal: 12, borderRadius: 9, backgroundColor: '#FFFFFF' },
  heroInput: { flex: 1, fontSize: 13, color: INK },
  chips: { gap: 7, paddingTop: 6 },
  chip: { height: 30, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: '#3A5A9C' },
  chipOn: { borderColor: '#FFFFFF', backgroundColor: '#FFFFFF' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#DCE7FF' },
  chipTextOn: { color: NAVY },
  cats: { flexDirection: 'row', gap: 8 },
  catsPhone: { flexWrap: 'wrap' },
  cat: { flex: 1, minWidth: 0, gap: 4, padding: 10, borderRadius: 10, borderWidth: 1.5 },
  catPhone: { flexBasis: '30%', flexGrow: 1 },
  catIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontSize: 12.5, fontWeight: '800', color: INK },
  catNote: { fontSize: 10.5, color: BODY },
  catCount: { fontSize: 10.5, fontWeight: '700' },
  rowGap: { flexDirection: 'row', gap: 9 },
  course: { flex: 1, minWidth: 0, borderRadius: 9, borderWidth: 1, borderColor: LINE, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  courseWide: { flexGrow: 0, flexShrink: 0, flexBasis: 230, width: 230 },
  coursePhoto: { width: '100%', height: 104 },
  courseBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(11,20,36,0.75)' },
  courseBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#FFFFFF' },
  courseBody: { gap: 5, padding: 9 },
  courseTitle: { minHeight: 32, fontSize: 12.5, fontWeight: '800', color: INK },
  face: { width: 18, height: 18, borderRadius: 9 },
  small: { flexShrink: 1, fontSize: 10.5, color: BODY },
  courseFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  price: { fontSize: 12, fontWeight: '800', color: NAVY },
  cta: { fontSize: 11, fontWeight: '800', color: BLUE },
  empty: { paddingVertical: 18, fontSize: 12, color: BODY, textAlign: 'center' },
  resume: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  resumePhoto: { width: 54, height: 40, borderRadius: 6 },
  resumeTitle: { fontSize: 12.5, fontWeight: '800', color: INK },
  track: { height: 6, marginTop: 5, borderRadius: 3, backgroundColor: '#E6EDF7', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: BLUE },
  fillGreen: { backgroundColor: TONES.green.solid },
  pct: { width: 38, textAlign: 'right', fontSize: 12, fontWeight: '800', color: NAVY },
  subjects: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  subject: { width: '31.5%', gap: 3, padding: 9, borderRadius: 9, borderWidth: 1.5 },
  subjectName: { fontSize: 12, fontWeight: '800', color: INK },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring: { width: 58, height: 58, borderRadius: 29, borderWidth: 6, borderColor: TONES.green.solid, alignItems: 'center', justifyContent: 'center', backgroundColor: TONES.green.soft },
  ringText: { fontSize: 15, fontWeight: '800', color: NAVY },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 4 },
  box: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: '#9AA6BA', alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: TONES.green.solid, backgroundColor: TONES.green.solid },
  goalText: { fontSize: 12, color: INK },
  goalDone: { color: BODY, textDecorationLine: 'line-through' },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#E5484D' },
  livePhoto: { width: '100%', height: 110, borderRadius: 8 },
  join: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, borderRadius: 8, backgroundColor: '#E5484D' },
  joinText: { fontSize: 12.5, fontWeight: '800', color: '#FFFFFF' },
  up: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 4 },
  upPhoto: { width: 44, height: 34, borderRadius: 6 },
  upTitle: { fontSize: 11.5, fontWeight: '800', color: INK },
  phoneRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  phone: { gap: 16, padding: 16, paddingBottom: 110 },
});
