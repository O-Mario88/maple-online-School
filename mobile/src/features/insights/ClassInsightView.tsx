import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Avatar, Badge, Banner, Button, Card, EmptyState, ErrorText, Field, Grid, Loading, Stat } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { timeAgo } from '@/lib/inbox/inbox';
import {
  attendanceLine,
  counts,
  type InterventionKind,
  KIND_LABELS,
  type LearnerInsight,
  levelBadge,
} from '@/lib/insights/insights';
import { useClassInsight, useIntervene } from '@/lib/insights/queries';

const ACTIONS: readonly InterventionKind[] = ['parent_message', 'meeting', 'remedial_work', 'note'];

/** Who in the class needs the teacher, why, and one tap to act. */
export function ClassInsightView({ classId }: { classId: number }) {
  const insight = useClassInsight(classId);
  if (insight.isPending) return <Loading label="Looking at the class" />;
  if (insight.isError) return <ErrorText message={insight.error.message} />;
  const { learners } = insight.data;
  const c = counts(learners);
  return (
    <>
      <Grid min={140}>
        <Stat label="Needs you now" value={String(c.high)} icon="alert" tone={c.high ? 'danger' : 'neutral'} />
        <Stat label="Keep an eye" value={String(c.medium)} icon="info" tone={c.medium ? 'warning' : 'neutral'} />
        <Stat label="On track" value={String(c.ok)} icon="check" tone="good" />
      </Grid>
      {learners.length === 0 ? (
        <EmptyState icon="people" title="No learners yet" body="Learners appear here once they're enrolled in the class." />
      ) : (
        learners.map((l) => <LearnerCard key={l.student.id} classId={classId} learner={l} />)
      )}
    </>
  );
}

function LearnerCard({ classId, learner }: { classId: number; learner: LearnerInsight }) {
  const { theme, styles } = useStyles(makeStyles);
  const [kind, setKind] = useState<InterventionKind | null>(null);
  const [note, setNote] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const intervene = useIntervene();
  const badge = levelBadge(learner.level);

  async function save() {
    if (!kind) return;
    await intervene.mutateAsync({ class: classId, student: learner.student.id, kind, note });
    setDone(kind === 'parent_message' ? 'Sent to the family.' : 'Saved.');
    setKind(null);
    setNote('');
  }

  return (
    <Card>
      <View style={styles.head}>
        <Avatar name={learner.student.name} size={44} />
        <View style={styles.flex}>
          <Text style={styles.name}>{learner.student.name}</Text>
          {learner.last_intervention_at ? (
            <Text style={styles.muted}>Last action {timeAgo(learner.last_intervention_at, new Date()).toLowerCase()}</Text>
          ) : null}
        </View>
        <Badge label={badge.label} tone={badge.tone} />
      </View>

      {learner.reasons.length > 0 ? (
        <View style={styles.reasons}>
          {learner.reasons.map((r) => (
            <View key={r} style={styles.reason}>
              <Icon name="alert" size={14} color={learner.level === 'high' ? theme.danger : theme.warning} />
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.metrics}>
        <Metric label="Attendance" value={attendanceLine(learner)} />
        <Metric label="Work handed in" value={learner.work_set === 0 ? 'None set' : `${learner.work_done} of ${learner.work_set}`} />
        <Metric label="Average" value={learner.average_pct == null ? 'Not marked yet' : `${learner.average_pct}%`} />
      </View>

      {done ? <Banner tone="good" title={done} /> : null}
      <ErrorText message={intervene.error?.message} />

      {kind ? (
        <View style={styles.compose}>
          <Field
            label={KIND_LABELS[kind]}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={2000}
            placeholder={kind === 'parent_message' ? `Write to ${learner.student.name.split(' ')[0]}'s family…` : 'What happened, and what’s next'}
            hint={kind === 'parent_message' ? 'Goes to the parents your school has confirmed, in their Maple inbox.' : undefined}
          />
          <View style={styles.actions}>
            <Button
              label={kind === 'parent_message' ? 'Send' : 'Save'}
              compact
              icon="check"
              busy={intervene.isPending}
              disabled={kind === 'parent_message' && note.trim() === ''}
              onPress={save}
            />
            <Button label="Cancel" compact variant="ghost" onPress={() => setKind(null)} />
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <Button
              key={a}
              label={KIND_LABELS[a]}
              compact
              variant={a === 'parent_message' && learner.level !== 'ok' ? 'primary' : 'secondary'}
              onPress={() => {
                setDone(null);
                setKind(a);
              }}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
    name: { ...Type.heading, color: t.text },
    muted: { ...Type.caption, color: t.textMuted },
    reasons: { gap: Spacing.one },
    reason: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    reasonText: { ...Type.small, color: t.text },
    metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    metric: {
      flexGrow: 1,
      flexBasis: 140,
      padding: Spacing.three,
      borderRadius: Radius.md,
      backgroundColor: t.backgroundSelected,
      gap: 2,
    },
    metricLabel: { ...Type.caption, color: t.textMuted },
    metricValue: { ...Type.bodyStrong, color: t.text },
    compose: { gap: Spacing.two },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  });
}
