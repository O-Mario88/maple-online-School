import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { type Home, HomeHeader, HomeSidebar } from '@/features/learner/home/HomeFrame';
import { BookCard, CompletedItem, ContinueItem, DoneMark, Filters, Head, Hero, Levels, MyLibrary, MySubjects, Shelf, SidePanel, Subjects } from '@/features/learner/library/ShelfParts';
import { LiveLibrary } from '@/features/learner/library/LiveLibrary';
import { type Hub, type ShelfState, useShelf } from '@/features/learner/library/useShelf';
import { RefScale } from '@/features/public/home/RefScale';
import { mockData } from '@/lib/mock';

/** The library reference's desktop (x 0–1276 of 1536, sidebar included), laid out in its pixels. */
const LIB_REF_WIDTH = 1276;
/** Longest search a link into the library may carry. */
const MAX_QUERY = 80;
const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';

function Results({ s, small = false }: { s: ShelfState; small?: boolean }) {
  return (
    <View style={small ? undefined : styles.card}>
      <Head icon="search" color={BLUE} title={`Results (${s.results.length})`} sub={[s.subject, s.level, s.query && `“${s.query}”`].filter(Boolean).join(' • ')} link="Clear" onLink={s.reset} />
      {s.results.length === 0 ? <Text style={styles.empty}>No resources match. Try another level, subject or filter.</Text> : null}
      <View style={styles.grid}>
        {s.results.map((b) => (
          <BookCard key={b.id} b={b} small={small} />
        ))}
      </View>
    </View>
  );
}

function Shelves({ hub, s }: { hub: Hub; s: ShelfState }) {
  return (
    <>
      {s.searching ? <Results s={s} /> : <Shelf leaf title="Recommended for You" sub="Based on your level, recent activity and learning goals" books={s.pick(hub.recommended)} />}
      <Shelf icon="book" color="#2563EB" title="Popular This Month" sub="Most read, viewed and loved by Maple learners" books={s.pick(hub.popular)} />
      <Shelf icon="sparkle" color="#F59E0B" title="New Arrivals" sub="Latest books and resources added to the library" books={s.pick(hub.newArrivals)} />
      <Shelf icon="people" color="#16A34A" title="Teacher Recommended" sub="Handpicked by your teachers to support your learning" books={s.pick(hub.teacherPicks)} />
    </>
  );
}

function SideColumn({ hub, s }: { hub: Hub; s: ShelfState }) {
  return (
    <View style={styles.side}>
      <View style={styles.sideCard}>
        <MyLibrary hub={hub} />
      </View>
      <SidePanel title="Continue Reading">
        {hub.continue.map((c) => {
          const b = s.byId(c.id);
          return b ? <ContinueItem key={c.id} b={b} progress={c.progress} thumb={c.thumb} /> : null;
        })}
      </SidePanel>
      <SidePanel title="Completed" icon={<DoneMark />}>
        {hub.completed.map((c) => {
          const b = s.byId(c.id);
          return b ? <CompletedItem key={c.id} b={b} on={c.on} thumb={c.thumb} /> : null;
        })}
      </SidePanel>
      <SidePanel title="My Subjects" onAll={() => s.setSubject(undefined)}>
        <View style={styles.subjectsPad}>
          <MySubjects hub={hub} s={s} />
        </View>
      </SidePanel>
    </View>
  );
}

function Desktop({ hub, h, s, onFilters }: { hub: Hub; h: Home; s: ShelfState; onFilters: () => void }) {
  return (
    <View style={styles.canvas}>
      <HomeSidebar h={h} active="Library" heading="Keep exploring!" quote={'“Good books\nbuild brighter\nfutures.”'} />
      <HomeHeader h={h} placeholder="Search for books, topics, authors, or keywords..." lead={{ icon: 'grid', label: 'Filters', onPress: onFilters }} />
      <View style={styles.body}>
        <View style={styles.main}>
          <Hero hub={hub} s={s} />
          <Subjects hub={hub} s={s} />
          <Levels hub={hub} s={s} />
          <Shelves hub={hub} s={s} />
        </View>
        <SideColumn hub={hub} s={s} />
      </View>
    </View>
  );
}

