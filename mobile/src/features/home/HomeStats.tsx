/**
 * The row of headline numbers at the top of each portal's home page.
 * Each portal reads only the data its people can see.
 */
import { Grid, Stat } from '@/components/ui';
import type { Me } from '@/lib/api/client';
import { formatMoney, financeSchools } from '@/lib/finance/fees';
import { useInvoices, useSummary } from '@/lib/finance/queries';
import { collectionRate, familyBalance } from '@/lib/home';
import { useAssignments, useGrades, useSubmissions } from '@/lib/learning/queries';
import { studentWork, toMark } from '@/lib/learning/work';
import { upcomingLessons } from '@/lib/lessons/lessons';
import { useLessons } from '@/lib/lessons/queries';
import type { Portal } from '@/lib/navigation';
import { useClasses } from '@/lib/school/queries';

const DASH = '—';

export function HomeStats({ portal, user }: { portal: Portal; user: Me }) {
  switch (portal) {
    case 'school':
      return <SchoolStats user={user} />;
    case 'teacher':
      return <TeacherStats />;
    case 'parent':
      return <FamilyStats user={user} />;
    case 'learner':
      return <LearnerStats />;
    default:
      return null;
  }
}

function useUpcomingCount(): string {
  const lessons = useLessons();
  return lessons.data ? String(upcomingLessons(lessons.data, new Date()).length) : DASH;
}

function SchoolStats({ user }: { user: Me }) {
  const school = financeSchools(user.memberships)[0]?.id ?? null;
  const summary = useSummary(school);
  const classes = useClasses();
  const upcoming = useUpcomingCount();
  const s = summary.data;
  return (
    <Grid min={150}>
      <Stat
        label="Fees collected"
        value={s ? formatMoney(s.collected_minor, s.currency) : DASH}
        detail={s ? `${Math.round(collectionRate(s) * 100)}% of billed` : undefined}
        icon="wallet"
        tone="good"
      />
      <Stat
        label="Outstanding"
        value={s ? formatMoney(s.outstanding_minor, s.currency) : DASH}
        detail={s && s.pending_payments > 0 ? `${s.pending_payments} payments pending` : undefined}
        icon="alert"
        tone={s && s.outstanding_minor > 0 ? 'warning' : 'neutral'}
      />
      <Stat label="Classes" value={classes.data ? String(classes.data.length) : DASH} icon="school" tone="info" />
      <Stat label="Upcoming lessons" value={upcoming} icon="calendar" tone="accent" />
    </Grid>
  );
}

function TeacherStats() {
  const classes = useClasses();
  const submissions = useSubmissions();
  const grades = useGrades();
  const assignments = useAssignments();
  const upcoming = useUpcomingCount();
  const pending = submissions.data && grades.data ? toMark(submissions.data, grades.data).length : null;
  return (
    <Grid min={150}>
      <Stat label="My classes" value={classes.data ? String(classes.data.length) : DASH} icon="school" tone="info" />
      <Stat
        label="To mark"
        value={pending == null ? DASH : String(pending)}
        detail={pending ? 'Waiting for feedback' : undefined}
        icon="clipboard"
        tone={pending ? 'warning' : 'neutral'}
      />
      <Stat label="Assignments" value={assignments.data ? String(assignments.data.length) : DASH} icon="book" tone="accent" />
      <Stat label="Upcoming lessons" value={upcoming} icon="calendar" tone="good" />
    </Grid>
  );
}

function LearnerStats() {
  const assignments = useAssignments();
  const submissions = useSubmissions();
  const grades = useGrades();
  const upcoming = useUpcomingCount();
  const work =
    assignments.data && submissions.data && grades.data ? studentWork(assignments.data, submissions.data, grades.data) : null;
  const todo = work?.filter((w) => w.state === 'todo').length;
  const graded = work?.filter((w) => w.state === 'graded').length;
  return (
    <Grid min={150}>
      <Stat label="To do" value={todo == null ? DASH : String(todo)} icon="clipboard" tone={todo ? 'warning' : 'neutral'} />
      <Stat label="Marked" value={graded == null ? DASH : String(graded)} detail="With feedback" icon="check" tone="good" />
      <Stat label="Upcoming lessons" value={upcoming} icon="calendar" tone="accent" />
    </Grid>
  );
}

function FamilyStats({ user }: { user: Me }) {
  const invoices = useInvoices();
  const balances = invoices.data ? familyBalance(invoices.data) : null;
  const owed = balances?.map((b) => formatMoney(b.minor, b.currency)).join(' · ');
  return (
    <Grid min={150}>
      <Stat label="Children" value={String(user.children.length)} icon="people" tone="info" />
      <Stat
        label="Fees to pay"
        value={balances == null ? DASH : owed || 'Nothing owed'}
        icon="wallet"
        tone={balances && balances.length > 0 ? 'warning' : 'good'}
      />
    </Grid>
  );
}
