import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { clockOf } from '@/lib/classroom';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

type Digest = MockData['publicPages']['parentDigest'];

const TICK_MS = 1000;
// The sample invoice link this digest's Pay Now opens (from the digest's own data in a real build).
const PAY_LINK = 'eyJpbnZvaWNlIjoiSU5WLTIwMjYtMDAwNDU4IiwiZXhwIjoxNzk0ODYyNzQwMDAwfQ.demo-signature';
// A fixed waveform shape for the voice note (heights in pixels).
const WAVE = [6, 10, 16, 8, 20, 12, 24, 14, 9, 18, 22, 11, 7, 15, 20, 10, 13, 24, 8, 16, 12, 6, 18, 10, 14, 9, 20, 12, 7, 11];

function Card({ title, icon, action, children }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        {icon}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.flex} />
        {action}
      </View>
      {children}
    </View>
  );
}

function ViewAll({ label = 'View all →' }: { label?: string }) {
  return <Text style={styles.link}>{label}</Text>;
}

/** The week's register: a ring for the percentage and a tick for each day. */
export function AttendanceCard({ d }: { d: Digest }) {
  const present = d.attendance.filter((a) => a.present).length;
  const pct = Math.round((present / d.attendance.length) * 100);
  return (
    <Card title="Attendance" icon={<Icon name="check" size={18} color={Brand.green} />} action={present === d.attendance.length ? <Text style={styles.pill}>✓ Present all week!</Text> : null}>
      <View style={styles.attendRow}>
        <View style={styles.ring} accessibilityLabel={`${pct}% attendance this week`}>
          <Text style={styles.ringValue}>{`${pct}%`}</Text>
          <Text style={styles.muted}>Attendance</Text>
        </View>
        <View style={styles.days}>
          {d.attendance.map((a) => (
            <View key={a.day} style={styles.day} accessibilityLabel={`${a.day} ${a.date}: ${a.present ? 'present' : 'absent'}`}>
              <View style={[styles.dayDot, !a.present && styles.dayDotOff]}>
                <Text style={styles.dayTick}>{a.present ? '✓' : '✗'}</Text>
              </View>
              <Text style={styles.dayName}>{a.day}</Text>
              <Text style={styles.muted}>{a.date}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

/** Skills the child mastered this week. */
export function CompetenciesCard({ d }: { d: Digest }) {
  return (
    <Card title="Competencies Mastered" icon={<Icon name="trophy" size={18} color={Brand.amber} />} action={<ViewAll />}>
      {d.competencies.map((c) => (
        <View key={c.title} style={styles.comp}>
          <View style={[styles.compIcon, { backgroundColor: `${c.tint}1A` }]}>
            <Icon name={c.icon} size={20} color={c.tint} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.strong}>{c.title}</Text>
            <Text style={styles.muted}>{c.detail}</Text>
          </View>
          <Text style={styles.mastered}>Mastered</Text>
        </View>
      ))}
    </Card>
  );
}

/** The teacher's 20-second voice note with its transcript. */
export function VoiceNoteCard({ d }: { d: Digest }) {
  const v = d.voice;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(
      () =>
        setElapsed((e) => {
          if (e + 1 >= v.seconds) {
            setPlaying(false);
            return v.seconds;
          }
          return e + 1;
        }),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [playing, v.seconds]);

  const toggle = () => {
    if (!playing && elapsed >= v.seconds) setElapsed(0);
    setPlaying((p) => !p);
  };
  const played = Math.round((elapsed / v.seconds) * WAVE.length);

  return (
    <Card title="A Message from the Teacher" icon={<Icon name="person" size={18} color={Brand.ink} />}>
      <View style={styles.teacherRow}>
        <Image source={v.photo} style={styles.teacherPhoto} contentFit="cover" accessibilityLabel={v.teacher} />
        <View>
          <Text style={styles.strong}>{v.teacher}</Text>
          <Text style={styles.muted}>{v.role}</Text>
        </View>
      </View>
      <View style={styles.player}>
        <Pressable style={styles.play} onPress={toggle} accessibilityRole="button" accessibilityLabel={playing ? 'Pause the voice note' : 'Play the voice note'}>
          <Text style={styles.playIcon}>{playing ? '❚❚' : '▶'}</Text>
        </Pressable>
        <View style={styles.wave} accessibilityElementsHidden>
          {WAVE.map((h, i) => (
            <View key={i} style={[styles.bar, { height: h }, i < played && styles.barPlayed]} />
          ))}
        </View>
        <Text style={styles.time}>{`${clockOf(elapsed)} / ${clockOf(v.seconds)}`}</Text>
      </View>
      <Text style={styles.body}>{`“${v.transcript}”`}</Text>
    </Card>
  );
}

/** How the child is doing in each subject. */
export function SubjectsCard({ d }: { d: Digest }) {
  return (
    <Card title="Subject Progress" action={<ViewAll label="View detailed report →" />}>
      {d.subjects.map((s) => (
        <View key={s.name} style={styles.subject} accessibilityLabel={`${s.name}: ${Math.round(s.score * 100)}%`}>
          <View style={[styles.subjectIcon, { backgroundColor: `${s.tint}1A` }]}>
            <Icon name={s.icon} size={16} color={s.tint} />
          </View>
          <Text style={styles.subjectName}>{s.name}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${s.score * 100}%`, backgroundColor: s.tint }]} />
          </View>
          <Text style={styles.pct}>{`${Math.round(s.score * 100)}%`}</Text>
        </View>
      ))}
    </Card>
  );
}

/** Photos from the week in class. */
export function HighlightsCard({ d }: { d: Digest }) {
  return (
    <Card title="Class Highlights" action={<ViewAll label="View more →" />}>
      <View style={styles.highlights}>
        {d.highlights.map((h) => (
          <View key={h.caption} style={styles.highlight}>
            <Image source={h.photo} style={styles.highlightPhoto} contentFit="cover" accessibilityLabel={h.caption} />
            <Text style={styles.caption}>{h.caption}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** The term's fees, what's paid, and one tap to pay the balance. */
export function FeesCard({ d }: { d: Digest }) {
  const f = d.fees;
  const balance = f.totalUGX - f.paidUGX;
  const status = balance <= 0 ? 'Paid' : f.paidUGX > 0 ? 'Partially Paid' : 'Not Paid';
  return (
    <Card title="Fees & Payments" icon={<Icon name="wallet" size={18} color={Brand.blue} />} action={<ViewAll />}>
      <View style={styles.feeBox}>
        <View style={styles.between}>
          <Text style={styles.strong}>{f.term}</Text>
          <Text style={[styles.feeStatus, balance <= 0 && styles.feeStatusPaid]}>{status}</Text>
        </View>
        <View style={styles.between}>
          <Text style={styles.body}>Total Amount</Text>
          <Text style={styles.strong}>{formatMoney(f.totalUGX, 'UGX')}</Text>
        </View>
        <View style={styles.between}>
          <Text style={styles.body}>Amount Paid</Text>
          <Text style={styles.strong}>{formatMoney(f.paidUGX, 'UGX')}</Text>
        </View>
        <View style={styles.between}>
          <Text style={styles.body}>Balance</Text>
          <Text style={[styles.strong, styles.balance]}>{formatMoney(balance, 'UGX')}</Text>
        </View>
      </View>
      {balance > 0 ? (
        <Pressable style={styles.pay} onPress={() => router.push(`/pay/${PAY_LINK}`)} accessibilityRole="button">
          <Icon name="wallet" size={18} color={Brand.surface} />
          <Text style={styles.payText}>{`Pay Now (${formatMoney(balance, 'UGX')})`}</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.invoice} onPress={() => router.push('/pay')} accessibilityRole="button">
        <Text style={styles.link}>View Invoice</Text>
      </Pressable>
    </Card>
  );
}

/** "Keep supporting <child>": the closing actions. */
export function SupportBar({ d }: { d: Digest }) {
  const first = d.child.name.split(' ')[0];
  const actions = [
    { label: 'View Assignments', icon: 'book' as const, href: '/sign-in' as const },
    { label: 'Contact Teacher', icon: 'chat' as const, href: '/sign-in' as const },
    { label: 'Download Report', icon: 'download' as const, href: '/sign-in' as const },
  ];
  return (
    <View style={styles.support}>
      <View style={styles.heart}>
        <Text style={styles.heartText}>♥</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.title}>{`Keep Supporting ${first}`}</Text>
        <Text style={styles.body}>{`Your support makes a big difference. Encourage ${first} to keep practising and completing her weekly assignments.`}</Text>
      </View>
      <View style={styles.supportActions}>
        {actions.map((a) => (
          <Pressable key={a.label} style={styles.supportBtn} onPress={() => router.push(a.href)} accessibilityRole="button">
            <Icon name={a.icon} size={16} color={Brand.blue} />
            <Text style={styles.supportText}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  card: { gap: 14, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  link: { fontSize: 12, fontWeight: '600', color: Brand.blue },
  muted: { fontSize: 11, color: Brand.muted },
  body: { fontSize: 13, lineHeight: 20, color: Brand.body, flexShrink: 1 },
  strong: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  pill: { fontSize: 11, fontWeight: '700', color: Brand.green, backgroundColor: Brand.greenSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  attendRow: { flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap' },
  ring: { width: 112, height: 112, borderRadius: 56, borderWidth: 10, borderColor: Brand.green, alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontSize: 22, fontWeight: '800', color: Brand.ink },
  days: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', minWidth: 220 },
  day: { alignItems: 'center', gap: 4 },
  dayDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: Brand.green, alignItems: 'center', justifyContent: 'center' },
  dayDotOff: { backgroundColor: Brand.live },
  dayTick: { fontSize: 13, fontWeight: '800', color: Brand.surface },
  dayName: { fontSize: 12, color: Brand.ink },
  comp: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10, backgroundColor: Brand.canvas },
  compIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mastered: { fontSize: 11, fontWeight: '700', color: Brand.green, backgroundColor: Brand.greenSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teacherPhoto: { width: 58, height: 58, borderRadius: 29 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 999, borderWidth: 1, borderColor: Brand.line },
  play: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 15, color: Brand.surface },
  wave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 28, overflow: 'hidden' },
  bar: { width: 3, borderRadius: 2, backgroundColor: '#C7D7FE' },
  barPlayed: { backgroundColor: Brand.blue },
  time: { fontSize: 12, color: Brand.body, fontVariant: ['tabular-nums'], paddingRight: 8 },
  subject: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  subjectName: { width: 104, fontSize: 13, color: Brand.ink },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Brand.canvas, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  pct: { width: 40, fontSize: 13, color: Brand.ink, textAlign: 'right' },
  highlights: { flexDirection: 'row', gap: 8 },
  highlight: { flex: 1, gap: 6 },
  highlightPhoto: { width: '100%', aspectRatio: 106 / 120, borderRadius: 8 },
  caption: { fontSize: 11, color: Brand.ink },
  feeBox: { gap: 8, padding: 14, borderRadius: 10, backgroundColor: Brand.canvas },
  feeStatus: { fontSize: 11, fontWeight: '700', color: '#8A5A00', backgroundColor: Brand.amberSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  feeStatusPaid: { color: Brand.green, backgroundColor: Brand.greenSoft },
  balance: { color: Brand.live },
  pay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 10, backgroundColor: Brand.blue },
  payText: { fontSize: 15, fontWeight: '700', color: Brand.surface },
  invoice: { alignItems: 'center', minHeight: 44, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: Brand.blue },
  support: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: 18, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  heart: { width: 46, height: 46, borderRadius: 23, backgroundColor: Brand.liveSoft, alignItems: 'center', justifyContent: 'center' },
  heartText: { fontSize: 22, color: Brand.live },
  supportActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  supportText: { fontSize: 12, fontWeight: '600', color: Brand.ink },
});
