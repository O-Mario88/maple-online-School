import { router } from 'expo-router';
import { useState } from 'react';

import { Badge, Body, Button, Card, Chip, ChipRow, EmptyState, ErrorText, Grid, Loading, Row, Screen, Segmented, Stat } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { trimDecimal } from '@/lib/learning/work';
import { countOf } from '@/lib/plural';
import { classReportRows, reportCounts } from '@/lib/reports/class-reports';
import { useGenerateReports, usePublishReports, useTermReports } from '@/lib/reports/queries';
import { leaderSchools, type SchoolRef } from '@/lib/roles';
import { useClasses, useRoster } from '@/lib/school/queries';
import { useTerms } from '@/lib/school/timetable-queries';
import { pickTerm } from '@/lib/school/timetable-week';
import type { Class, Term } from '@/lib/school/types';
import { toast } from '@/lib/toast';

/** One class's report cards for one term: prepare drafts, open each one, publish them to families. */
function ClassReports({ cls, term }: { cls: Class; term: Term }) {
  const roster = useRoster(cls.id);
  const reports = useTermReports(term.id);
  const generate = useGenerateReports();
  const publish = usePublishReports();
  const [confirmPublish, setConfirmPublish] = useState(false);

  if (roster.isPending || reports.isPending) return <Loading label="Loading report cards" />;
  const loadError = roster.error ?? reports.error;
  if (loadError) return <ErrorText message={loadError.message} />;

  const rows = classReportRows(roster.data?.students ?? [], reports.data ?? []);
  const counts = reportCounts(rows);
  const drafts = rows.flatMap((r) => (r.report && !r.report.is_published ? [r.report.id] : []));

  const prepare = () =>
    generate.mutate(
      { class: cls.id, term: term.id },
      {
        onSuccess: (d) =>
          toast(`Prepared ${countOf(d.generated, 'report card')} for ${cls.title}.${d.already_published ? ` ${countOf(d.already_published, 'was', 'were')} already published.` : ''}`),
        onError: (e) => toast(e.message),
      },
    );

  const publishDrafts = () => {
    if (!confirmPublish) return setConfirmPublish(true);
    publish.mutate(drafts, {
      onSuccess: (n) => toast(`Published ${countOf(n, 'report card')}. Families can see ${n === 1 ? 'it' : 'them'} now.`),
      onError: (e) => toast(e.message),
      onSettled: () => setConfirmPublish(false),
    });
  };

  if (rows.length === 0) {
    return <EmptyState icon="people" title="No learners in this class yet" body="Report cards are prepared for each learner on the class list." />;
  }

  return (
    <>
      <Grid min={150}>
        <Stat label="Learners" value={String(rows.length)} icon="people" tone="neutral" />
        <Stat label="No report yet" value={String(counts.missing)} icon="info" tone={counts.missing > 0 ? 'warning' : 'neutral'} />
        <Stat label="Drafts" value={String(counts.draft)} icon="doc" tone={counts.draft > 0 ? 'info' : 'neutral'} />
        <Stat label="Published" value={String(counts.published)} icon="check" tone="good" />
      </Grid>
      <Card title={`${cls.title} · ${term.name}`} subtitle="Drafts are only seen by staff until they are published" icon="clipboard">
        <ChipRow>
          <Button label="Enter marks" variant="secondary" icon="edit" onPress={() => router.push(`/marks/${cls.id}`)} />
          <Button label={counts.draft + counts.published > 0 ? 'Prepare again from marks' : 'Prepare report cards'} variant="secondary" icon="sync" busy={generate.isPending} onPress={prepare} />
          {drafts.length > 0 ? (
            <Button
              label={confirmPublish ? `Tap again to publish ${countOf(drafts.length, 'report card')} to families` : `Publish ${countOf(drafts.length, 'draft')}`}
              variant={confirmPublish ? 'danger' : 'primary'}
              icon="send"
              busy={publish.isPending}
              onPress={publishDrafts}
            />
          ) : null}
        </ChipRow>
        {rows.map((r) => (
          <Row
            key={r.student}
            title={r.name}
            detail={r.report ? [r.report.overall_grade_letter, r.report.overall_score ? `${trimDecimal(r.report.overall_score)}%` : null].filter(Boolean).join(' · ') || 'No marks yet' : 'No report card yet'}
            badge={r.report ? <Badge label={r.report.is_published ? 'Published' : 'Draft'} tone={r.report.is_published ? 'good' : 'info'} /> : <Badge label="Missing" tone="warning" />}
            onPress={r.report ? () => router.push(`/report/${r.report?.id}`) : undefined}
          />
        ))}
      </Card>
    </>
  );
}

function SchoolReports({ school }: { school: SchoolRef }) {
  const terms = useTerms();
  const classes = useClasses();
  const schoolTerms = (terms.data ?? []).filter((t) => t.institution === school.id);
  const schoolClasses = (classes.data ?? []).filter((c) => c.institution === school.id);
  const [termId, setTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const term = schoolTerms.find((t) => t.id === termId) ?? pickTerm(schoolTerms);
  const cls = schoolClasses.find((c) => c.id === classId) ?? schoolClasses[0];

  if (terms.isPending || classes.isPending) return <Loading label="Loading terms and classes" />;
  const loadError = terms.error ?? classes.error;
  if (loadError) return <ErrorText message={loadError.message} />;
  if (!term) {
    return (
      <EmptyState
        icon="calendar"
        title="Add a term first"
        body="Report cards belong to a term."
        action={<Button label="Open the timetable" variant="secondary" onPress={() => router.push('/admin/timetable')} />}
      />
    );
  }
  if (!cls) return <EmptyState icon="school" title="No classes yet" body="Create classes, enrol learners and enter marks; report cards follow." />;

  return (
    <>
      {schoolTerms.length > 1 ? (
        <Segmented label="Term" options={schoolTerms.map((t) => ({ value: String(t.id), label: t.name }))} value={String(term.id)} onChange={(v) => setTermId(Number(v))} />
      ) : null}
      <ChipRow>
        {schoolClasses.map((c) => (
          <Chip key={c.id} label={c.title} selected={cls.id === c.id} onPress={() => setClassId(c.id)} />
        ))}
      </ChipRow>
      <ClassReports key={`${cls.id}-${term.id}`} cls={cls} term={term} />
    </>
  );
}

/** Report cards on the real API: each class's drafts and published cards for a term, ready to publish. */
export function LiveReportCards() {
  const me = useMe();
  const schools = me.data ? leaderSchools(me.data.memberships) : [];
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const school = schools.find((s) => s.id === schoolId) ?? schools[0];

  return (
    <Screen width="wide" title="Report cards" subtitle="Prepare each class's term report cards from its marks, check them, then publish them to families.">
      {me.isPending ? <Loading label="Loading your schools" /> : null}
      {me.data && !school ? (
        <EmptyState icon="clipboard" title="For school leaders" body="Class teachers prepare and check report cards from their class's marks page." />
      ) : null}
      {schools.length > 1 && school ? (
        <Segmented label="School" options={schools.map((s) => ({ value: String(s.id), label: s.name }))} value={String(school.id)} onChange={(v) => setSchoolId(Number(v))} />
      ) : null}
      {school ? <SchoolReports key={school.id} school={school} /> : null}
      <Body muted>Open a report card to add remarks before publishing.</Body>
    </Screen>
  );
}
