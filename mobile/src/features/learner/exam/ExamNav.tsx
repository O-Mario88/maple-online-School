import { type ComponentRef, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { IdentifierPill } from '@/features/learner/cbc/CbcParts';
import { DOMAINS } from '@/lib/cbc';
import { type QuestionState, questionState } from '@/lib/exam';

import { BLUE, BODY, GREEN, INK, ORANGE, RED } from './ExamParts';
import type { ExamState } from './useExam';

const COLS = 5;
const STRIP_ITEM = 38;
const STRIP_GAP = 6;
const STATE_LABEL: Record<QuestionState, string> = { answered: 'answered', current: 'current', flagged: 'flagged for review', unanswered: 'not answered' };

function Dot({ kind }: { kind: QuestionState }) {
  if (kind === 'answered')
    return (
      <View style={[styles.dot, { backgroundColor: GREEN }]}>
        <Icon name="check" size={8} color="#FFFFFF" />
      </View>
    );
  if (kind === 'current') return <View style={styles.dotCurrent} />;
  return <View style={[styles.dot, { backgroundColor: kind === 'flagged' ? ORANGE : '#E3E8F0' }]} />;
}

export function Legend({ phone = false }: { phone?: boolean }) {
  const items: [QuestionState, string][] = [
    ['answered', 'Answered'],
    ['current', 'Current'],
    ['flagged', 'Flagged'],
  ];
  return (
    <View style={[styles.legend, phone && styles.legendP]}>
      {items.map(([k, t]) => (
        <View key={k} style={styles.legendItem}>
          <Dot kind={k} />
          <Text style={styles.legendText}>{t}</Text>
        </View>
      ))}
      {phone ? null : (
        <View style={[styles.legendItem, styles.legendFull]}>
          <Dot kind="unanswered" />
          <Text style={styles.legendText}>Not Answered</Text>
        </View>
      )}
    </View>
  );
}

function Cell({ n, s, round = false }: { n: number; s: ExamState; round?: boolean }) {
  const kind = questionState(n, s.sheet);
  return (
    <Pressable
      style={[round ? styles.round : styles.cell, styles[kind], round && kind === 'flagged' && styles.flaggedRound]}
      onPress={() => s.go(n)}
      accessibilityRole="button"
      accessibilityState={{ selected: kind === 'current' }}
      accessibilityLabel={`Question ${n}, ${STATE_LABEL[kind]}`}>
      <Text style={[styles.cellText, kind === 'answered' && styles.answeredText, (kind === 'current' || (round && kind === 'flagged')) && styles.onText, !round && kind === 'flagged' && styles.flaggedText]}>{n}</Text>
    </Pressable>
  );
}

/** The 5-column grid of every question in the section. */
export function NavGrid({ s }: { s: ExamState }) {
  const rows = Array.from({ length: Math.ceil(s.total / COLS) }, (_, r) => Array.from({ length: COLS }, (_, c) => r * COLS + c + 1).filter((n) => n <= s.total));
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0]} style={styles.gridRow}>
          {row.map((n) => (
            <Cell key={n} n={n} s={s} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** The phone's swipeable row of question numbers, kept centred on the open one. */
export function NavStrip({ s }: { s: ExamState }) {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const current = s.sheet.current;
  useEffect(() => {
    ref.current?.scrollTo({ x: Math.max(0, (current - 4) * (STRIP_ITEM + STRIP_GAP)), animated: true });
  }, [current]);
  return (
    <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {Array.from({ length: s.total }, (_, i) => (
        <Cell key={i + 1} n={i + 1} s={s} round />
      ))}
    </ScrollView>
  );
}

/** A progress ring drawn from two clipped half-circles, so any percentage shows its true arc. */
export function ProgressRing({ value, size = 92, stroke = 9, color = BLUE, track = '#E3EBF7', label = true, labelSize = 21 }: { value: number; size?: number; stroke?: number; color?: string; track?: string; label?: boolean; labelSize?: number }) {
  const v = Math.min(1, Math.max(0, value));
  const half = size / 2;
  const arc = { width: size, height: size, borderRadius: half, borderWidth: stroke, borderColor: 'transparent', borderTopColor: color, borderRightColor: color } as const;
  const right = v >= 0.5 ? 45 : 360 * v - 135;
  const left = 45 + 360 * (v - 0.5);
  return (
    <View style={{ width: size, height: size }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: half, borderWidth: stroke, borderColor: track }} />
      <View style={{ position: 'absolute', left: half, width: half, height: size, overflow: 'hidden' }}>
        <View style={[arc, { marginLeft: -half, transform: [{ rotate: `${right}deg` }] }]} />
      </View>
      {v > 0.5 ? (
        <View style={{ position: 'absolute', left: 0, width: half, height: size, overflow: 'hidden' }}>
          <View style={[arc, { transform: [{ rotate: `${left}deg` }] }]} />
        </View>
      ) : null}
      {label ? (
        <View style={styles.ringLabel}>
          <Text style={[styles.ringText, { fontSize: labelSize }]}>{`${Math.round(v * 100)}%`}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Perf({ icon, color, label, value }: { icon: 'check' | 'close' | 'dot'; color: string; label: string; value: number }) {
  return (
    <View style={styles.perf}>
      <View style={[styles.perfIcon, icon === 'dot' ? styles.perfRing : { backgroundColor: color }]}>{icon === 'dot' ? null : <Icon name={icon} size={8} color="#FFFFFF" />}</View>
      <Text style={styles.perfLabel}>{label}</Text>
      <Text style={styles.perfValue}>{value}</Text>
    </View>
  );
}

export function Progress({ s }: { s: ExamState }) {
  const m = s.marks;
  return (
    <>
      <Text style={styles.title}>Your Progress</Text>
      <View style={styles.progressRow}>
        <ProgressRing value={m.answered / s.total} />
        <View style={styles.flex}>
          <Text style={styles.progressText}>{`${m.answered} of ${s.total} questions`}</Text>
          <View style={styles.progressBar}>
            <Bar value={m.answered / s.total} color={BLUE} track="#E3EBF7" height={7} />
          </View>
        </View>
      </View>
      <Text style={[styles.title, styles.perfTitle]}>Section Performance (Auto-marked)</Text>
      <Perf icon="check" color={GREEN} label="Correct" value={m.correct} />
      <Perf icon="close" color={RED} label="Incorrect" value={m.incorrect} />
      <Perf icon="dot" color={BODY} label="Not Answered" value={m.unanswered} />
      <Text style={[styles.title, styles.domTitle]}>By learning domain (NCDC)</Text>
      {(['knowledge', 'skills'] as const).map((d) => {
        const id = s.domains[d];
        return (
          <View key={d} style={styles.perf}>
            <Text style={styles.perfLabel}>{DOMAINS[d].label}</Text>
            {id ? <IdentifierPill identifier={id} withNumber /> : <Text style={styles.perfLabel}>Not yet</Text>}
          </View>
        );
      })}
    </>
  );
}

export function SubmitButton({ s, phone = false }: { s: ExamState; phone?: boolean }) {
  const label = s.done ? `Submitted • ${s.marks.correct} / ${s.total} marks` : 'Submit Section';
  return (
    <Pressable style={[styles.submit, phone && styles.submitP, s.done && styles.submitDone]} onPress={s.submit} disabled={s.done} accessibilityRole="button" accessibilityState={{ disabled: s.done }}>
      <Text style={styles.submitText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 14.5, fontWeight: '700', color: INK },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 10, marginTop: 16 },
  legendP: { justifyContent: 'space-between', marginTop: 0, paddingHorizontal: 12 },
  legendFull: { width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 11.5, color: BODY },
  dot: { width: 11, height: 11, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  dotCurrent: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5, borderColor: BLUE },
  grid: { gap: 8.5, marginTop: 20 },
  gridRow: { flexDirection: 'row', gap: 10 },
  cell: { width: 39, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  round: { width: STRIP_ITEM, height: STRIP_ITEM, alignItems: 'center', justifyContent: 'center', borderRadius: STRIP_ITEM / 2 },
  answered: { backgroundColor: '#DDF3E5' },
  current: { backgroundColor: BLUE, borderWidth: 2, borderColor: '#BBD2FB' },
  flagged: { backgroundColor: '#FDE6CC' },
  flaggedRound: { backgroundColor: ORANGE },
  unanswered: { backgroundColor: '#F1F4F8' },
  cellText: { fontSize: 13, color: INK },
  answeredText: { color: '#1E6B3B', fontWeight: '600' },
  flaggedText: { color: '#D46A12', fontWeight: '600' },
  onText: { color: '#FFFFFF', fontWeight: '700' },
  strip: { gap: STRIP_GAP, paddingHorizontal: 12 },
  ringLabel: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  ringText: { fontSize: 21, fontWeight: '700', color: INK },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14 },
  progressText: { fontSize: 13.5, color: INK },
  progressBar: { marginTop: 10 },
  perfTitle: { marginTop: 20, marginBottom: 4, fontSize: 12.5 },
  domTitle: { marginTop: 8, marginBottom: 2, fontSize: 12 },
  perf: { height: 25, flexDirection: 'row', alignItems: 'center', gap: 8 },
  perfIcon: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  perfRing: { borderWidth: 2, borderColor: '#9AA4B5' },
  perfLabel: { flex: 1, fontSize: 12.5, color: BODY },
  perfValue: { fontSize: 13, fontWeight: '700', color: INK },
  submit: { height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#0B6BFF' },
  submitP: { height: 46 },
  submitDone: { backgroundColor: GREEN },
  submitText: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
});
