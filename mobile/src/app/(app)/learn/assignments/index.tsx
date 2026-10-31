import { router } from 'expo-router';
import { useState } from 'react';

import { Badge, Card, Chip, ChipRow, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import type { AssignmentState } from '@/mock/learner';

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
