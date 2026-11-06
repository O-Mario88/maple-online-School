import { router } from 'expo-router';

import { Badge, Body, Button, Card, ErrorText, Grid, Loading, ProgressBar, Row, Screen, Segmented, Stat, useShell } from '@/components/ui';
import { InboxBell } from '@/components/shell/InboxBell';
import { HomeStats } from '@/features/home/HomeStats';
import { LearnersEntryCard } from '@/features/insights/LearnersEntryCard';
import { AttendanceSection } from '@/features/learner/AttendanceSection';
import { ChildrenCard } from '@/features/parent/ChildrenCard';
import {
  PARENT_HOME_REF_WIDTH,
  ParentHomeDesk,
  ParentHomePhone,
} from '@/features/parent/ParentHomeViews';
import { ParentResultsSection } from '@/features/parent/ParentResultsSection';
import { HOME_REF_WIDTH, HomeDesk, HomePhone } from '@/features/learner/home/HomeViews';
import { LiveHome } from '@/features/learner/home/LiveHome';
import { HomeCanvas } from '@/features/learner/home/HomeFrame';
import { RefScale } from '@/features/public/home/RefScale';
import { mockData } from '@/lib/mock';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AdminDesk, AdminPhone, PageHead } from '@/features/school/kit/AdminKit';
import { ReportsSection } from '@/features/shared/ReportsSection';
import { TodaySection } from '@/features/shared/TodaySection';
import { ClassesSection } from '@/features/teacher/ClassesSection';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { TEACHER_REF_WIDTH, TeacherHomeDesk, TeacherHomePhone } from '@/features/teacher/home/TeacherHomeViews';
import { TeacherWorkSection } from '@/features/teacher/TeacherWorkSection';
import type { Me } from '@/lib/api/client';
import { useAuth, useMe } from '@/lib/auth/auth-context';
import { addressName, greeting, humanize } from '@/lib/home';
import { type Portal, PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { homeFor } from '@/lib/roles';
import { Maple } from '@/constants/maple';
import { PageScroll } from '@/components/shell/PageScroll';

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
  const firstName = addressName(user.full_name);
  const home = homeFor(PORTAL_ROLE[portal]);
  const learnerHome = portal === 'learner' ? mockData()?.learner.learnerHome : undefined;
  if (learnerHome) {
    // Design build: the learner home is its reference, sidebar included (drawn at its pixels, then scaled).
    if (!wide) return <HomePhone h={learnerHome} now={now} />;
    return (
      <PageScroll style={{ backgroundColor: Maple.blueSoft }}>
        <HomeCanvas refWidth={HOME_REF_WIDTH}>
          <HomeDesk h={learnerHome} now={now} />
        </HomeCanvas>
      </PageScroll>
    );
  }
  const teacherHome = portal === 'teacher' ? mockData()?.teacher.teacherHome : undefined;
  if (teacherHome) {
    // Design build: the teacher home reference, top bar and sidebar included (drawn at its pixels, then scaled).
    if (!wide) return <TeacherHomePhone h={teacherHome} now={now} />;
    return (
      <PageScroll style={TEACHER_BG}>
        <RefScale width={width} refWidth={TEACHER_REF_WIDTH}>
          <TeacherHomeDesk h={teacherHome} now={now} />
        </RefScale>
      </PageScroll>
    );
  }
  const parentHome = portal === 'parent' ? mockData()?.family.parentHome : undefined;
  if (parentHome) {
    // Design build: the parent dashboard reference (Image 2), with multi-child switcher and cross-school QR/login claiming.
    if (!wide) return <ParentHomePhone p={parentHome} />;
    return (
      <PageScroll style={{ backgroundColor: Maple.blueSoft }}>
        <RefScale width={width} refWidth={PARENT_HOME_REF_WIDTH}>
          <ParentHomeDesk p={parentHome} />
        </RefScale>
      </PageScroll>
    );
  }
  // Real builds: the learner home in the design's look, on the API.
  if (portal === 'learner') return <LiveHome firstName={firstName} />;
  // Design builds: the school dashboard sits in the same admin frame (sidebar, top bar, signed-in
  // person) as every other school page, so moving between them never swaps the shell.
  const schoolAdmin = portal === 'school' ? mockData()?.schoolAdmin : undefined;
  if (schoolAdmin) {
    const title = `${greeting(now)}, ${firstName}`;
    const body = (
      <View style={dash.body}>
        <HomeStats portal={portal} user={user} />
        <PortalHome portal={portal} user={user} />
      </View>
    );
    if (!wide) {
      return (
        <AdminPhone me={schoolAdmin.me}>
          <PageHead phone title={title} subtitle={home.subtitle} />
          {body}
        </AdminPhone>
      );
    }
    return (
      <AdminDesk me={schoolAdmin.me} search="Search students, payments, or reports..." active="Dashboard">
        <PageHead title={title} subtitle={home.subtitle} />
        {body}
      </AdminDesk>
    );
  }
  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen
      width="wide"
      eyebrow={`${today} · ${home.title}`}
      title={`${greeting(now)}, ${firstName}`}
      subtitle={home.subtitle}
      actions={wide ? undefined : <InboxBell />}>
      {/* Design builds switch modes with the mode button in the header, so the chips would repeat it. */}
      {!wide && portals.length > 1 && !mockData() ? (
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
  const mock = mockData();
  switch (portal) {
    case 'school': {
      const lead = mock?.school.leadership;
      const audit = mock?.school.audit;
      return (
        <>
          {lead ? (
            <Grid min={180}>
              <Stat label="Student attendance" value={`${Math.round(lead.studentAttendance * 100)}%`} detail="Across 6 streams" icon="check" tone="good" />
              <Stat label="Teacher attendance" value={`${Math.round(lead.teacherAttendance * 100)}%`} detail="Active today" icon="people" tone="info" />
              <Stat label="Syllabus coverage" value={`${Math.round(lead.syllabusCoverage * 100)}%`} detail="Term 3 target: 75%" icon="book" tone="accent" />
              <Stat label="Fee collection" value={`${Math.round(lead.feeCollection * 100)}%`} detail="Term 3 invoices" icon="wallet" tone="good" />
            </Grid>
          ) : null}
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
            {lead ? (
              <Card title="Class mastery & syllabus coverage" icon="chart">
                {lead.byClass.map((c) => (
                  <ProgressBar
                    key={c.class}
                    label={`${c.class} · Attendance ${Math.round(c.attendance * 100)}% · Mastery ${Math.round(c.mastery * 100)}%`}
                    value={c.coverage}
                    tone={c.coverage >= 0.7 ? 'good' : 'warning'}
                  />
                ))}
              </Card>
            ) : null}
            <ClassesSection />
            <LearnersEntryCard />
            <ReportsSection staff />
            <SchoolsCard user={user} />
            {audit ? (
              <Card title="Recent school audit log" icon="shield">
                {audit.map((a) => (
                  <Row key={`${a.when}-${a.action}`} title={a.action} detail={`${a.who} · ${a.when}`} />
                ))}
              </Card>
            ) : null}
          </Grid>
        </>
      );
    }
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
    case 'command': {
      const cmd = mock?.command;
      return (
        <>
          {cmd ? (
            <Grid min={180}>
              {cmd.northStar.map((n) => (
                <Stat key={n.label} label={n.label} value={n.value} detail={n.delta || undefined} icon="chart" tone="accent" />
              ))}
            </Grid>
          ) : null}
          <Grid min={380}>
            {cmd ? (
              <>
                <Card title="Trust & safety queue" icon="flag">
                  {cmd.trustQueue.map((t) => (
                    <Row
                      key={t.id}
                      title={`${t.kind} · ${t.subject}`}
                      detail={t.ai}
                      badge={<Badge label={t.priority} tone={t.priority === 'urgent' || t.priority === 'high' ? 'warning' : 'neutral'} />}
                      onPress={() => router.navigate('/command/trust')}
                    />
                  ))}
                </Card>
                <Card title="School adoption pipeline" icon="school">
                  {cmd.pipeline.map((p) => (
                    <Row
                      key={p.school}
                      title={p.school}
                      detail={`${p.teachersActive} active teachers · ${p.learners} learners`}
                      badge={<Badge label={p.stage} tone={p.stage === 'Contract' ? 'good' : 'accent'} />}
                      onPress={() => router.navigate('/command/institutions')}
                    />
                  ))}
                </Card>
                <Card title="Platform operations health" icon="live">
                  {cmd.ops.map((o) => (
                    <Row
                      key={o.label}
                      title={o.label}
                      detail={o.value}
                      badge={<Badge label={o.ok ? 'Healthy' : 'Attention'} tone={o.ok ? 'good' : 'warning'} />}
                      onPress={() => router.navigate('/command/ops')}
                    />
                  ))}
                </Card>
              </>
            ) : null}
            <QuickActions
              actions={[
                { title: 'Curriculum', detail: 'National curricula schools start from', href: '/curriculum', icon: 'map' },
                { title: 'Library moderation', detail: 'Review items shared with every school', href: '/learn/library', icon: 'library' },
              ]}
            />
          </Grid>
        </>
      );
    }
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

const dash = StyleSheet.create({ body: { gap: 16, marginTop: 16 } });
