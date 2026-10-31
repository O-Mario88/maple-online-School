import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { Badge, Card, Chip, ChipRow, EmptyState, ErrorText, Loading, Row, Screen } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useAssignments, useGrades, useSubmissions } from '@/lib/learning/queries';
import { studentWork, type WorkState } from '@/lib/learning/work';
import { mockData } from '@/lib/mock';
import type { AssignmentState } from '@/mock/learner';

const LIVE_FILTERS: { value: WorkState | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Marked' },
];
const LIVE_TONE = { todo: 'warning', submitted: 'neutral', graded: 'good' } as const;
const LIVE_LABEL = { todo: 'To do', submitted: 'Submitted', graded: 'Marked' } as const;

/** The same list on the real API: every published assignment, with where the learner stands on each. */
function LiveAssignments() {
  const [filter, setFilter] = useState<WorkState | 'all'>('all');
  const assignments = useAssignments();
  const submissions = useSubmissions();
  const grades = useGrades();
  const error = assignments.error ?? submissions.error ?? grades.error;
  const pending = assignments.isPending || submissions.isPending || grades.isPending;
  const work = studentWork(assignments.data ?? [], submissions.data ?? [], grades.data ?? []);
  const rows = work.filter((w) => filter === 'all' || w.state === filter);
  return (
    <Screen title="Assignments" subtitle="Everything your teachers have set for you">
      <ChipRow>
        {LIVE_FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={f.value === filter} onPress={() => setFilter(f.value)} />
        ))}
      </ChipRow>
      {pending ? <Loading label="Loading your assignments" /> : null}
      <ErrorText message={error?.message} />
      {!pending && !error && rows.length === 0 ? <EmptyState icon="clipboard" title="Nothing here" body="New work from your teachers appears here." /> : null}
      {rows.length > 0 ? (
        <Card>
          {rows.map((w) => (
            <Row
              key={w.assessmentId}
              icon="clipboard"
              title={w.title}
              detail={w.state === 'graded' && w.feedback ? w.feedback : `Out of ${w.maxScore} marks`}
              badge={<Badge label={w.state === 'graded' ? `${w.score}/${w.maxScore}` : LIVE_LABEL[w.state]} tone={LIVE_TONE[w.state]} />}
              onPress={() => router.push({ pathname: '/assignment/[id]', params: { id: String(w.assessmentId) } })}
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const FILTERS: { value: AssignmentState | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'due', label: 'Due soon' },
  { value: 'draft', label: 'Offline drafts' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Marked' },
];

const TONE = { due: 'warning', draft: 'info', submitted: 'neutral', graded: 'good' } as const;
const LABEL = { due: 'Due', draft: 'Draft', submitted: 'Submitted', graded: 'Marked' } as const;

/** Inventory 26: everything set for the learner. Each opens its workspace, or its feedback once marked. */
export default function AssignmentsScreen() {
  const design = useMemo(() => mockData() != null, []);
  return design ? <DesignAssignments /> : <LiveAssignments />;
}

function DesignAssignments() {
  const [filter, setFilter] = useState<AssignmentState | 'all'>('all');
  return (
    <PreviewScreen title="Assignments" subtitle="Everything set for you, with drafts saved offline">
      {(m) => {
        const rows = m.learner.assignments.filter((a) => filter === 'all' || a.state === filter);
        return (
          <>
            <ChipRow>
              {FILTERS.map((f) => (
                <Chip key={f.value} label={f.label} selected={f.value === filter} onPress={() => setFilter(f.value)} />
              ))}
            </ChipRow>
            <Card>
              {rows.map((a) => (
                <Row
                  key={a.id}
                  icon="clipboard"
                  title={a.title}
                  detail={`${a.subject} · ${a.due}`}
                  badge={<Badge label={a.state === 'graded' && 'score' in a ? `${a.score}/${a.max}` : LABEL[a.state]} tone={TONE[a.state]} />}
                  onPress={() => router.push(a.state === 'graded' ? { pathname: '/learn/assignments/[id]/feedback', params: { id: a.id } } : { pathname: '/learn/assignments/[id]', params: { id: a.id } })}
                />
              ))}
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
