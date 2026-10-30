import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Button, Card, ErrorText, Field, Screen } from '@/components/ui';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/auth-context';
import { FamilyLinksCard } from '@/features/family/FamilyLinksCard';
import { admissionsSchools, isLeader } from '@/lib/roles';
import { parseEmails } from '@/lib/school/invites';

const tick = (on: boolean, label: string) => (on ? `✓ ${label}` : label);

/** Set up a school (playbook section 8) and invite its staff. */
export default function SchoolScreen() {
  const me = useMe();
  if (!me.data) return null;
  const led = me.data.memberships.filter((m) => m.status === 'active' && isLeader([m]));
  const canCreate = me.data.role === 'institution' || me.data.role === 'admin';
  const admissions = admissionsSchools(me.data.memberships).length > 0;

  return (
    <Screen width="wide" title="Your school" subtitle="Set up your school and invite staff">
      {canCreate && led.length === 0 ? <SetUpCard /> : null}
      {led.map((m) => (
        <InviteCard key={m.institution_id} school={m.institution_id} name={m.institution_name} />
      ))}
      {admissions ? <FamilyLinksCard /> : null}
      {!canCreate && led.length === 0 && !admissions ? <Body muted>Ask your school's headteacher to invite you.</Body> : null}
    </Screen>
  );
}

function SetUpCard() {
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'UG' | 'KE' | 'RW'>('UG');
  const [level, setLevel] = useState<'primary' | 'secondary'>('secondary');
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) {
      setProblem('Enter the school name.');
      return;
    }
    setBusy(true);
    const { error } = await api.POST('/api/v1/institutions/', { body: { name: name.trim(), country_code: country, school_level: level } });
    setBusy(false);
    if (error) {
      setProblem((error as { detail?: string }).detail ?? 'Could not create the school.');
      return;
    }
    await client.invalidateQueries({ queryKey: ['me'] }); // you are now its headteacher
  }

  return (
    <Card title="Set up your school">
      <Field label="School name" value={name} onChangeText={setName} maxLength={255} placeholder="e.g. Kampala Hill School" />
      <Body muted>Country</Body>
      <View style={styles.choices}>
        {(['UG', 'KE', 'RW'] as const).map((c) => (
          <Button key={c} label={tick(country === c, { UG: 'Uganda', KE: 'Kenya', RW: 'Rwanda' }[c])} variant="secondary" onPress={() => setCountry(c)} />
        ))}
      </View>
      <View style={styles.choices}>
        <Button label={tick(level === 'primary', 'Primary')} variant="secondary" onPress={() => setLevel('primary')} />
        <Button label={tick(level === 'secondary', 'Secondary')} variant="secondary" onPress={() => setLevel('secondary')} />
      </View>
      <ErrorText message={problem} />
      <Button label="Create school" onPress={create} busy={busy} />
    </Card>
  );
}

const ROLES: readonly { value: string; label: string }[] = [
  { value: 'subject_teacher', label: 'Teachers' },
  { value: 'class_teacher', label: 'Class teachers' },
  { value: 'deputy', label: 'Deputies' },
  { value: 'registrar', label: 'Registrar (fees)' },
  { value: 'student', label: 'Students' },
];

function InviteCard({ school, name }: { school: number; name: string }) {
  const [text, setText] = useState('');
  const [role, setRole] = useState('subject_teacher');
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function invite() {
    const { valid, invalid } = parseEmails(text);
    if (invalid.length > 0 || valid.length === 0) {
      setProblem(invalid.length ? `These aren't email addresses: ${invalid.join(', ')}` : 'Paste at least one email address.');
      return;
    }
    setProblem(null);
    setBusy(true);
    const { data, error } = await api.POST('/api/v1/institutions/{id}/bulk_invite/', {
      params: { path: { id: school } },
      body: { emails: valid, role },
    });
    setBusy(false);
    if (error || !data) {
      setProblem((error as { detail?: string } | undefined)?.detail ?? 'Could not send the invitations.');
      return;
    }
    setDone(`${data.detail} Each person gets an email: new staff choose a password from it, and people with an account accept from their school page.`);
    setText('');
  }

  return (
    <Card title={`Invite people to ${name}`}>
      <View style={styles.choices}>
        {ROLES.map((r) => (
          <Button key={r.value} label={tick(role === r.value, r.label)} variant="secondary" onPress={() => setRole(r.value)} />
        ))}
      </View>
      <Field label="Email addresses (one per line)" value={text} onChangeText={setText} multiline autoCapitalize="none" keyboardType="email-address" />
      <ErrorText message={problem} />
      {done ? <Body>{done}</Body> : null}
      <Button label="Send invitations" onPress={invite} busy={busy} />
    </Card>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
});
