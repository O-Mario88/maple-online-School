import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { type Home, HomeHeader, HomeSidebar } from '@/features/learner/home/HomeFrame';

import { BookTop, BLUE, Contents, LINE, NAVY, PageView, ReadAloud, ReaderBar, WHITE } from './ReaderBody';
import { ActivityModal, QuizModal, SidePanel } from './ReaderPanel';
import type { Reader } from './useBookReader';

/** The reference is 1536 wide; the learner sidebar is 187 and the header 54. */
export const READER_REF_WIDTH = 1536;

function useQuizzes(x: Reader) {
  const [quiz, setQuiz] = useState<'quick' | 'chapter' | null>(null);
  const [activity, setActivity] = useState(false);
  const modals = (
    <>
      <QuizModal key={quiz ?? 'none'} title={quiz === 'chapter' ? `${x.chapter?.title ?? x.r.book.title} Quiz` : 'Quick Questions'} questions={quiz === 'chapter' ? x.r.chapterQuiz : quiz === 'quick' ? x.r.quickQuestions : null} onClose={() => setQuiz(null)} />
      <ActivityModal x={x} open={activity} onClose={() => setActivity(false)} />
    </>
  );
  return { open: setQuiz, activity: () => setActivity(true), modals };
}

/** The desktop reader: learner sidebar and header, the book head, contents, the page and the learning panel. */
export function ReaderDesk({ x, h }: { x: Reader; h: Home }) {
  const q = useQuizzes(x);
  const me: Home = { ...h, name: x.r.learner.name, grade: x.r.learner.level, avatar: x.r.learner.avatar };
  if (x.focus) {
    return (
      <View style={[styles.canvas, styles.focusCanvas]}>
        <View style={styles.focusCol}>
          <ReaderBar x={x} />
          <PageView x={x} />
          <ReadAloud x={x} />
        </View>
        {q.modals}
      </View>
    );
  }
  return (
    <View style={styles.canvas}>
      <HomeSidebar h={me} active="Library" />
      <HomeHeader h={me} placeholder="Search for books, topics, authors, or keywords..." lead={{ icon: 'grid', label: 'Library home', onPress: () => x.setFocus(false) }} />
      <View style={styles.body}>
        <BookTop x={x} />
        <View style={styles.cols}>
          <View style={[styles.card, styles.contents]}>
            <Contents x={x} />
          </View>
          <View style={[styles.card, styles.reader]}>
            <ReaderBar x={x} />
            <PageView x={x} />
            <ReadAloud x={x} />
          </View>
          <View style={[styles.card, styles.side]}>
            <SidePanel x={x} onQuiz={q.open} onActivity={q.activity} />
          </View>
        </View>
      </View>
      {q.modals}
    </View>
  );
}

/** The phone reader: book head, a contents drawer, the page, the learning panel, and read aloud pinned at the bottom. */
export function ReaderPhone({ x, h }: { x: Reader; h: Home }) {
  const q = useQuizzes(x);
  const insets = useSafeAreaInsets();
  const [contents, setContents] = useState(false);
  return (
    <View style={styles.phoneRoot}>
      {x.focus ? <View style={{ height: insets.top }} /> : <LearnerPhoneTop avatar={x.r.learner.avatar ?? h.avatar} />}
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        {x.focus ? null : <BookTop x={x} phone />}
        <View style={styles.phoneBar}>
          <Pressable style={styles.contentsBtn} onPress={() => setContents((c) => !c)} accessibilityRole="button" accessibilityState={{ expanded: contents }} accessibilityLabel="Book contents">
            <Icon name="listBullet" size={16} color={NAVY} />
            <Text style={styles.contentsText} numberOfLines={1}>
              {x.chapter?.title ?? 'Contents'}
            </Text>
            <Icon name={contents ? 'chevronDown' : 'chevronRight'} size={14} color={NAVY} />
          </Pressable>
        </View>
        {contents ? (
          <View style={[styles.card, styles.phoneCard]}>
            <Contents x={x} onPick={() => setContents(false)} />
          </View>
        ) : null}
        <ReaderBar x={x} phone />
        <PageView x={x} phone />
        {x.focus ? (
          <Pressable style={styles.leave} onPress={() => x.setFocus(false)} accessibilityRole="button" accessibilityLabel="Leave focus mode">
            <Text style={styles.leaveText}>Leave Focus Mode</Text>
          </Pressable>
        ) : (
          <SidePanel x={x} onQuiz={q.open} onActivity={q.activity} />
        )}
      </ScrollView>
      <View style={[styles.phoneFoot, { paddingBottom: 8 + (x.focus ? insets.bottom : 0) }]}>
        <ReadAloud x={x} phone />
      </View>
      {q.modals}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { width: READER_REF_WIDTH, minHeight: 1024, backgroundColor: '#EEF3FA' },
  focusCanvas: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#F4F1EA' },
  focusCol: { width: 1040, gap: 14 },
  body: { gap: 12, paddingTop: 64, paddingLeft: 205, paddingRight: 12, paddingBottom: 20 },
  cols: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  card: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  contents: { width: 238 },
  reader: { flex: 1, minWidth: 0, gap: 12, padding: 12 },
  side: { width: 352, padding: 10, backgroundColor: '#F7F9FD' },
  phoneRoot: { flex: 1, backgroundColor: '#EEF3FA' },
  phone: { gap: 12, padding: 16, paddingBottom: 24 },
  phoneBar: { flexDirection: 'row', gap: 8 },
  contentsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 42, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  contentsText: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '600', color: NAVY },
  phoneCard: { padding: 12 },
  leave: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: BLUE },
  leaveText: { fontSize: 14, fontWeight: '700', color: WHITE },
  phoneFoot: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#EEF3FA', borderTopWidth: 1, borderColor: LINE },
});
