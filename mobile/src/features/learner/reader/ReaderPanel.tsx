import { Image } from '@/components/picture';
import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { Question } from '@/mock/book-reader';

import { BLUE, BODY, INK, LINE, NAVY, WHITE } from './ReaderBody';
import { gradeQuiz, lookUp } from './reader';
import type { Reader } from './useBookReader';
import { Maple } from '@/constants/maple';

const MUTED = Maple.faint;
const TABS = ['Learn', 'Notes', 'Highlights', 'More'] as const;
type Tool = 'Dictionary' | 'Translate' | 'Summarize' | 'Ask AI Tutor';
const TOOLS: readonly { name: Tool; sub: string; icon: IconName }[] = [
  { name: 'Dictionary', sub: 'Look up words', icon: 'book' },
  { name: 'Translate', sub: 'Choose language', icon: 'globe' },
  { name: 'Summarize', sub: 'Key points', icon: 'listBullet' },
  { name: 'Ask AI Tutor', sub: 'Get explanations', icon: 'sparkle' },
];

function Section({ icon, title, children, color = BLUE }: { icon: IconName; title: string; children: ReactNode; color?: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.inline}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ToolPanel({ x, tool }: { x: Reader; tool: Tool }) {
  const [word, setWord] = useState('environment');
  const [lang, setLang] = useState(x.r.translations[0].language);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  if (tool === 'Dictionary') {
    const meaning = word.trim() ? lookUp(word, x.r.dictionary) : null;
    return (
      <View style={styles.toolBox}>
        <TextInput style={styles.field} value={word} onChangeText={setWord} placeholder="Type a word from the page" placeholderTextColor={MUTED} accessibilityLabel="Word to look up" />
        <Text style={styles.body}>{word.trim() ? (meaning ?? `“${word.trim()}” is not in the Primary 6 dictionary yet. Ask the AI Tutor.`) : 'Type a word to see its meaning.'}</Text>
      </View>
    );
  }
  if (tool === 'Translate') {
    const t = x.r.translations.find((l) => l.language === lang) ?? x.r.translations[0];
    return (
      <View style={styles.toolBox}>
        <View style={styles.chips}>
          {x.r.translations.map((l) => (
            <Pressable key={l.language} style={[styles.chip, l.language === lang && styles.chipOn]} onPress={() => setLang(l.language)} accessibilityRole="radio" accessibilityState={{ checked: l.language === lang }} accessibilityLabel={l.language}>
              <Text style={[styles.chipText, l.language === lang && styles.chipTextOn]}>{l.language}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.body}>{`Key Idea in ${t.language}: ${t.text}`}</Text>
      </View>
    );
  }
  if (tool === 'Summarize') {
    const points = x.r.summaries[x.chapter?.id ?? ''] ?? [x.r.units.flatMap((u) => u.chapters).find((c) => c.id === x.chapter?.id)?.summary ?? 'Open a chapter to summarise it.'];
    return (
      <View style={styles.toolBox}>
        {points.map((p) => (
          <Text key={p} style={styles.body}>{`• ${p}`}</Text>
        ))}
      </View>
    );
  }
  const ask = () => {
    const q = question.trim();
    if (!q) return setAnswer('Type your question first.');
    setAnswer(x.r.tutorAnswers.find((a) => a.match.test(q))?.answer ?? `Good question! On page ${x.page}, ${x.chapter?.title ?? 'this book'} explains it. Read the Key Idea, then ask me to explain any word you don’t know.`);
  };
  return (
    <View style={styles.toolBox}>
      <TextInput style={styles.field} value={question} onChangeText={setQuestion} onSubmitEditing={ask} placeholder="What is the difference between living and non-living things?" placeholderTextColor={MUTED} accessibilityLabel="Question for the AI Tutor" />
      <Pressable style={styles.askBtn} onPress={ask} accessibilityRole="button" accessibilityLabel="Ask">
        <Icon name="sparkle" size={14} color={WHITE} />
        <Text style={styles.askText}>Ask</Text>
      </Pressable>
      {answer ? <Text style={styles.body}>{answer}</Text> : null}
      <Text style={styles.tiny}>The AI Tutor answers from this book and your level. Your teacher can see your questions.</Text>
    </View>
  );
}

function Learn({ x, onQuiz, onActivity }: { x: Reader; onQuiz: (kind: 'quick' | 'chapter') => void; onActivity: () => void }) {
  const [tool, setTool] = useState<Tool | null>(null);
  const practice: readonly [IconName, string, string, string, () => void][] = [
    ['chart', Maple.successText, 'Quick Questions', `Test your understanding (${x.r.quickQuestions.length} questions)`, () => onQuiz('quick')],
    ['clipboard', Maple.blue, 'Chapter Quiz', 'A short quiz on this chapter', () => onQuiz('chapter')],
    ['edit', Maple.warning, 'Activity / Project', 'A practical task to apply what you’ve learned', onActivity],
  ];
  return (
    <>
      <View style={styles.about}>
        <Icon name="info" size={22} color={BLUE} />
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>About This Book</Text>
          <Text style={styles.body}>{x.r.book.about}</Text>
        </View>
      </View>
      <Section icon="book" title="Reading Tools">
        <View style={styles.tools}>
          {TOOLS.map((t) => (
            <Pressable key={t.name} style={[styles.tool, tool === t.name && styles.toolOn]} onPress={() => setTool(tool === t.name ? null : t.name)} accessibilityRole="button" accessibilityState={{ expanded: tool === t.name }} accessibilityLabel={t.name}>
              <Icon name={t.icon} size={22} color={t.name === 'Ask AI Tutor' ? Maple.blue : BLUE} />
              <View style={styles.flex}>
                <Text style={styles.toolName}>{t.name}</Text>
                <Text style={styles.tiny}>{t.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {tool ? <ToolPanel key={tool} x={x} tool={tool} /> : null}
      </Section>
      <Section icon="timer" title="Practice & Check" color={Maple.warning}>
        {practice.map(([icon, color, title, sub, fn]) => (
          <Pressable key={title} style={({ hovered }) => [styles.row, hovered && styles.hover]} onPress={fn} accessibilityRole="button" accessibilityLabel={title}>
            <Icon name={icon} size={22} color={color} />
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{title}</Text>
              <Text style={styles.tiny}>{sub}</Text>
            </View>
            <Icon name="chevronRight" size={16} color={NAVY} />
          </Pressable>
        ))}
      </Section>
      <Section icon="layers" title="Related Resources">
        {x.r.related.map((res) => (
          <Pressable key={res.title} style={({ hovered }) => [styles.row, hovered && styles.hover]} onPress={() => toast(`${res.title}: opening the ${res.kind === 'video' ? 'video' : 'document'}.`)} accessibilityRole="button" accessibilityLabel={`${res.title}, ${res.meta}`}>
            {res.thumb ? (
              <View>
                <Image decorative source={res.thumb} style={styles.thumb} contentFit="cover" />
                <View style={styles.playOver}>
                  <Icon name="playFill" size={12} color={WHITE} />
                </View>
              </View>
            ) : (
              <View style={[styles.thumb, styles.docThumb]}>
                <Icon name="doc" size={24} color={res.kind === 'pdf' ? Maple.error : BLUE} />
              </View>
            )}
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{res.title}</Text>
              <Text style={styles.tiny}>{res.meta}</Text>
            </View>
          </Pressable>
        ))}
      </Section>
    </>
  );
}

function Notes({ x }: { x: Reader }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const add = () => {
    const err = x.note(text);
    if (err) return setError(err);
    setText('');
    setError('');
  };
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{`My Notes (${x.s.notes.length})`}</Text>
      <TextInput style={[styles.field, styles.tall]} value={text} onChangeText={setText} multiline placeholder={`A note for page ${x.page}`} placeholderTextColor={MUTED} accessibilityLabel="New note" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.askBtn} onPress={add} accessibilityRole="button" accessibilityLabel="Save note">
        <Icon name="plus" size={14} color={WHITE} />
        <Text style={styles.askText}>Save Note</Text>
      </Pressable>
      {x.s.notes.map((n) => (
        <Pressable key={n.id} style={styles.note} onPress={() => x.turnTo(n.page)} accessibilityRole="button" accessibilityLabel={`Page ${n.page}: ${n.text}`}>
          <Text style={styles.tiny}>{`Page ${n.page}`}</Text>
          <Text style={styles.body}>{n.text}</Text>
        </Pressable>
      ))}
      {!x.s.notes.length ? <Text style={styles.tiny}>Notes stay with the book and your teacher can see them.</Text> : null}
    </View>
  );
}

function Highlights({ x }: { x: Reader }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{`Highlights (${x.s.highlights.length})`}</Text>
      {x.s.highlights.map((h) => (
        <View key={`${h.page}-${h.block}`} style={styles.mark}>
          <Pressable style={styles.flex} onPress={() => x.turnTo(h.page)} accessibilityRole="button" accessibilityLabel={`Go to page ${h.page}`}>
            <Text style={styles.tiny}>{`Page ${h.page}`}</Text>
            <Text style={styles.body}>{h.text}</Text>
          </Pressable>
          <Pressable onPress={() => (h.page === x.page ? x.highlight(h.block, h.text) : x.turnTo(h.page))} accessibilityRole="button" accessibilityLabel="Remove highlight" hitSlop={8}>
            <Icon name="close" size={16} color={BODY} />
          </Pressable>
        </View>
      ))}
      {!x.s.highlights.length ? <Text style={styles.tiny}>Tap any paragraph on the page to highlight it. Tap it again to remove the highlight.</Text> : null}
    </View>
  );
}

function More({ x }: { x: Reader }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{`Bookmarks (${x.s.bookmarks.length})`}</Text>
      {x.s.bookmarks.map((p) => (
        <Pressable key={p} style={styles.row} onPress={() => x.turnTo(p)} accessibilityRole="button" accessibilityLabel={`Go to page ${p}`}>
          <Icon name="bookmarkOn" size={18} color={BLUE} />
          <Text style={[styles.rowTitle, styles.flex]}>{`Page ${p}`}</Text>
        </Pressable>
      ))}
      <Pressable style={styles.row} onPress={x.download} accessibilityRole="button" accessibilityLabel={x.offline ? 'Remove offline copy' : 'Download for offline reading'}>
        <Icon name="download" size={18} color={BLUE} />
        <Text style={[styles.rowTitle, styles.flex]}>{x.offline ? 'Saved for offline (tap to remove)' : 'Download for offline reading'}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => x.setFocus(true)} accessibilityRole="button" accessibilityLabel="Focus Reading Mode">
        <Icon name="expand" size={18} color={BLUE} />
        <Text style={[styles.rowTitle, styles.flex]}>Focus Reading Mode</Text>
      </Pressable>
      <Text style={styles.tiny}>{`Last synced: page ${x.sync.lastPage}, ${x.sync.progress}% read, ${x.sync.notes} notes and ${x.sync.highlights} highlights. Shared with your dashboard and your parent’s portal.`}</Text>
    </View>
  );
}

export function SidePanel({ x, onQuiz, onActivity }: { x: Reader; onQuiz: (kind: 'quick' | 'chapter') => void; onActivity: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Learn');
  return (
    <View style={styles.panel}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} accessibilityLabel={t}>
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
            {t === 'More' ? <Icon name="chevronDown" size={13} color={tab === t ? WHITE : NAVY} /> : null}
          </Pressable>
        ))}
      </View>
      {tab === 'Learn' ? <Learn x={x} onQuiz={onQuiz} onActivity={onActivity} /> : null}
      {tab === 'Notes' ? <Notes x={x} /> : null}
      {tab === 'Highlights' ? <Highlights x={x} /> : null}
      {tab === 'More' ? <More x={x} /> : null}
    </View>
  );
}

