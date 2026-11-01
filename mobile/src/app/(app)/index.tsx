import { router } from 'expo-router';

import { Badge, Body, Button, Card, ErrorText, Grid, Loading, Row, Screen, Segmented, useShell } from '@/components/ui';
import { InboxBell } from '@/components/shell/InboxBell';
import { HomeStats } from '@/features/home/HomeStats';
import { LearnersEntryCard } from '@/features/insights/LearnersEntryCard';
import { AttendanceSection } from '@/features/learner/AttendanceSection';
import { ChildrenCard } from '@/features/parent/ChildrenCard';
import { ParentResultsSection } from '@/features/parent/ParentResultsSection';
import { HOME_REF_WIDTH, HomeDesk, HomePhone } from '@/features/learner/home/HomeViews';
import { LiveHome } from '@/features/learner/home/LiveHome';
import { RefScale } from '@/features/public/home/RefScale';
import { mockData } from '@/lib/mock';
import { ScrollView, useWindowDimensions } from 'react-native';
import { ReportsSection } from '@/features/shared/ReportsSection';
import { TodaySection } from '@/features/shared/TodaySection';
import { ClassesSection } from '@/features/teacher/ClassesSection';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { TEACHER_REF_WIDTH, TeacherHomeDesk, TeacherHomePhone } from '@/features/teacher/home/TeacherHomeViews';
import { TeacherWorkSection } from '@/features/teacher/TeacherWorkSection';
import type { Me } from '@/lib/api/client';
import { useAuth, useMe } from '@/lib/auth/auth-context';
import { greeting, humanize } from '@/lib/home';
import { type Portal, PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { homeFor } from '@/lib/roles';

const TEACHER_BG = { backgroundColor: CANVAS };

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
  const { width } = useWindowDimensions();

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
  const learnerHome = portal === 'learner' ? mockData()?.learner.learnerHome : undefined;
  if (learnerHome) {
    // Design build: the learner home is its reference, sidebar included (drawn at its pixels, then scaled).
    if (!wide) return <HomePhone h={learnerHome} now={now} />;
    return (
      <ScrollView style={{ backgroundColor: '#EEF3FA' }}>
        <RefScale width={width} refWidth={HOME_REF_WIDTH}>
          <HomeDesk h={learnerHome} now={now} />
        </RefScale>
      </ScrollView>
    );
  }
  const teacherHome = portal === 'teacher' ? mockData()?.teacher.teacherHome : undefined;
  if (teacherHome) {
    // Design build: the teacher home reference, top bar and sidebar included (drawn at its pixels, then scaled).
    if (!wide) return <TeacherHomePhone h={teacherHome} now={now} />;
    return (
      <ScrollView style={TEACHER_BG}>
        <RefScale width={width} refWidth={TEACHER_REF_WIDTH}>
          <TeacherHomeDesk h={teacherHome} now={now} />
        </RefScale>
      </ScrollView>
    );
  }
  // Real builds: the learner home in the design's look, on the API.
  if (portal === 'learner') return <LiveHome firstName={firstName} />;
  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen
      width="wide"
      eyebrow={`${today} · ${home.title}`}
      title={`${greeting(now)}, ${firstName}`}
      subtitle={home.subtitle}
      actions={wide ? undefined : <InboxBell />}>
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
              { title: 'Staff and set-up', detail: 'Invite teachers and manage your school', href: '/admin/onboarding', icon: 'school' },
              { title: 'Curriculum', detail: 'The Uganda subjects your classes follow', href: '/curriculum', icon: 'map' },
              { title: 'Messages', detail: 'Every conversation between staff and families', href: '/messages', icon: 'chat' },
            ]}
          />
          <ClassesSection />
          <LearnersEntryCard />
          <ReportsSection staff />
          <SchoolsCard user={user} />
        </Grid>
      );
    case 'teacher':
      return (
        <Grid min={380}>
          <TodaySection />
          <LearnersEntryCard />
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
              { title: 'Library moderation', detail: 'Review items shared with every school', href: '/learn/library', icon: 'library' },
            ]}
          />
        </Grid>
      );
    default:
      return null;
  }
}

interface QuickAction {
  title: string;
  detail: string;
  href: '/fees' | '/admin/onboarding' | '/curriculum' | '/learn/library' | '/messages';
  icon: 'wallet' | 'school' | 'map' | 'library' | 'chat';
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

