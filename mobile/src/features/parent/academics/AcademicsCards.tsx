import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Avatar, Bar, Btn, Card, CardHead, GradeChip, IconTile, Pill, PlayButton, Wave } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, MUTED, NAVY, RED, SOFT, TEXT, TONES, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { GradeRow, Homework, ParentPortal, SubjectScore } from '@/mock/portal';

type Academics = ParentPortal['academics'];

/** Where a homework or grade row leads in a design build. */
const openWork = () => router.push('/learn/assignments');
const openFeedback = () => router.push('/learn/assignments/a5/feedback' as never);

/** The term picker at the top right ("Term 2, 2026"). */
export function TermPicker({ term }: { term: string }) {
  return (
    <Pressable style={styles.term} onPress={() => toast(`Showing ${term}. Earlier terms are under Report Cards.`)} accessibilityRole="button" accessibilityLabel={`Term: ${term}`}>
      <Icon name="calendar" size={21} color={BLUE} />
      <Text style={styles.termText}>{term}</Text>
      <Icon name="chevronDown" size={16} color={BODY} />
    </Pressable>
  );
}

/** One subject's score: a solid icon tile, the name, the percentage, its rise and a bar. */
export function SubjectTile({ s, size = 'large' }: { s: SubjectScore; size?: 'large' | 'small' }) {
  const t = TONES[s.tone];
  const small = size === 'small';
  return (
    <Pressable
      style={[styles.subject, small && styles.subjectSmall, { backgroundColor: t.soft + '99' }]}
      onPress={() => router.push('/learn/progress')}
      accessibilityRole="link"
      accessibilityLabel={`${s.subject}: ${s.score}%, up ${s.delta}%`}>
      <View style={styles.subjectTop}>
        <IconTile icon={s.icon} tone={s.tone} solid size={small ? 36 : 58} radius={small ? 9 : 14} />
        <View style={styles.subjectText}>
          <Text style={[styles.subjectName, small && styles.subjectNameSmall]} numberOfLines={1}>
            {s.subject}
          </Text>
          <View style={styles.subjectScoreRow}>
            <Text style={[styles.subjectScore, small && styles.subjectScoreSmall]}>{`${s.score}%`}</Text>
            <Text style={[styles.delta, small && styles.deltaSmall]}>{`↑ ${s.delta}%`}</Text>
          </View>
        </View>
      </View>
      <Bar value={s.score / 100} color={t.solid} height={small ? 5 : 6} style={small ? styles.subjectBarSmall : styles.subjectBar} />
    </Pressable>
  );
}

/** The four subject tiles in a 2×2 grid. */
export function SubjectGrid({ subjects, size = 'large' }: { subjects: readonly SubjectScore[]; size?: 'large' | 'small' }) {
  return (
    <View style={styles.grid}>
      {subjects.map((s) => (
        <View key={s.subject} style={styles.gridCell}>
          <SubjectTile s={s} size={size} />
        </View>
      ))}
    </View>
  );
}

function DueLabel({ h, size = 14 }: { h: Homework; size?: number }) {
  const today = h.status === 'Due Today';
  const color = today ? RED : BODY;
  return (
    <View style={styles.due}>
      <Icon name="calendar" size={size + 2} color={color} />
      <Text style={[styles.dueText, { color, fontSize: size }, today && styles.dueToday]}>{h.due}</Text>
    </View>
  );
}

/** Homework as a list: subject tile, title and topic, due date and a chevron. */
export function HomeworkList({ items, size = 'desk' }: { items: readonly Homework[]; size?: 'desk' | 'phone' }) {
  const phone = size === 'phone';
  return (
    <View style={styles.list}>
      {items.map((h, i) => (
        <Pressable
          key={h.title}
          style={({ hovered }) => [styles.listRow, phone && styles.listRowPhone, i > 0 && styles.listRowLine, hovered && styles.hover]}
          onPress={openWork}
          accessibilityRole="link"
          accessibilityLabel={`${h.title}, ${h.topic}, due ${h.due}`}>
          <IconTile icon={h.icon} tone={h.tone} solid size={phone ? 40 : 40} radius={10} />
          <View style={styles.listText}>
            <Text style={[styles.rowTitle, phone && styles.rowTitlePhone]} numberOfLines={2}>
              {h.title}
            </Text>
            <Text style={[styles.rowSub, phone && styles.rowSubPhone]} numberOfLines={2}>
              {h.topic}
            </Text>
          </View>
          <DueLabel h={h} size={phone ? 13 : 14} />
          <Icon name="chevronRight" size={18} color={phone ? BODY : BLUE} />
        </Pressable>
      ))}
    </View>
  );
}

