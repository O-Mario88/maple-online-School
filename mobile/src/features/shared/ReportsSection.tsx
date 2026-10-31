import { router } from 'expo-router';

import { Badge, Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { trimDecimal } from '@/lib/learning/work';
import { useReports } from '@/lib/reports/queries';

/** Report cards: families see published ones, staff also see drafts. */
export function ReportsSection({ staff }: { staff: boolean }) {
  const reports = useReports();

  if (reports.isPending) {
    return (
      <Card title="Report cards">
        <Loading label="Loading report cards" />
      </Card>
    );
  }
  if (reports.error || !reports.data) {
    return (
      <Card title="Report cards">
        <ErrorText message={reports.error?.message ?? 'Could not load report cards.'} />
      </Card>
    );
  }
  if (reports.data.length === 0) {
    return (
      <Card title="Report cards">
        <Body muted>
          {staff
            ? 'No report cards yet. Enter a class’s term marks, then prepare its report cards.'
            : 'No report cards have been published yet.'}
        </Body>
      </Card>
    );
  }

  return (
    <Card title="Report cards">
      {reports.data.map((r) => (
        <Row
          key={r.id}
          title={staff ? r.student_name : `${r.student_name} · ${r.term_name}`}
          detail={
            staff
              ? `${r.term_name} · ${r.is_published ? 'Published' : 'Draft'}`
              : r.overall_score
                ? `Average ${trimDecimal(r.overall_score)}%`
                : undefined
          }
          badge={<Badge label={r.overall_grade_letter ?? '—'} tone={r.is_published ? 'good' : 'neutral'} />}
          onPress={() => router.push({ pathname: '/report/[id]', params: { id: String(r.id) } })}
        />
      ))}
    </Card>
  );
}
