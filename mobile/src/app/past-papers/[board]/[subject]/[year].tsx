import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Button, EmptyState } from '@/components/ui';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, CARD_SHADOW, PUBLIC_WIDE } from '@/features/public/palette';
import { CompletePaper, PaperInfo, RelatedResources } from '@/features/public/paper/PaperAside';
import { PaperSidebar } from '@/features/public/paper/PaperSidebar';
import { HintCard, QuestionCard } from '@/features/public/paper/QuestionCard';
import { ToolsCard } from '@/features/public/paper/ToolsCard';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { clockOf } from '@/lib/classroom';
import { mockData } from '@/lib/mock';
import { findPaper } from '@/lib/past-paper';

const PAPER_TABS = ['Paper 1', 'Paper 2', 'Marking Scheme', 'Exam Report', 'Related Resources'] as const;
const SHOWN_QUESTIONS = 10;
const TICK_MS = 1000;
const ASIDE = 340;

function useStopwatch(): [number, () => void] {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return [seconds, () => setSeconds(0)];
}

/** 00:12:34 style, always with hours, as on the reference timer. */
function longClock(seconds: number): string {
  const c = clockOf(seconds);
  return c.split(':').length === 2 ? `00:${c.padStart(5, '0')}` : c.padStart(8, '0');
}

/**
 * Inventory 6: a search-indexed page for one past exam. Question 1 is free
 * to answer and mark; the rest of the paper needs a free account.
 */
