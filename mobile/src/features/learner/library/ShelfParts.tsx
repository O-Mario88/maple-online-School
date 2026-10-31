import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ComponentRef, type ReactNode, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import type { IconName } from '@/lib/icons';

import type { Book, Hub, ShelfState } from './useShelf';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const STAR = '#F5A524';
const TAG: Record<string, { bg: string; fg: string }> = {
  Mathematics: { bg: '#E6EEFC', fg: '#1450C8' },
  English: { bg: '#E3F6E9', fg: '#15803D' },
  Science: { bg: '#F1E8FD', fg: '#6D28D9' },
  'Social Studies': { bg: '#FDF1DC', fg: '#B45309' },
  ICT: { bg: '#E6EEFC', fg: '#1450C8' },
  'R.E.': { bg: '#FDF1DC', fg: '#B45309' },
  'Life Skills': { bg: '#E3F6E9', fg: '#15803D' },
  'Mixed Subjects': { bg: '#E6EEFC', fg: '#1450C8' },
};

/** Books whose reader opens a sample book (only Mathematics for O-Level has sample pages). */
const READER_SAMPLE: Record<string, string> = { fractions: 'maths-olevel' };
export const openBook = (id: string) => router.push({ pathname: '/learn/library/[id]', params: { id: READER_SAMPLE[id] ?? id } });
const typeLabel = (t: string) => (t === 'E-books' ? 'eBook' : t.replace(/s$/, ''));
const LEAF = require('@/assets/images/maple-leaf.png') as number;

export function Tag({ text }: { text: string }) {
  const t = TAG[text] ?? TAG.Mathematics;
  return <Text style={[styles.tag, { backgroundColor: t.bg, color: t.fg }]}>{text}</Text>;
}

export function Head({ icon, color, title, sub, link = 'View All', onLink, leaf = false }: { icon: IconName; color: string; title: string; sub?: string; link?: string; onLink?: () => void; leaf?: boolean }) {
  return (
    <View style={styles.head}>
      {leaf ? <Image source={LEAF} style={styles.headLeaf} contentFit="contain" /> : <Icon name={icon} size={16} color={color} />}
      <View style={styles.flex}>
        <Text style={styles.headTitle}>{title}</Text>
        {sub ? <Text style={styles.headSub}>{sub}</Text> : null}
      </View>
      <Pressable style={styles.link} onPress={onLink} accessibilityRole="link" hitSlop={8}>
        <Text style={styles.linkText}>{link}</Text>
        <Icon name="chevronRight" size={11} color={BLUE} />
      </Pressable>
    </View>
  );
}

export function Hero({ hub, s }: { hub: Hub; s: ShelfState }) {
  return (
    <View style={styles.hero}>
      <Image source={hub.hero} style={styles.fill} contentFit="cover" accessibilityLabel="A girl dreaming in front of a bookshelf" />
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle} accessibilityRole="header">
          Digital Library
        </Text>
        <Text style={styles.heroTag}>Read. Explore. Learn. Grow.</Text>
        <Text style={styles.heroText}>Thousands of e-books, articles, videos and resources organized by subject and level to support your learning journey.</Text>
        <View style={styles.heroSearch}>
          <Icon name="search" size={15} color={BODY} />
          <TextInput style={styles.heroInput} value={s.query} onChangeText={s.setQuery} placeholder="Search books, topics, or authors..." placeholderTextColor="#6B7385" accessibilityLabel="Search the library" />
          <View style={styles.heroBtn}>
            <Icon name="search" size={17} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </View>
  );
}

