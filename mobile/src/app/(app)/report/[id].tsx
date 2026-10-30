import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Badge, Body, Button, Card, ErrorText, Field, Heading, Loading, Row, Screen } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { trimDecimal } from '@/lib/learning/work';
import { useReport, useUpdateReport } from '@/lib/reports/queries';
import { isLeader, isStaff } from '@/lib/roles';

/** One term report card. Staff add remarks; school leaders publish it to the family. */
export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = Number(id);
  const report = useReport(reportId);
  const me = useMe();
  const update = useUpdateReport(reportId);
  const [teacherRemarks, setTeacherRemarks] = useState<string | null>(null);
  const [headRemarks, setHeadRemarks] = useState<string | null>(null);

  if (report.isPending || me.isPending) {
    return (
      <Screen>
        <Loading label="Loading the report card" />
      </Screen>
    );
  }
  if (report.error || !report.data) {
    return (
      <Screen>
        <Heading>Report card not found</Heading>
        <Body muted>{report.error?.message ?? 'It may not be published yet.'}</Body>
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const r = report.data;
  const memberships = me.data?.memberships ?? [];
  const staff = isStaff(memberships);
  const leader = isLeader(memberships);
  const subjects = r.subjects ?? [];

  const saveRemarks = () =>
    update.mutate({
      ...(teacherRemarks !== null ? { class_teacher_remarks: teacherRemarks } : {}),
      ...(leader && headRemarks !== null ? { headteacher_remarks: headRemarks } : {}),
    });

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>{r.student_name}</Heading>
      <Body muted>
        {r.term_name} · {r.is_published ? 'Published' : 'Draft, not yet visible to the family'}
      </Body>

      <Card title="Overall" action={<Badge label={r.overall_grade_letter ?? '—'} tone="good" />}>
        <Body>{r.overall_score ? `Average ${trimDecimal(r.overall_score)}%` : 'No marks entered yet.'}</Body>
      </Card>

      <Card title="Subjects">
        {subjects.length === 0 ? (
          <Body muted>No subject marks for this term.</Body>
        ) : (
          subjects.map((s) => (
            <Row
              key={s.id}
              title={s.class_title}
              detail={[
                `${trimDecimal(s.formative_score)}/20 + ${trimDecimal(s.summative_score)}/80`,
                s.descriptor,
                s.teacher_remarks ? `“${s.teacher_remarks}”` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              badge={<Badge label={`${s.grade_letter ?? '—'} ${s.total_score ? trimDecimal(s.total_score) : ''}`.trim()} />}
            />
          ))
        )}
      </Card>

      {staff && !r.is_published ? (
        <Card title="Remarks">
          <Field
            label="Class teacher"
            value={teacherRemarks ?? r.class_teacher_remarks ?? ''}
            onChangeText={setTeacherRemarks}
            multiline
            maxLength={2000}
          />
          {leader ? (
            <Field
              label="Head teacher"
              value={headRemarks ?? r.headteacher_remarks ?? ''}
              onChangeText={setHeadRemarks}
              multiline
              maxLength={2000}
            />
          ) : null}
          <ErrorText message={update.error?.message} />
          <Button label="Save remarks" variant="secondary" busy={update.isPending} onPress={saveRemarks} />
          {leader ? (
            <Button label="Publish to the family" busy={update.isPending} onPress={() => update.mutate({ is_published: true })} />
          ) : null}
        </Card>
      ) : (
        <Card title="Remarks">
          <Body>{r.class_teacher_remarks ? `Class teacher: ${r.class_teacher_remarks}` : 'No class teacher remarks.'}</Body>
          <Body>{r.headteacher_remarks ? `Head teacher: ${r.headteacher_remarks}` : 'No head teacher remarks.'}</Body>
        </Card>
      )}
    </Screen>
  );
}
