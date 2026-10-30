import { router } from 'expo-router';

import { Badge, Body, Button, Card, ErrorText, Grid, Loading, Row, Screen, Segmented, useShell } from '@/components/ui';
import { HomeStats } from '@/features/home/HomeStats';
import { AttendanceSection } from '@/features/learner/AttendanceSection';
import { ParentResultsSection } from '@/features/parent/ParentResultsSection';
import { ReportsSection } from '@/features/shared/ReportsSection';
import { TodaySection } from '@/features/shared/TodaySection';
import { StudentWorkSection } from '@/features/student/StudentWorkSection';
import { ClassesSection } from '@/features/teacher/ClassesSection';
import { TeacherWorkSection } from '@/features/teacher/TeacherWorkSection';
import type { Me } from '@/lib/api/client';
import { useAuth, useMe } from '@/lib/auth/auth-context';
import { linkStatus, relationshipLabel } from '@/lib/family/links';
import { useFamilyLinks } from '@/lib/family/queries';
import { greeting } from '@/lib/home';
import { type Portal, PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { homeFor } from '@/lib/roles';

// Each portal's home uses the matching role's title and subtitle.
const PORTAL_ROLE: Readonly<Record<Portal, string>> = {
  learner: 'student',
  teacher: 'teacher',
  parent: 'parent',
  school: 'institution',
  command: 'admin',
};

export default function HomeScreen() {
  const me = useMe();
  const { portal, portals, setPortal } = usePortal();
  const { wide } = useShell();
  const { signOut } = useAuth();

  if (me.isPending) {
    return (
      <Screen>
        <Loading label="Loading your account" />
      </Screen>
    );
  }
  if (me.isError) {
    return (
      <Screen title="Something went wrong">
        <ErrorText message={me.error.message} />
        <Button label="Try again" variant="secondary" onPress={() => me.refetch()} />
      </Screen>
    );
  }

  const user = me.data;
  const now = new Date();
  const firstName = user.full_name.split(' ')[0] || user.full_name;
  const home = homeFor(PORTAL_ROLE[portal]);
  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen
      width="wide"
      eyebrow={`${today} · ${home.title}`}
      title={`${greeting(now)}, ${firstName}`}
      subtitle={home.subtitle}>
      {!wide && portals.length > 1 ? (
        <Segmented
          label="Switch portal"
          options={portals.map((p) => ({ value: p, label: PORTAL_LABELS[p] }))}
          value={portal}
          onChange={setPortal}
        />
      ) : null}
      <HomeStats portal={portal} user={user} />
      <PortalHome portal={portal} user={user} />
      {!wide ? <Button label="Sign out" variant="secondary" icon="logout" onPress={signOut} /> : null}
    </Screen>
  );
}

function PortalHome({ portal, user }: { portal: Portal; user: Me }) {
  switch (portal) {
    case 'school':
      return (
        <Grid min={380}>
          <TodaySection />
          <QuickActions
            actions={[
              { title: 'School fees', detail: 'Bill classes, record payments, export the ledger', href: '/fees', icon: 'wallet' },
              { title: 'Staff and set-up', detail: 'Invite teachers and manage your school', href: '/school', icon: 'school' },
              { title: 'Curriculum', detail: 'The Uganda subjects your classes follow', href: '/curriculum', icon: 'map' },
            ]}
          />
          <ClassesSection />
          <ReportsSection staff />
          <SchoolsCard user={user} />
        </Grid>
      );
    case 'teacher':
      return (
        <Grid min={380}>
          <TodaySection />
          <ClassesSection />
          <TeacherWorkSection />
          <ReportsSection staff />
        </Grid>
      );
    case 'parent':
      return (
        <Grid min={380}>
          <ChildrenCard user={user} />
          <ParentResultsSection />
          <AttendanceSection />
          <ReportsSection staff={false} />
        </Grid>
      );
    case 'command':
      return (
        <Grid min={380}>
          <QuickActions
            actions={[
              { title: 'Curriculum', detail: 'National curricula schools start from', href: '/curriculum', icon: 'map' },
              { title: 'Library moderation', detail: 'Review items shared with every school', href: '/library', icon: 'library' },
            ]}
          />
        </Grid>
      );
    default:
      return (
        <Grid min={380}>
          <TodaySection />
          <StudentWorkSection />
          <AttendanceSection />
          <ReportsSection staff={false} />
        </Grid>
      );
  }
}

interface QuickAction {
  title: string;
  detail: string;
  href: '/fees' | '/school' | '/curriculum' | '/library';
  icon: 'wallet' | 'school' | 'map' | 'library';
}

function QuickActions({ actions }: { actions: readonly QuickAction[] }) {
  return (
    <Card title="Quick actions" icon="sparkle">
      {actions.map((a) => (
        <Row key={a.href} icon={a.icon} title={a.title} detail={a.detail} onPress={() => router.navigate(a.href)} />
      ))}
    </Card>
  );
}

function humanize(value: string): string {
  const words = value.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function SchoolsCard({ user }: { user: Me }) {
  return (
    <Card title="Your schools" icon="school">
      {user.memberships.length === 0 ? (
        <Body muted>You haven’t joined a school yet.</Body>
      ) : (
        user.memberships.map((m) => (
          <Row
            key={`${m.institution_id}-${m.role}`}
            title={m.institution_name}
            detail={humanize(m.role)}
            badge={m.status === 'active' ? undefined : <Badge label={humanize(m.status)} tone="warning" />}
          />
        ))
      )}
    </Card>
  );
}

function ChildrenCard({ user }: { user: Me }) {
  const links = useFamilyLinks();
  // Confirmed children come from the account; the rest show where they stand.
  const waiting = (links.data ?? []).filter((l) => l.status !== 'approved' && l.parent.id === user.id);
  return (
    <Card title="Your children" icon="people">
      {user.children.length === 0 && waiting.length === 0 ? (
        <Body muted>No children are linked yet. Your school confirms each link before you can see a child’s records.</Body>
      ) : null}
      {user.children.map((c) => (
        <Row key={c.user_id} title={c.full_name} detail={humanize(c.relationship)} badge={<Badge label="Confirmed" tone="good" />} />
      ))}
      {waiting.map((l) => {
        const status = linkStatus(l.status);
        return (
          <Row
            key={l.id}
            title={l.student.name}
            detail={[relationshipLabel(l.relationship), l.school_name].filter(Boolean).join(' · ')}
            badge={<Badge label={status.label} tone={status.tone} />}
          />
        );
      })}
    </Card>
  );
}