export function Subjects({ hub, s }: { hub: Hub; s: ShelfState }) {
  return (
    <View style={styles.subjects}>
      {hub.subjects.map((x) => {
        const on = s.subject === x.name;
        return (
          <Pressable key={x.name} style={[styles.subject, on && styles.subjectOn]} onPress={() => s.setSubject(x.name)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${x.name}, ${x.count}`}>
            <Image source={x.icon} style={styles.subjectIcon} />
            <Text style={styles.subjectName} numberOfLines={1}>
              {x.name}
            </Text>
            <Text style={styles.subjectCount}>{x.count}</Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.subject} onPress={() => s.setSubject(undefined)} accessibilityRole="button">
        <Icon name="chevronRight" size={22} color={BLUE} />
        <Text style={styles.subjectName}>View All</Text>
        <Text style={styles.subjectCount}>20 Subjects</Text>
      </Pressable>
    </View>
  );
}

export function Levels({ hub, s }: { hub: Hub; s: ShelfState }) {
  return (
    <View style={styles.levels}>
      <Text style={styles.levelsTitle}>Browse by Level</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelRow}>
        {hub.levels.map((lv) => {
          const on = lv === s.level;
          return (
            <Pressable key={lv} style={[styles.level, on && styles.levelOn]} onPress={() => s.setLevel(lv)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.levelText, on && styles.white]}>{lv}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** The "Recommended for You" card: landscape thumbnail, title, subject tag, rating and type. Every shelf row uses it. */
export function BookCard({ b, small = false }: { b: Book; small?: boolean }) {
  return (
    <Pressable style={[styles.card, small && styles.cardS]} onPress={() => openBook(b.id)} accessibilityRole="link" accessibilityLabel={`${b.title}, ${b.subject}, rated ${b.rating}, ${typeLabel(b.type)}`}>
      <Image source={b.cover} style={small ? styles.coverS : styles.cover} contentFit="cover" />
      <Text style={[styles.cardTitle, small && styles.cardTitleS]} numberOfLines={small ? 2 : 1}>
        {b.title}
      </Text>
      <View style={styles.cardTags}>
        <Tag text={b.tag} />
      </View>
      <View style={styles.cardFoot}>
        <Icon name="star" size={small ? 11 : 12} color={STAR} />
        <Text style={[styles.cardRating, small && styles.cardRatingS]}>{b.rating}</Text>
        {small ? null : <Text style={styles.cardType}>{typeLabel(b.type)}</Text>}
      </View>
    </Pressable>
  );
}

/** A white section with a heading and one row of book cards; the arrow scrolls the row. */
export function Shelf({ title, sub, books, leaf = false, icon = 'book', color = NAVY, small = false, onAll }: { title: string; sub?: string; books: readonly Book[]; leaf?: boolean; icon?: IconName; color?: string; small?: boolean; onAll?: () => void }) {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const [x, setX] = useState(0);
  const step = small ? 3 * 104 : 3 * 133;
  return (
    <View style={[styles.shelf, small && styles.shelfP]}>
      <Head leaf={leaf} icon={icon} color={color} title={title} sub={sub} link={small ? 'See All' : 'View All'} onLink={onAll} />
      <View>
        <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={small ? styles.shelfRowP : styles.shelfRow} onScroll={(e) => setX(e.nativeEvent.contentOffset.x)} scrollEventThrottle={64}>
          {books.map((bk) => (
            <BookCard key={bk.id} b={bk} small={small} />
          ))}
        </ScrollView>
        {small ? null : (
          <Pressable style={styles.shelfNext} onPress={() => ref.current?.scrollTo({ x: x + step, animated: true })} accessibilityRole="button" accessibilityLabel={`More in ${title}`}>
            <Icon name="chevronRight" size={14} color={BLUE} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function ContinueItem({ b, progress, thumb }: { b: Book; progress: number; thumb: number }) {
  const pct = Math.round(progress * 100);
  return (
    <Pressable style={styles.cont} onPress={() => openBook(b.id)} accessibilityRole="link" accessibilityLabel={`Continue ${b.title}, ${pct}%`}>
      <Image source={thumb} style={styles.contCover} contentFit="cover" />
      <View style={styles.flex}>
        <Text style={styles.contTitle} numberOfLines={1}>
          {b.title}
        </Text>
        <Text style={styles.contSub}>{`${b.level} • ${b.subject}`}</Text>
        <View style={styles.contBar}>
          <View style={styles.flex}>
            <Bar value={progress} color={BLUE} track="#E1E9F6" height={6} />
          </View>
          <Text style={styles.contPct}>{`${pct}%`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function CompletedItem({ b, on, thumb }: { b: Book; on: string; thumb: number }) {
  return (
    <Pressable style={styles.cont} onPress={() => openBook(b.id)} accessibilityRole="link" accessibilityLabel={`${b.title}, completed ${on}`}>
      <Image source={thumb} style={styles.contCover} contentFit="cover" />
      <View style={styles.flex}>
        <Text style={styles.contTitle} numberOfLines={1}>
          {b.title}
        </Text>
        <Text style={styles.contSub} numberOfLines={1}>{`${b.level} • ${b.subject}`}</Text>
        <Text style={styles.contSub} numberOfLines={1}>{`Completed ${on}`}</Text>
      </View>
      <View style={[styles.done, styles.doneSmall]}>
        <Icon name="check" size={12} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

/** Side panel: a title row with a "View All" link above its children. */
export function SidePanel({ title, icon, onAll, children }: { title: string; icon?: ReactNode; onAll?: () => void; children: ReactNode }) {
  return (
    <View style={styles.sidePanel}>
      <View style={styles.panelHead}>
        {icon}
        <Text style={[styles.panelTitle, styles.flex]}>{title}</Text>
        <Pressable style={styles.link} onPress={onAll} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.linkText}>View All</Text>
          <Icon name="chevronRight" size={11} color={BLUE} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

export function DoneMark() {
  return (
    <View style={[styles.done, styles.doneHead]}>
      <Icon name="check" size={12} color="#FFFFFF" />
    </View>
  );
}

const SHORT: Record<string, string> = { Mathematics: 'Math', 'Religious Education': 'R.E.' };

/** "My Subjects": tiles with counts; the last tile shows every subject. */
export function MySubjects({ hub, s, phone = false }: { hub: Hub; s: ShelfState; phone?: boolean }) {
  const order = ['Mathematics', 'English', 'Science', 'Social Studies', 'ICT', 'Life Skills', 'Religious Education', 'Languages'];
  const list = order.map((n) => hub.subjects.find((x) => x.name === n)).filter((x): x is Hub['subjects'][number] => x != null);
  const shown = phone ? list.slice(0, 5) : list;
  return (
    <View style={phone ? styles.mySubjectsP : styles.mySubjects}>
      {shown.map((x) => {
        const on = s.subject === x.name;
        return (
          <Pressable key={x.name} style={[phone ? styles.mySubjectP : styles.mySubject, on && styles.subjectOn]} onPress={() => s.setSubject(x.name)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${x.name}, ${x.count}`}>
            <Image source={x.icon} style={phone ? styles.mySubjectIconP : styles.mySubjectIcon} />
            <Text style={styles.mySubjectName} numberOfLines={2}>
              {phone ? (x.name === 'Social Studies' ? 'Social\nStudies' : SHORT[x.name] ?? x.name) : x.name === 'Religious Education' ? 'R.E.' : x.name}
            </Text>
            {phone ? null : <Text style={styles.mySubjectCount}>{x.count.replace(' resources', '')}</Text>}
          </Pressable>
        );
      })}
      {phone ? null : (
        <Pressable style={styles.mySubject} onPress={() => s.setSubject(undefined)} accessibilityRole="button">
          <Icon name="chevronRight" size={22} color={BLUE} />
          <Text style={[styles.mySubjectName, styles.blue]}>View All</Text>
          <Text style={styles.mySubjectCount}>20 Subjects</Text>
        </Pressable>
      )}
    </View>
  );
}

