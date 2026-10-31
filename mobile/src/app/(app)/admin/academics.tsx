import { Badge, Button, Card, Chip, ChipRow, Grid, Row, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { toast } from '@/lib/toast';

/** Inventory 61 and 60: terms, streams, grading bands, and how each class is doing. */
export default function AcademicsScreen() {
  return (
    <PreviewScreen title="Academic year" subtitle="Terms, streams, grading and coverage by class">
      {(m) => {
        const a = m.school.academics;
        return (
          <>
            <Grid min={320}>
              <Card title={`Terms · ${a.year}`} icon="calendar">
                {a.terms.map((t) => (
                  <Row key={t.name} icon="calendar" title={t.name} detail={t.dates} badge={t.current ? <Badge label="Now" tone="accent" /> : undefined} />
                ))}
              </Card>
              <Card title="Streams" icon="people">
                <ChipRow>
                  {a.streams.map((s) => (
                    <Chip key={s} label={s} selected />
                  ))}
                </ChipRow>
                <Button label="Add a stream" icon="plus" variant="ghost" compact onPress={() => toast('New stream added. Give it a name and a class teacher in the class list.')} />
              </Card>
              <Card title="Grading (UNEB bands)" icon="chart">
                <ChipRow>
                  {a.grading.map((g) => (
                    <Chip key={g.band} label={`${g.band} ≥ ${g.from}`} />
                  ))}
                </ChipRow>
              </Card>
            </Grid>
            <Card title="Coverage and mastery by class" icon="map">
              <Table
                rows={m.school.leadership.byClass}
                rowKey={(c) => c.class}
                columns={[
                  { key: 'class', label: 'Class', render: (c) => c.class },
                  { key: 'att', label: 'Attendance', align: 'right', render: (c) => `${Math.round(c.attendance * 100)}%` },
                  { key: 'cov', label: 'Syllabus covered', align: 'right', render: (c) => `${Math.round(c.coverage * 100)}%` },
                  { key: 'mas', label: 'Competencies mastered', align: 'right', render: (c) => `${Math.round(c.mastery * 100)}%` },
                ]}
              />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