export default function PastPaperScreen() {
  const { board, subject, year } = useLocalSearchParams<{ board?: string; subject?: string; year?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const [seconds, resetClock] = useStopwatch();
  const [locked, setLocked] = useState<number | null>(null);
  const [tab, setTab] = useState<(typeof PAPER_TABS)[number]>('Paper 1');

  if (!mock) return <PreviewScreen title="Past paper">{() => null}</PreviewScreen>;
  const pages = mock.publicPages.pastPaperPages;
  const paper = findPaper(pages.papers, board, subject, year);
  const here = `/past-papers/${board}/${subject}/${year}`;

  if (!paper) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.safe}>
          <HomeNav wide={wide} active="Past Papers" />
          <EmptyState icon="search" title="We don't have that paper yet" body="Try another year or board, or browse every past paper." action={<Button label="Browse past papers" variant="secondary" compact onPress={() => router.push('/explore')} />} />
        </SafeAreaView>
      </LightOnly>
    );
  }

  const description = `Practise ${paper.title} online: answer Question 1 free with instant marking and a worked solution, then unlock the full paper and marking scheme on Maple.`;
  const share = async () => {
    try {
      await Share.share({ message: `${paper.title} past paper on Maple: ${here}` });
    } catch {
      // Sharing was cancelled; nothing to do.
    }
  };
  const facts = [
    { icon: 'school' as const, text: paper.boardName },
    { icon: 'chart' as const, text: paper.exam },
    { icon: 'book' as const, text: paper.subjectName },
    { icon: 'calendar' as const, text: paper.year },
    { icon: 'folder' as const, text: 'Both Papers' },
    { icon: 'download' as const, text: 'PDF · Interactive · Marking Scheme' },
  ];
  const crumbs = ['Past Papers', paper.title.split(' ')[0], paper.exam.split(' ')[0], paper.subjectName, paper.year];

  const main = (
    <View style={styles.main}>
      <Text style={styles.crumbs}>{crumbs.join('  ›  ')}</Text>
      <View style={styles.hero}>
        {wide ? (
          <>
            <Image source={pages.heroPhoto} style={styles.heroPhoto} contentFit="cover" />
            <View style={styles.heroFade} />
          </>
        ) : null}
        <View style={styles.heroRow}>
          {paper.crest ? <Image source={paper.crest} style={wide ? styles.crest : styles.crestSmall} contentFit="contain" accessibilityLabel={`${paper.boardName} crest`} /> : <Text style={styles.flag}>{paper.flag}</Text>}
          <View style={styles.flex}>
            <Text style={[styles.heroTitle, wide && styles.heroTitleWide]} accessibilityRole="header">
              {paper.title}
            </Text>
            <Text style={styles.heroSub}>Real exam. Real experience. Real results.</Text>
            <View style={styles.facts}>
              {facts.map((f) => (
                <View key={f.text} style={styles.fact}>
                  <Icon name={f.icon} size={15} color={Brand.ink} />
                  <Text style={styles.factText}>{f.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {PAPER_TABS.map((t) => {
            const on = t === tab;
            return (
              <Pressable key={t} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.ghost} onPress={() => router.push('/sign-up')} accessibilityRole="button">
          <Icon name="download" size={15} color={Brand.ink} />
          <Text style={styles.ghostText}>Download PDF</Text>
        </Pressable>
        <Pressable style={styles.ghost} onPress={share} accessibilityRole="button">
          <Icon name="share" size={15} color={Brand.ink} />
          <Text style={styles.ghostText}>Share</Text>
        </Pressable>
      </View>

      {tab !== 'Paper 1' ? (
        <View style={styles.lockedNote}>
          <Icon name="lock" size={16} color={Brand.blue} />
          <Text style={styles.lockedText}>{`${tab} is part of the full paper. Create a free account to open it.`}</Text>
        </View>
      ) : null}

      <View style={styles.numbersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.numbers}>
          {Array.from({ length: SHOWN_QUESTIONS }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} style={[styles.num, n === 1 && styles.numOn]} onPress={() => setLocked(n === 1 ? null : n)} accessibilityRole="button" accessibilityLabel={n === 1 ? 'Question 1, free' : `Question ${n}, needs a free account`}>
              <Text style={[styles.numText, n === 1 && styles.numTextOn]}>{String(n)}</Text>
            </Pressable>
          ))}
          <View style={styles.num}>
            <Text style={styles.numText}>…</Text>
          </View>
        </ScrollView>
        <View style={styles.timer} accessibilityLabel={`Time on this paper: ${clockOf(seconds)}`}>
          <Icon name="clock" size={16} color={Brand.ink} />
          <Text style={styles.timerText}>{longClock(seconds)}</Text>
        </View>
        <Pressable style={styles.ghost} onPress={resetClock} accessibilityRole="button">
          <Text style={styles.ghostText}>Reset</Text>
        </Pressable>
      </View>
      {locked ? (
        <View style={styles.lockedNote} accessibilityLiveRegion="polite">
          <Icon name="lock" size={16} color={Brand.blue} />
          <Text style={styles.lockedText}>{`Question ${locked} is in the full paper. Create a free account to keep going; your answer to Question 1 is saved.`}</Text>
          <Pressable onPress={() => router.push('/sign-up')} accessibilityRole="button">
            <Text style={styles.link}>Create account →</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.workRow, wide && styles.workRowWide]}>
        <View style={wide ? styles.flex : undefined}>
          <QuestionCard paper={paper} />
        </View>
        <View style={[styles.toolsCol, wide && styles.toolsColWide]}>
          <ToolsCard formulae={paper.formulae} />
          <HintCard hint={paper.q1.hint} />
        </View>
      </View>

      <View style={styles.navBar}>
        <View style={styles.flex}>
          <Text style={styles.navTitle}>Question Navigation</Text>
          <View style={styles.legend}>
            <Text style={styles.legendItem}>
              <Text style={styles.legendFree}> 1 </Text>
              {'  Free'}
            </Text>
            <Text style={styles.legendItem}>🔒  Premium</Text>
            <Text style={styles.legendItem}>✅  Answered</Text>
            <Text style={styles.legendItem}>🚩  Flagged</Text>
          </View>
        </View>
        <Pressable style={styles.next} onPress={() => setLocked(2)} accessibilityRole="button">
          <Text style={styles.link}>Next Question →</Text>
        </Pressable>
      </View>
    </View>
  );

  const aside = (
    <View style={[styles.aside, wide && styles.asideWide]}>
      <CompletePaper benefits={pages.benefits} />
      <PaperInfo paper={paper} />
      <RelatedResources videos={pages.videos} />
    </View>
  );

  return (
    <LightOnly>
      <Head>
        <title>{`${paper.title} Past Paper with Answers | Maple`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${paper.title} Past Paper`} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={here} />
      </Head>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <HomeNav wide={wide} active="Past Papers" />
        <View style={[styles.body, wide && styles.bodyWide]}>
          {wide ? <PaperSidebar boards={pages.boards} subjects={pages.subjects} activeBoardHref={here} activeSubject={paper.subjectName} /> : null}
          <ScrollView style={styles.flex} contentContainerStyle={[styles.page, wide && styles.pageWide]}>
            {main}
            {aside}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  flex: { flex: 1 },
  body: { flex: 1, backgroundColor: Brand.canvas },
  bodyWide: { flexDirection: 'row' },
  page: { gap: 16, padding: 16 },
  pageWide: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, gap: 20 },
  main: { flex: 1, gap: 16, minWidth: 0 },
  aside: { gap: 16 },
  asideWide: { width: ASIDE },
  crumbs: { fontSize: 12, color: Brand.muted },
  hero: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#EEF2FA', padding: 22, minHeight: 150, justifyContent: 'center' },
  heroPhoto: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '38%', opacity: 0.9 },
  heroFade: { position: 'absolute', top: 0, bottom: 0, left: 0, right: '30%', backgroundColor: 'rgba(238,242,250,0.94)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  crest: { width: 72, height: 72 },
  crestSmall: { width: 48, height: 48 },
  flag: { fontSize: 56 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: Brand.ink, letterSpacing: -0.6 },
  heroTitleWide: { fontSize: 34 },
  heroSub: { fontSize: 15, color: Brand.body, marginTop: 2 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 6, marginTop: 10 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  factText: { fontSize: 12, color: Brand.ink },
  tabsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  tabs: { gap: 4 },
  tab: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Brand.blue },
  tabText: { fontSize: 14, color: Brand.body },
  tabTextOn: { color: Brand.blue, fontWeight: '700' },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 8, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  ghostText: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  numbersRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  numbers: { gap: 8 },
  num: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  numOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  numText: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  numTextOn: { color: Brand.surface },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 8, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, marginLeft: 'auto' },
  timerText: { fontSize: 14, fontWeight: '700', color: Brand.ink, fontVariant: ['tabular-nums'] },
  lockedNote: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: 12, borderRadius: 10, backgroundColor: Brand.blueSoft },
  lockedText: { flex: 1, minWidth: 200, fontSize: 13, color: Brand.ink },
  link: { fontSize: 13, fontWeight: '700', color: Brand.blue },
  workRow: { gap: 16 },
  workRowWide: { flexDirection: 'row', alignItems: 'flex-start' },
  toolsCol: { gap: 16 },
  toolsColWide: { width: 260 },
  navBar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  navTitle: { fontSize: 15, fontWeight: '800', color: Brand.ink },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 8 },
  legendItem: { fontSize: 12, color: Brand.body },
  legendFree: { color: Brand.surface, backgroundColor: Brand.blue, fontWeight: '700' },
  next: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue },
});