function Check({ label, on, onPress, chevron = false }: { label: string; on: boolean; onPress: () => void; chevron?: boolean }) {
  return (
    <Pressable style={styles.check} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={11} color="#FFFFFF" /> : null}</View>
      <Text style={styles.checkText}>{label}</Text>
      {chevron ? <Icon name="chevronRight" size={12} color={INK} /> : null}
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

/** The book the learner is reading now; My Library rows open it, where saved books, bookmarks and notes live. */
const CURRENT_BOOK = 'fractions';

export function MyLibrary({ hub }: { hub: Hub }) {
  return (
    <View>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>My Library</Text>
        <Pressable onPress={() => openBook(CURRENT_BOOK)} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.linkText}>View All</Text>
        </Pressable>
      </View>
      {hub.myLibrary.map((m) => (
        <Pressable key={m.title} style={styles.my} onPress={() => openBook(CURRENT_BOOK)} accessibilityRole="link" accessibilityLabel={`${m.title}, ${m.meta}`}>
          <Image source={m.icon} style={styles.myIcon} />
          <View style={styles.flex}>
            <Text style={styles.myTitle}>{m.title}</Text>
            <Text style={styles.myMeta}>{m.meta}</Text>
          </View>
          <Icon name="chevronRight" size={13} color={INK} />
        </Pressable>
      ))}
    </View>
  );
}