/** Homework as a table: date, assignment, subject and a status pill. */
export function HomeworkTable({ items }: { items: readonly Homework[] }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.th]}>
        <Text style={[styles.thText, styles.cDate]}>Date</Text>
        <Text style={[styles.thText, styles.cAssign]}>Assignment</Text>
        <Text style={[styles.thText, styles.cSubject]}>Subject</Text>
        <Text style={[styles.thText, styles.cStatus]}>Status</Text>
      </View>
      {items.map((h) => {
        const today = h.status === 'Due Today';
        return (
          <Pressable key={h.title} style={({ hovered }) => [styles.tr, hovered && styles.hover]} onPress={openWork} accessibilityRole="link" accessibilityLabel={`${h.title}, ${h.topic}, ${h.status}`}>
            <Text style={[styles.td, styles.cDate, today && styles.dueToday]}>{h.date}</Text>
            <Text style={[styles.td, styles.cAssign]} numberOfLines={3}>
              <Text style={styles.tdStrong}>{h.title}</Text>
              <Text style={styles.tdMuted}>{` – ${h.topic}`}</Text>
            </Text>
            <Text style={[styles.td, styles.cSubject]} numberOfLines={1}>
              {h.subject}
            </Text>
            <View style={styles.cStatus}>
              <Pill label={h.status} tone={today ? 'red' : 'blue'} icon={today ? 'alert' : undefined} size={13} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Recent grades as a table; the desktop one adds a "View Feedback" column. */
export function GradesTable({ rows, feedback = false }: { rows: readonly GradeRow[]; feedback?: boolean }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.th]}>
        <Text style={[styles.thText, styles.gAssess]}>Assessment</Text>
        <Text style={[styles.thText, styles.gSubject]}>Subject</Text>
        <Text style={[styles.thText, styles.gScore]}>Score</Text>
        <Text style={[styles.thText, styles.gGrade]}>Grade</Text>
        <Text style={[styles.thText, styles.gDate]}>Date</Text>
        {feedback ? <Text style={[styles.thText, styles.gFeedback]}>Feedback</Text> : null}
      </View>
      {rows.map((g) => (
        <View key={g.assessment} style={[styles.tr, styles.trTall]}>
          <Text style={[styles.td, styles.gAssess, styles.tdLink]} numberOfLines={2}>
            {g.assessment}
          </Text>
          <Text style={[styles.td, styles.gSubject]} numberOfLines={2}>
            {g.subject}
          </Text>
          <Text style={[styles.td, styles.gScore, styles.tdBold]}>{`${g.score}%`}</Text>
          <View style={styles.gGrade}>
            <GradeChip grade={g.grade} size={feedback ? 36 : 44} />
          </View>
          <Text style={[styles.td, styles.gDate]}>{g.date}</Text>
          {feedback ? (
            <View style={styles.gFeedback}>
              <Pressable style={styles.feedbackLink} onPress={openFeedback} accessibilityRole="link" accessibilityLabel={`View feedback on ${g.assessment}`}>
                <Text style={styles.feedbackLinkText} numberOfLines={1}>
                  View Feedback
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Recent grades as phone rows: subject tile, title and topic, score and grade. */
export function GradesList({ rows }: { rows: readonly GradeRow[] }) {
  return (
    <View style={styles.list}>
      {rows.map((g, i) => (
        <Pressable key={g.assessment} style={[styles.listRow, styles.listRowPhone, i > 0 && styles.listRowLine]} onPress={openFeedback} accessibilityRole="link" accessibilityLabel={`${g.title}, ${g.topic}: ${g.score}%, grade ${g.grade}`}>
          <IconTile icon={g.icon} tone={g.tone} solid size={40} radius={10} />
          <View style={styles.listText}>
            <Text style={[styles.rowTitle, styles.rowTitlePhone]} numberOfLines={1}>
              {g.title}
            </Text>
            <Text style={[styles.rowSub, styles.rowSubPhone]} numberOfLines={1}>
              {g.topic}
            </Text>
          </View>
          <Text style={styles.phoneScore}>{`${g.score}%`}</Text>
          <GradeChip grade={g.grade} size={46} />
        </Pressable>
      ))}
    </View>
  );
}

/** A teacher's voice note: avatar with a mic badge, who, a player and the words. */
export function TeacherNote({ n, layout }: { n: Academics['teacherNotes'][number]; layout: 'row' | 'stack' | 'phone' }) {
  const [playing, setPlaying] = useState(false);
  const player = (
    <View style={styles.player}>
      <PlayButton playing={playing} onPress={() => setPlaying((p) => !p)} size={layout === 'row' ? 38 : 44} label={`${n.teacher}'s voice note`} />
      <Wave played={playing ? 0.55 : 1} bars={layout === 'row' ? 22 : 28} height={24} />
      <Text style={styles.duration}>{n.duration}</Text>
    </View>
  );
  if (layout === 'phone') {
    return (
      <View style={styles.notePhone}>
        <View style={styles.noteRow}>
          <Avatar source={n.avatar} size={54} badge="mic" />
          <View style={styles.noteWho}>
            <Text style={styles.noteName}>{n.teacher}</Text>
            <Text style={styles.noteRole}>{n.role}</Text>
          </View>
          <Text style={styles.noteDate}>{n.date}</Text>
        </View>
        {player}
        <Text style={styles.noteText}>{n.text}</Text>
      </View>
    );
  }
  if (layout === 'row') {
    return (
      <View style={styles.noteRow}>
        <Avatar source={n.avatar} size={62} badge="mic" />
        <View style={styles.noteBody}>
          <View style={styles.noteTop}>
            <View style={styles.noteWho}>
              <Text style={styles.noteName}>{n.teacher}</Text>
              <Text style={styles.noteRole}>{n.role}</Text>
            </View>
            {player}
            <Text style={styles.noteDate}>{n.date}</Text>
          </View>
          <Text style={styles.noteText}>{n.text}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.noteStack}>
      <Avatar source={n.avatar} size={78} badge="mic" />
      <View style={styles.noteBody}>
        <Text style={styles.noteName}>{n.teacher}</Text>
        <Text style={styles.noteRole}>{n.role}</Text>
        {player}
        <View style={styles.noteFoot}>
          <Text style={[styles.noteText, styles.flex]}>{n.text}</Text>
          <Text style={styles.noteDate}>{n.date}</Text>
        </View>
      </View>
    </View>
  );
}

/** "Messages from Teachers": the voice notes in a card. */
export function TeacherNotesCard({ notes, layout }: { notes: Academics['teacherNotes']; layout: 'row' | 'stack' | 'phone' }) {
  return (
    <Card style={styles.gapCard}>
      <CardHead title="Messages from Teachers" link="View All" onLink={() => router.push('/messages')} />
      {notes.map((n, i) => (
        <View key={n.teacher} style={[styles.noteWrap, i > 0 && styles.noteLine]}>
          <TeacherNote n={n} layout={layout} />
        </View>
      ))}
    </Card>
  );
}

/** The latest marked script: the annotated paper, the score and the teacher's voice feedback. */
export function FeedbackCard({ f, title, layout, primary = false }: { f: Academics['feedback']; title: string; layout: 'side' | 'stack' | 'phone'; primary?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const details = (
    <View style={styles.fbDetails}>
      <Text style={styles.fbTitle}>{f.title}</Text>
      <Text style={styles.fbTopic}>{f.topic}</Text>
      <View style={styles.fbChips}>
        <Pill label={f.status} tone="red" size={14} />
        <Pill label={f.score} tone="green" size={14} />
        <Text style={styles.fbDate}>{f.date}</Text>
      </View>
      <View style={styles.player}>
        <PlayButton playing={playing} onPress={() => setPlaying((p) => !p)} size={40} label="the teacher's feedback" />
        <Wave played={playing ? 0.5 : 1} bars={20} height={24} />
        <Text style={styles.duration}>{f.duration}</Text>
      </View>
      <Text style={styles.fbText}>{f.text}</Text>
    </View>
  );
  return (
    <Card style={styles.gapCard}>
      <CardHead title={title} link="View All" onLink={openFeedback} />
      <View style={layout === 'phone' ? styles.fbColumn : styles.fbRow}>
        <Image
          source={f.paper}
          style={layout === 'side' ? styles.paperSide : layout === 'phone' ? styles.paperPhone : styles.paperStack}
          contentFit="cover"
          contentPosition="top"
          accessibilityLabel="Marked script with the teacher's notes"
        />
        {layout === 'side' ? (
          <>
            {details}
            <Btn label="View Full Feedback" onPress={openFeedback} style={styles.fbBtnSide} height={46} />
          </>
        ) : (
          <View style={layout === 'phone' ? undefined : styles.flex}>
            {details}
            <Btn label="View Full Feedback" kind={primary ? 'primary' : 'outline'} onPress={openFeedback} style={styles.fbBtn} height={46} />
          </View>
        )}
      </View>
    </Card>
  );
}

/** The current report card with its download button, and past report cards to download. */
export function ReportCardsCard({ a, title, compact, phone = false }: { a: Academics; title: string; compact: boolean; phone?: boolean }) {
  const r = a.reportCard;
  const download = (what: string) => toast(`Downloading ${what} (PDF)…`);
  const current = (
    <View style={styles.reportRow}>
      <Icon name="doc" size={compact ? 30 : 36} color={BLUE} />
      <View style={styles.flex}>
        <Text style={styles.reportTitle}>{r.title}</Text>
        <Text style={styles.reportSub}>{r.year}</Text>
        {phone ? (
          <View style={styles.reportPhoneStatus}>
            <Pill label={r.status} tone="green" size={13} />
            <Text style={styles.reportSub}>{r.date}</Text>
          </View>
        ) : null}
      </View>
      {phone ? null : (
        <View style={styles.reportStatus}>
          <Pill label={r.status} tone="green" size={13} />
          <Text style={styles.reportSub}>{r.date}</Text>
        </View>
      )}
      {compact ? <Btn label="Download" icon="download" onPress={() => download(r.title)} height={42} style={styles.reportBtnSmall} /> : null}
    </View>
  );
  return (
    <Card style={styles.gapCard}>
      <CardHead title={title} link={compact ? 'View All' : undefined} onLink={() => toast('All report cards are listed below.')} />
      {current}
      {compact ? null : <Btn label="Download Report Card" icon="download" onPress={() => download(r.title)} height={48} />}
      <Text style={styles.pastHead}>Past Report Cards</Text>
      <View style={styles.pastList}>
        {a.pastReports.map((p, i) => (
          <View key={p.term} style={[styles.pastRow, i > 0 && styles.listRowLine]}>
            <Text style={styles.pastTerm} numberOfLines={1}>
              {p.term}
            </Text>
            <Text style={styles.pastMeta}>{`PDF • ${p.size}`}</Text>
            <Pressable style={styles.pastDl} onPress={() => download(`${p.term} report card`)} accessibilityRole="button" accessibilityLabel={`Download ${p.term} report card`}>
              <Icon name="download" size={19} color={BLUE} />
            </Pressable>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapCard: { gap: 16 },
  hover: { backgroundColor: SOFT },
  term: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 52, paddingHorizontal: 18, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  termText: { fontSize: 16, fontWeight: '600', color: NAVY },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -7, rowGap: 14 },
  gridCell: { width: '50%', paddingHorizontal: 7 },
  subject: { gap: 14, padding: 18, borderRadius: 14 },
  subjectSmall: { gap: 10, padding: 12 },
  subjectTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  subjectText: { flex: 1, minWidth: 0, gap: 4 },
  subjectName: { fontSize: 16, fontWeight: '500', color: NAVY },
  subjectNameSmall: { fontSize: 13.5 },
  subjectScoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  subjectScore: { fontSize: 28, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  subjectScoreSmall: { fontSize: 20 },
  delta: { fontSize: 15, fontWeight: '600', color: '#16A34A' },
  deltaSmall: { fontSize: 12.5 },
  subjectBar: { marginLeft: 74 },
  subjectBarSmall: { marginLeft: 0 },
  due: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dueText: { fontWeight: '500' },
  dueToday: { color: RED, fontWeight: '600' },
  list: { borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 13 },
  listRowPhone: { gap: 10, paddingHorizontal: 12, paddingVertical: 14 },
  listRowLine: { borderTopWidth: 1, borderColor: LINE },
  listText: { flex: 1, minWidth: 0, gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: NAVY },
  rowTitlePhone: { fontSize: 14.5 },
  rowSub: { fontSize: 14, color: BODY },
  rowSubPhone: { fontSize: 13.5 },
  phoneScore: { fontSize: 16, fontWeight: '700', color: NAVY, marginRight: 6 },
  table: { borderRadius: 12, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: LINE },
  trTall: { minHeight: 64 },
  th: { minHeight: 46, backgroundColor: '#F1F5FC' },
  thText: { fontSize: 13.5, fontWeight: '600', color: NAVY },
  td: { fontSize: 14, color: BODY },
  tdStrong: { color: NAVY, fontWeight: '600' },
  tdMuted: { color: BODY },
  tdBold: { color: NAVY, fontWeight: '700' },
  tdLink: { color: TEXT },
  cDate: { width: 66 },
  cAssign: { flex: 1, minWidth: 0, paddingRight: 10 },
  cSubject: { width: 108 },
  cStatus: { width: 112 },
  gAssess: { flex: 1.35, minWidth: 0, paddingRight: 8 },
  gSubject: { flex: 1.05, minWidth: 0, paddingRight: 8 },
  gScore: { width: 56 },
  gGrade: { width: 54 },
  gDate: { width: 66 },
  gFeedback: { width: 114 },
  feedbackLink: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: '#EEF4FE', borderWidth: 1, borderColor: '#D3E2FB' },
  feedbackLinkText: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  player: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  duration: { fontSize: 15, color: BODY },
  noteWrap: { paddingTop: 2 },
  noteLine: { borderTopWidth: 1, borderColor: LINE, paddingTop: 16 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  notePhone: { gap: 12 },
  noteStack: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  noteBody: { flex: 1, minWidth: 0, gap: 6 },
  noteTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  noteWho: { flex: 1, minWidth: 0 },
  noteName: { fontSize: 16, fontWeight: '700', color: NAVY },
  noteRole: { fontSize: 14, color: BODY },
  noteDate: { fontSize: 14, color: BODY },
  noteText: { fontSize: 14.5, lineHeight: 21, color: BODY },
  noteFoot: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  fbRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  fbColumn: { gap: 16 },
  paperPhone: { width: '100%', height: 190, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  paperSide: { width: 150, height: 204, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  paperStack: { width: 116, height: 160, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  fbDetails: { flex: 1, minWidth: 0, gap: 8 },
  fbTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  fbTopic: { fontSize: 14.5, color: BODY },
  fbChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  fbDate: { fontSize: 15, color: BODY },
  fbText: { fontSize: 14.5, lineHeight: 21, color: BODY },
  fbBtn: { marginTop: 12 },
  fbBtnSide: { alignSelf: 'center', paddingHorizontal: 16 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: SOFT },
  reportTitle: { fontSize: 15.5, fontWeight: '700', color: NAVY },
  reportSub: { fontSize: 13.5, color: BODY },
  reportStatus: { gap: 6 },
  reportPhoneStatus: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 6 },
  reportBtnSmall: { paddingHorizontal: 14 },
  pastHead: { fontSize: 15, fontWeight: '700', color: NAVY },
  pastList: { borderRadius: 12, borderWidth: 1, borderColor: LINE },
  pastRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  pastTerm: { flexShrink: 0, fontSize: 14.5, color: NAVY },
  pastMeta: { flex: 1, minWidth: 0, fontSize: 13, color: MUTED, marginRight: 4, textAlign: 'right' },
  pastDl: { width: 38, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
});