/** Quick questions or the chapter quiz: pick answers, then see the mark and the right answers. */
export function QuizModal({ title, questions, onClose }: { title: string; questions: readonly Question[] | null; onClose: () => void }) {
  const [answers, setAnswers] = useState<Readonly<Record<string, number>>>({});
  const [done, setDone] = useState(false);
  const close = () => {
    setAnswers({});
    setDone(false);
    onClose();
  };
  const result = questions ? gradeQuiz(questions, answers) : null;
  const submit = () => {
    if (result && result.unanswered) return toast(`Answer all questions first (${result.unanswered} left).`);
    setDone(true);
  };
  return (
    <Modal visible={!!questions} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <View style={styles.inline}>
            <Text style={[styles.modalTitle, styles.flex]} accessibilityRole="header">
              {title}
            </Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.quiz}>
            {done && result ? (
              <View style={[styles.result, { backgroundColor: result.passed ? Maple.successSoft : Maple.errorSoft }]}>
                <Text style={styles.resultBig}>{`${result.score} / ${result.total}  ·  ${result.pct}%`}</Text>
                <Text style={styles.body}>{result.passed ? 'Well done! Your score is on your dashboard and in your parent’s portal.' : 'Read the chapter again and try once more. You need 60% to pass.'}</Text>
              </View>
            ) : null}
            {questions?.map((q, n) => (
              <View key={q.id} style={styles.question}>
                <Text style={styles.rowTitle}>{`${n + 1}. ${q.q}`}</Text>
                {q.options.map((o, i) => {
                  const picked = answers[q.id] === i;
                  const right = done && i === q.answer;
                  const wrong = done && picked && i !== q.answer;
                  return (
                    <Pressable key={o} style={[styles.option, picked && styles.optionOn, right && styles.optionRight, wrong && styles.optionWrong]} onPress={() => !done && setAnswers((a) => ({ ...a, [q.id]: i }))} accessibilityRole="radio" accessibilityState={{ checked: picked }} accessibilityLabel={o}>
                      <Text style={styles.body}>{o}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.submit} onPress={done ? close : submit} accessibilityRole="button" accessibilityLabel={done ? 'Done' : 'Submit answers'}>
            <Text style={styles.askText}>{done ? 'Done' : 'Submit Answers'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ActivityModal({ x, open, onClose }: { x: Reader; open: boolean; onClose: () => void }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <View style={styles.inline}>
            <Text style={[styles.modalTitle, styles.flex]}>{x.r.activity.title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          {x.r.activity.steps.map((s, i) => (
            <Text key={s} style={styles.body}>{`${i + 1}. ${s}`}</Text>
          ))}
          <Pressable
            style={styles.submit}
            onPress={() => {
              toast('Upload your map photo. Your teacher marks it and your parent sees the result.');
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Upload my work">
            <Text style={styles.askText}>Upload My Work</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hover: { backgroundColor: Maple.blueSoft },
  body: { fontSize: 13, lineHeight: 19, color: INK },
  tiny: { fontSize: 11.5, lineHeight: 16, color: BODY },
  error: { fontSize: 12.5, color: Maple.error },
  panel: { gap: 12 },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 38, borderRadius: 10, backgroundColor: Maple.blueSoft },
  tabOn: { backgroundColor: BLUE },
  tabText: { fontSize: 13.5, fontWeight: '600', color: NAVY },
  tabTextOn: { color: WHITE },
  about: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  section: { gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '48.5%', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  toolOn: { borderColor: BLUE, backgroundColor: Maple.blueSoft },
  toolName: { fontSize: 13, fontWeight: '700', color: NAVY },
  toolBox: { gap: 8, padding: 10, borderRadius: 10, backgroundColor: Maple.blueSoft },
  field: { height: 40, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, fontSize: 13, color: INK, backgroundColor: WHITE },
  tall: { height: 76, paddingTop: 8, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipOn: { borderColor: BLUE, backgroundColor: Maple.blueSoft },
  chipText: { fontSize: 12.5, color: NAVY },
  chipTextOn: { fontWeight: '700', color: BLUE },
  askBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-start', height: 34, paddingHorizontal: 14, borderRadius: 8, backgroundColor: BLUE },
  askText: { fontSize: 13.5, fontWeight: '700', color: WHITE },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  thumb: { width: 76, height: 48, borderRadius: 8 },
  docThumb: { alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSoft },
  playOver: { position: 'absolute', left: 26, top: 12, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,20,40,0.6)' },
  note: { gap: 2, padding: 10, borderRadius: 10, backgroundColor: Maple.warningSoft },
  mark: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, backgroundColor: Maple.warningSoft },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  box: { width: '100%', maxWidth: 560, maxHeight: '90%', gap: 12, padding: 20, borderRadius: 16, backgroundColor: WHITE },
  modalTitle: { fontSize: 18, fontWeight: '800', color: NAVY },
  quiz: { gap: 14 },
  question: { gap: 6 },
  option: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, borderWidth: 1, borderColor: LINE },
  optionOn: { borderColor: BLUE, backgroundColor: Maple.blueSoft },
  optionRight: { borderColor: Maple.successText, backgroundColor: Maple.successSoft },
  optionWrong: { borderColor: Maple.error, backgroundColor: Maple.errorSoft },
  result: { gap: 4, padding: 12, borderRadius: 10 },
  resultBig: { fontSize: 20, fontWeight: '800', color: NAVY },
  submit: { height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
});