/** Resource type, language and publisher filters: a panel from the left on desktop, a bottom sheet on phones. */
function FilterSheet({ hub, s, open, onClose, wide }: { hub: Hub; s: ShelfState; open: boolean; onClose: () => void; wide: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} animationType={wide ? 'fade' : 'slide'} transparent onRequestClose={onClose}>
      <View style={[styles.sheetBg, wide && styles.sheetBgWide, { paddingTop: insets.top + (wide ? 0 : 40) }]}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close filters" />
        <View style={[styles.sheet, wide && styles.sheetWide, { paddingBottom: insets.bottom + 16 }]}>
          <ScrollView>
            <Filters hub={hub} s={s} />
          </ScrollView>
          <Pressable style={styles.done} onPress={onClose} accessibilityRole="button">
            <Text style={styles.doneText}>{`Show ${s.searching ? s.results.length : 'all'} resources`}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function LevelPicker({ hub, s }: { hub: Hub; s: ShelfState }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.levelRowP}>
      <Text style={styles.levelTitleP}>Browse by Level</Text>
      <View>
        <Pressable style={styles.levelPick} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`Level: ${s.level}`}>
          <Text style={styles.levelPickText}>{s.level}</Text>
          <Icon name="chevronDown" size={13} color={INK} />
        </Pressable>
        {open ? (
          <View style={styles.levelMenu}>
            <ScrollView>
              {hub.levels.map((lv) => (
                <Pressable
                  key={lv}
                  style={styles.levelItem}
                  onPress={() => {
                    s.setLevel(lv);
                    setOpen(false);
                  }}
                  accessibilityRole="menuitem">
                  <Text style={[styles.levelItemText, lv === s.level && styles.levelOn]}>{lv}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Phone({ hub, h, s, onFilters }: { hub: Hub; h: Home; s: ShelfState; onFilters: () => void }) {
  const first = hub.continue[0];
  const firstBook = s.byId(first.id);
  const done = hub.completed[0];
  const doneBook = s.byId(done.id);
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={h.avatar} />
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.titleP} accessibilityRole="header">
            Digital Library
          </Text>
          <Text style={styles.subP}>Read. Explore. Learn. Grow.</Text>
        </View>
        <View style={styles.searchRowP}>
          <View style={styles.searchP}>
            <Icon name="search" size={15} color={BODY} />
            <TextInput style={styles.searchInputP} value={s.query} onChangeText={s.setQuery} placeholder="Search books, topics or authors..." placeholderTextColor="#6B7385" accessibilityLabel="Search the library" />
          </View>
          <Pressable style={styles.filterBtnP} onPress={onFilters} accessibilityRole="button" accessibilityLabel="Filters">
            <Icon name="listBullet" size={17} color={INK} />
          </Pressable>
        </View>
        <MySubjects hub={hub} s={s} phone />
        <LevelPicker hub={hub} s={s} />
        {s.searching ? <Results s={s} small /> : <Shelf small leaf title="Recommended for You" books={s.pick(hub.recommended)} />}
        <Shelf small leaf title="Popular This Month" books={s.pick(hub.popular)} />
        <View>
          <Head leaf icon="book" color={NAVY} title="Continue Reading" link="See All" />
          {firstBook ? <ContinueItem b={firstBook} progress={first.progress} thumb={first.thumb} /> : null}
        </View>
        <View>
          <View style={styles.doneHeadP}>
            <DoneMark />
            <Text style={styles.doneTitleP}>Completed</Text>
          </View>
          {doneBook ? <CompletedItem b={doneBook} on={done.on} thumb={done.thumb} /> : null}
        </View>
        <View style={styles.gapP}>
          <Head leaf icon="library" color={NAVY} title="My Subjects" link="See All" onLink={() => s.setSubject(undefined)} />
          <MySubjects hub={hub} s={s} phone />
        </View>
      </ScrollView>
    </View>
  );
}

export default function LibraryHubScreen() {
  const mock = useMemo(() => mockData(), []);
  // Real builds read the API's library; design builds keep the reference's sample shelves.
  if (!mock) return <LiveLibrary />;
  return <LibraryView hub={mock.learner.libraryHub} h={mock.learner.learnerHome} />;
}

function LibraryView({ hub, h }: { hub: Hub; h: Home }) {
  const params = useLocalSearchParams<{ subject?: string; q?: string }>();
  const subject = hub.subjects.some((x) => x.name === params.subject) ? params.subject : undefined;
  const s = useShelf(hub, { subject, query: typeof params.q === 'string' ? params.q.slice(0, MAX_QUERY) : undefined });
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const [filters, setFilters] = useState(false);
  const sheet = <FilterSheet hub={hub} s={s} open={filters} onClose={() => setFilters(false)} wide={wide} />;
  if (!wide)
    return (
      <>
        <Phone hub={hub} h={h} s={s} onFilters={() => setFilters(true)} />
        {sheet}
      </>
    );
  return (
    <ScrollView style={styles.deskBg}>
      <RefScale width={width} refWidth={LIB_REF_WIDTH}>
        <Desktop hub={hub} h={h} s={s} onFilters={() => setFilters(true)} />
      </RefScale>
      {sheet}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  deskBg: { backgroundColor: '#EEF3FA' },
  canvas: { width: LIB_REF_WIDTH, minHeight: 1024, backgroundColor: '#EEF3FA' },
  body: { flexDirection: 'row', gap: 15, paddingTop: 56, paddingLeft: 198, paddingRight: 11, paddingBottom: 20 },
  main: { width: 827, gap: 10 },
  side: { flex: 1, gap: 10, paddingTop: 10 },
  sideCard: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  subjectsPad: { paddingBottom: 8 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7.5, marginTop: 12 },
  empty: { paddingVertical: 24, fontSize: 12, color: BODY, textAlign: 'center' },
  phoneRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  phone: { gap: 16, padding: 16, paddingBottom: 110 },
  titleP: { fontSize: 24, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  subP: { marginTop: 2, fontSize: 13, color: BODY },
  searchRowP: { flexDirection: 'row', gap: 8 },
  searchP: { flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  searchInputP: { flex: 1, height: 36, fontSize: 12.5, color: INK },
  filterBtnP: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  levelRowP: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 },
  levelTitleP: { fontSize: 14, fontWeight: '700', color: NAVY },
  levelPick: { width: 120, height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  levelPickText: { fontSize: 12, color: NAVY },
  levelMenu: { position: 'absolute', top: 34, right: 0, width: 120, maxHeight: 260, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 4 },
  levelItem: { height: 28, justifyContent: 'center', paddingHorizontal: 10 },
  levelItemText: { fontSize: 12, color: INK },
  levelOn: { color: BLUE, fontWeight: '700' },
  doneHeadP: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneTitleP: { fontSize: 14, fontWeight: '700', color: NAVY },
  gapP: { gap: 12 },
  sheetBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,12,20,0.5)' },
  sheetBgWide: { justifyContent: 'flex-start', alignItems: 'flex-start' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: { maxHeight: '85%', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#FFFFFF' },
  sheetWide: { width: 300, height: '100%', maxHeight: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  done: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderRadius: 8, backgroundColor: '#0B6BFF' },
  doneText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