/** Resource type, language and publisher ticks; "All Types" clears the type ticks. */
export function Filters({ hub, s }: { hub: Hub; s: ShelfState }) {
  return (
    <View>
      <View style={styles.panelHead}>
        <Icon name="listBullet" size={15} color={NAVY} />
        <Text style={[styles.panelTitle, styles.flex]}>Filters</Text>
        <Pressable onPress={s.reset} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.linkText}>Reset</Text>
        </Pressable>
      </View>
      <Group title="Resource Type">
        <Check label="All Types" on={s.types.length === 0} onPress={s.allTypes} chevron />
        {hub.filters.types.map(([t, n]) => (
          <Check key={t} label={`${t} (${n.toLocaleString('en-US')})`} on={s.types.includes(t)} onPress={() => s.toggleType(t)} />
        ))}
      </Group>
      <Group title="Language">
        {hub.filters.languages.map((x, i) => (
          <Check key={x} label={x} on={s.languages.includes(x)} onPress={() => s.toggleLanguage(x)} chevron={i === 0} />
        ))}
      </Group>
      <Group title="Publisher">
        {hub.filters.publishers.map((x, i) => (
          <Check key={x} label={x} on={s.publishers.includes(x)} onPress={() => s.togglePublisher(x)} chevron={i === 0} />
        ))}
      </Group>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 9.5, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  headSub: { marginTop: 2, fontSize: 11.5, color: BODY },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { fontSize: 11, color: BLUE },
  hero: { height: 180, borderRadius: 10, overflow: 'hidden', backgroundColor: '#0E2252' },
  heroCopy: { position: 'absolute', left: 268, top: 20, width: 372 },
  heroTitle: { fontSize: 39, lineHeight: 44, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.6 },
  heroTag: { marginTop: 2, fontSize: 17.5, color: '#FFFFFF' },
  heroText: { marginTop: 9, fontSize: 12.5, lineHeight: 17, color: '#FFFFFF' },
  heroSearch: { height: 33, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingLeft: 10, borderRadius: 4, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  heroInput: { flex: 1, height: 32, fontSize: 11.5, color: INK },
  heroBtn: { width: 38, height: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B6BFF' },
  subjects: { flexDirection: 'row', gap: 6 },
  subject: { flex: 1, height: 74, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 8, backgroundColor: '#F4F8FC', borderWidth: 1, borderColor: '#EAEFF6' },
  subjectOn: { borderColor: BLUE, backgroundColor: '#EAF1FE' },
  subjectIcon: { width: 28, height: 28, marginBottom: 6 },
  subjectName: { fontSize: 10.5, color: INK },
  subjectCount: { fontSize: 9, color: BODY },
  levels: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  levelsTitle: { flexShrink: 0, fontSize: 13.5, fontWeight: '700', color: NAVY },
  levelRow: { gap: 6 },
  level: { height: 24, justifyContent: 'center', paddingHorizontal: 9, borderRadius: 5, backgroundColor: '#EEF2F8' },
  levelOn: { backgroundColor: '#0B6BFF' },
  levelText: { fontSize: 9.5, color: NAVY },
  card: { width: 126, padding: 4, paddingBottom: 7, borderRadius: 6, borderWidth: 1, borderColor: '#EDF1F6', backgroundColor: '#FFFFFF' },
  cardS: { width: 98, padding: 0, borderWidth: 0, backgroundColor: 'transparent' },
  cover: { width: 116, height: 88, borderRadius: 5 },
  coverS: { width: 98, height: 78, borderRadius: 5 },
  cardTitle: { marginTop: 8, paddingHorizontal: 1, fontSize: 10, lineHeight: 14, letterSpacing: -0.25, fontWeight: '500', color: NAVY },
  cardTitleS: { minHeight: 26, paddingHorizontal: 0, fontSize: 10, lineHeight: 13 },
  cardTags: { flexDirection: 'row', marginTop: 3, paddingHorizontal: 2 },
  cardLevel: { fontSize: 9, color: BODY },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 2 },
  cardRating: { flex: 1, fontSize: 10.5, color: INK },
  cardType: { fontSize: 10.5, color: INK },
  cont: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F3F7' },
  contCover: { width: 46, height: 44, borderRadius: 4 },
  contSub: { marginTop: 2, fontSize: 9.5, color: BODY, letterSpacing: -0.15 },
  contBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 },
  contPct: { fontSize: 10.5, color: BODY },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 },
  panelTitle: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  my: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F3F7' },
  myIcon: { width: 34, height: 34 },
  myTitle: { fontSize: 11.5, fontWeight: '500', color: NAVY },
  myMeta: { marginTop: 2, fontSize: 10, color: BODY },
  group: { paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  groupTitle: { marginBottom: 6, fontSize: 11.5, fontWeight: '600', color: NAVY },
  check: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 22 },
  box: { width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 3, borderWidth: 1.5, borderColor: '#9AA4B5' },
  boxOn: { borderColor: '#0B6BFF', backgroundColor: '#0B6BFF' },
  checkText: { flex: 1, fontSize: 11, color: INK },
  blue: { color: BLUE },
  headLeaf: { width: 18, height: 18 },
  cardRatingS: { fontSize: 10 },
  contTitle: { fontSize: 10.5, letterSpacing: -0.15, fontWeight: '500', color: NAVY },
  shelf: { paddingTop: 12, paddingHorizontal: 12, paddingBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  shelfP: { padding: 0, borderWidth: 0, backgroundColor: 'transparent' },
  shelfRow: { gap: 7.5, marginTop: 10, paddingRight: 8 },
  shelfRowP: { gap: 6, marginTop: 10 },
  shelfNext: { position: 'absolute', right: -6, top: 48, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  done: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#16A34A' },
  doneSmall: { width: 18, height: 18, marginLeft: -4 },
  doneHead: { width: 22, height: 22, borderRadius: 11 },
  sidePanel: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  mySubjects: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mySubject: { width: 60, height: 58, alignItems: 'center', justifyContent: 'center', gap: 1, borderRadius: 6, backgroundColor: '#F4F7FB' },
  mySubjectIcon: { width: 24, height: 24, marginBottom: 3 },
  mySubjectName: { fontSize: 9.5, color: NAVY, textAlign: 'center' },
  mySubjectCount: { fontSize: 9, color: BODY },
  mySubjectsP: { flexDirection: 'row', justifyContent: 'space-between' },
  mySubjectP: { width: 58, alignItems: 'center', gap: 4 },
  mySubjectIconP: { width: 34, height: 34 },
});
