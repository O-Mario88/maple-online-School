import { useState } from 'react';

import { Badge, Body, Button, Card, Chip, ChipRow, EmptyState, ErrorText, Field, Loading, Row, Screen, Segmented } from '@/components/ui';
import { InvitePeopleCard } from '@/features/school/InvitePeopleCard';
import { useMe } from '@/lib/auth/auth-context';
import { countOf } from '@/lib/plural';
import { leaderSchools, type SchoolRef } from '@/lib/roles';
import { useClasses, useRoster } from '@/lib/school/queries';
import { roleLabel, rosterGroups } from '@/lib/school/roster';
import { useEnrol, useMembers, useSetMemberStatus } from '@/lib/school/roster-queries';
import type { Class, SchoolMember } from '@/lib/school/types';
import { toast } from '@/lib/toast';

type Tab = 'staff' | 'learners' | 'parents' | 'pending';

/** One person: suspending takes a second tap; you can't suspend yourself. */
function MemberRow({ m, self }: { m: SchoolMember; self: boolean }) {
  const setStatus = useSetMemberStatus();
  const [confirming, setConfirming] = useState(false);
  const suspended = m.status === 'suspended';

  const toggle = () => {
    if (!suspended && !confirming) return setConfirming(true);
    setStatus.mutate(
      { id: m.id, status: suspended ? 'active' : 'suspended' },
      {
        onSuccess: (u) => toast(u.status === 'suspended' ? `${m.full_name} can no longer sign in to this school.` : `${m.full_name} has access again.`),
        onError: (e) => toast(e.message),
        onSettled: () => setConfirming(false),
      },
    );
  };

  let action = null;
  if (m.status === 'pending') action = <Badge label="Invited" tone="info" />;
  else if (!self) {
    action = (
      <Button
        compact
        variant={confirming ? 'danger' : suspended ? 'secondary' : 'ghost'}
        label={suspended ? 'Reactivate' : confirming ? 'Tap again to suspend' : 'Suspend'}
        busy={setStatus.isPending}
        onPress={toggle}
      />
    );
  }

  return <Row title={m.full_name} detail={`${roleLabel(m.role)}${suspended ? ' · suspended' : ''} · ${m.email}`} badge={action ?? undefined} />;
}

/** Put the school's learners on a class list. */
function EnrolCard({ classes, learners }: { classes: readonly Class[]; learners: readonly SchoolMember[] }) {
  const [picked, setClassId] = useState<number | null>(null);
  // Until someone picks a class, show the first one (classes may arrive after this card opens).
  const classId = picked ?? classes[0]?.id ?? null;
  const roster = useRoster(classId ?? 0);
  const enrol = useEnrol();
  const onList = new Set((roster.data?.students ?? []).map((s) => s.student));
  const active = learners.filter((l) => l.status === 'active');

  if (classes.length === 0) return null;
  return (
    <Card title="Class lists" subtitle="Add learners to a class so they see its lessons, work and register" icon="school">
      <ChipRow>
        {classes.map((c) => (
          <Chip key={c.id} label={c.title} selected={classId === c.id} onPress={() => setClassId(c.id)} />
        ))}
      </ChipRow>
      {roster.isPending ? <Loading label="Loading the class list" /> : null}
      <ErrorText message={roster.error?.message} />
      {roster.data && active.length === 0 ? <Body muted>Invite learners first; they appear here once they accept.</Body> : null}
      {roster.data
        ? active.map((l) => (
            <Row
              key={l.id}
              title={l.full_name}
              detail={l.email}
              badge={
                onList.has(l.user) ? (
                  <Badge label="On the list" tone="good" />
                ) : (
                  <Button
                    compact
                    variant="secondary"
                    label="Add to class"
                    busy={enrol.isPending && enrol.variables?.student === l.user}
                    onPress={() =>
                      classId !== null &&
                      enrol.mutate({ classId, student: l.user }, { onSuccess: () => toast(`${l.full_name} added to ${roster.data?.class.title ?? 'the class'}.`), onError: (e) => toast(e.message) })
                    }
                  />
                )
              }
            />
          ))
        : null}
    </Card>
  );
}

function SchoolRoster({ school, me }: { school: SchoolRef; me: number }) {
  const members = useMembers();
  const classes = useClasses();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('staff');

  if (members.isPending) return <Loading label="Loading the school’s people" />;
  if (members.error) return <ErrorText message={members.error.message} />;

  const g = rosterGroups(members.data ?? [], school.id, query);
  const shown = g[tab];
  const schoolClasses = (classes.data ?? []).filter((c) => c.institution === school.id);

  return (
    <>
      <Field label="Search by name or email" value={query} onChangeText={setQuery} autoCapitalize="none" placeholder="e.g. Amani" />
      <Segmented
        label="Group"
        options={[
          { value: 'staff', label: `Staff (${g.staff.length})` },
          { value: 'learners', label: `Learners (${g.learners.length})` },
          { value: 'parents', label: `Parents (${g.parents.length})` },
          { value: 'pending', label: `Invited (${g.pending.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />
      <Card title={school.name} subtitle={countOf(shown.length, 'person', 'people')} icon="people">
        {shown.length === 0 ? <Body muted>{query ? 'Nobody matches that search.' : 'Nobody here yet.'}</Body> : null}
        {shown.map((m) => (
          <MemberRow key={m.id} m={m} self={m.user === me} />
        ))}
      </Card>
      {tab === 'learners' ? <EnrolCard classes={schoolClasses} learners={g.learners} /> : null}
      <InvitePeopleCard school={school.id} name={school.name} />
    </>
  );
}

/** The school's people on the real API: staff, learners, parents and invitations, with access and class lists. */
export function LiveRosters() {
  const me = useMe();
  const schools = me.data ? leaderSchools(me.data.memberships) : [];
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const school = schools.find((s) => s.id === schoolId) ?? schools[0];

  return (
    <Screen width="wide" title="Rosters" subtitle="Everyone in your school: invite staff and learners, manage access and fill class lists.">
      {me.isPending ? <Loading label="Loading your schools" /> : null}
      {me.data && !school ? <EmptyState icon="people" title="For school leaders" body="Your school's leaders manage who belongs to the school." /> : null}
      {schools.length > 1 && school ? (
        <Segmented label="School" options={schools.map((s) => ({ value: String(s.id), label: s.name }))} value={String(school.id)} onChange={(v) => setSchoolId(Number(v))} />
      ) : null}
      {school && me.data ? <SchoolRoster key={school.id} school={school} me={me.data.id} /> : null}
    </Screen>
  );
}
