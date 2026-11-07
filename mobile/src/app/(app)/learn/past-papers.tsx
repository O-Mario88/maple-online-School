import { router } from 'expo-router';
import { useState } from 'react';

import { Badge, Chip, ChipRow, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { ContentStats } from '@/features/shared/ContentStats';
import { useTheme } from '@/hooks/use-theme';

const EXAMS = ['All', 'PLE', 'UCE', 'UACE'];

/** Inventory 22 (list): UNEB past papers to solve with instant marking. */
export default function PastPapersScreen() {
  const [exam, setExam] = useState('All');
  const theme = useTheme();
  return (
    <PreviewScreen title="Past papers" subtitle="Real UNEB papers, marked as you go, with teacher walkthroughs">
      {(m) => {
        const rows = m.learner.pastPapers.filter((p) => exam === 'All' || p.exam === exam);
        return (
          <>
            <ChipRow>
              {EXAMS.map((e) => (
                <Chip key={e} label={e} selected={e === exam} onPress={() => setExam(e)} />
              ))}
            </ChipRow>
            <Table
              rows={rows}
              rowKey={(p) => p.id}
              onPress={(p) => router.push({ pathname: '/learn/paper', params: { id: p.id } })}
              columns={[
                { key: 'paper', label: 'Paper', flex: 2, render: (p) => `${p.exam} ${p.subject} ${p.year}` },
                { key: 'which', label: 'Which', render: (p) => p.paper },
                { key: 'time', label: 'Time', render: (p) => `${p.minutes} min` },
                { key: 'attempts', label: 'Attempts', align: 'right', render: (p) => p.attempts.toLocaleString() },
                { key: 'uploader', label: 'Uploaded by', flex: 1.4, render: (p) => p.uploader },
                { key: 'stats', label: 'Views, rating, likes, comments', flex: 2, render: (p) => <ContentStats e={p} uploader={false} color={theme.textSecondary} /> },
                { key: 'board', label: 'Board', align: 'right', render: (p) => <Badge label={p.board} tone="accent" /> },
              ]}
            />
          </>
        );
      }}
    </PreviewScreen>
  );
}
