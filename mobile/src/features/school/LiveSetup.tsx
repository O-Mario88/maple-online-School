import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Body, Button, Card, Chip, ChipRow, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { FamilyLinksCard } from '@/features/family/FamilyLinksCard';
import { useStyles } from '@/hooks/use-styles';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/auth-context';
import { admissionsSchools, isLeader } from '@/lib/roles';
import { parseEmails } from '@/lib/school/invites';
import { toast } from '@/lib/toast';

const STEPS = ['School profile', 'Curriculum', 'Invite people', 'Family links'] as const;
const COUNTRIES = [
  { code: 'UG', label: 'Uganda' },
  { code: 'KE', label: 'Kenya' },
  { code: 'RW', label: 'Rwanda' },
] as const;
const ROLES: readonly { value: string; label: string }[] = [
  { value: 'subject_teacher', label: 'Teachers' },
  { value: 'class_teacher', label: 'Class teachers' },
  { value: 'deputy', label: 'Deputies' },
  { value: 'registrar', label: 'Registrar (fees)' },
  { value: 'student', label: 'Students' },
];

/** Create the school; the person creating it becomes its headteacher. */
function CreateSchool() {
  const { styles } = useStyles(makeStyles);
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]['code']>('UG');
  const [level, setLevel] = useState<'primary' | 'secondary'>('secondary');
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
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
    toast(`${name.trim()} is set up. You are its headteacher.`);
    await client.invalidateQueries({ queryKey: ['me'] });
  };

  return (
    <Card title="School profile" icon="school">
      <Field label="School name" value={name} onChangeText={setName} maxLength={255} placeholder="e.g. Kampala Hill School" />
      <Text style={styles.label}>Country</Text>
      <ChipRow>
        {COUNTRIES.map((c) => (
          <Chip key={c.code} label={c.label} selected={country === c.code} onPress={() => setCountry(c.code)} />
        ))}
      </ChipRow>
      <Text style={styles.label}>Level</Text>
      <ChipRow>
        <Chip label="Primary" selected={level === 'primary'} onPress={() => setLevel('primary')} />
        <Chip label="Secondary" selected={level === 'secondary'} onPress={() => setLevel('secondary')} />
      </ChipRow>
      <ErrorText message={problem} />
      <Button label="Create school" onPress={create} busy={busy} />
    </Card>
  );
}

/** Invite staff or learners to one school by email. */
function InvitePeople({ school, name }: { school: number; name: string }) {
  const [text, setText] = useState('');
  const [role, setRole] = useState('subject_teacher');
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const invite = async () => {
    const { valid, invalid } = parseEmails(text);
    if (invalid.length > 0 || valid.length === 0) {
      setProblem(invalid.length ? `These aren't email addresses: ${invalid.join(', ')}` : 'Paste at least one email address.');
      return;
    }
    setProblem(null);
    setBusy(true);
    const { data, error } = await api.POST('/api/v1/institutions/{id}/bulk_invite/', { params: { path: { id: school } }, body: { emails: valid, role } });
    setBusy(false);
    if (error || !data) {
      setProblem((error as { detail?: string } | undefined)?.detail ?? 'Could not send the invitations.');
      return;
    }
    setDone(`${data.detail} Each person gets an email: new staff choose a password from it, and people with an account accept from their school page.`);
    setText('');
  };

  return (
    <Card title={`Invite people to ${name}`} icon="people">
      <ChipRow>
        {ROLES.map((r) => (
          <Chip key={r.value} label={r.label} selected={role === r.value} onPress={() => setRole(r.value)} />
        ))}
      </ChipRow>
      <Field label="Email addresses (one per line)" value={text} onChangeText={setText} multiline autoCapitalize="none" keyboardType="email-address" />
      <ErrorText message={problem} />
      {done ? <Body>{done}</Body> : null}
      <Button label="Send invitations" onPress={invite} busy={busy} />
    </Card>
  );
}

/** The set-up wizard on the real API: create the school, its curriculum, staff invitations and parent links. */
export function LiveSetup() {
  const { styles } = useStyles(makeStyles);
  const me = useMe();
  const [step, setStep] = useState(0);
  if (!me.data) return null;
  const led = me.data.memberships.filter((m) => m.status === 'active' && isLeader([m]));
  const canCreate = me.data.role === 'institution' || me.data.role === 'admin';
  const admissions = admissionsSchools(me.data.memberships).length > 0;
  const last = step === STEPS.length - 1;

  if (!canCreate && led.length === 0 && !admissions) {
    return (
      <Screen title="Set up your school">
        <Body muted>Ask your school’s headteacher to invite you.</Body>
      </Screen>
    );
  }

  return (
    <Screen width="wide" title="Set up your school" subtitle="A few minutes. You can come back to any step.">
      <View style={styles.steps} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: STEPS.length, now: step + 1 }}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.step}>
            <View style={[styles.dot, i < step && styles.dotDone, i === step && styles.dotOn]}>
              <Text style={[styles.dotText, i <= step && styles.dotTextOn]}>{i < step ? '✓' : i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelOn]} onPress={() => setStep(i)} accessibilityRole="button">
              {label}
            </Text>
          </View>
        ))}
      </View>
      {step === 0 && led.length === 0 && canCreate ? <CreateSchool /> : null}
      {step === 0 && led.length > 0 ? (
        <Card title="School profile" icon="school">
          {led.map((m) => (
            <Body key={m.institution_id}>{`${m.institution_name} · you lead this school`}</Body>
          ))}
        </Card>
      ) : null}
      {step === 1 ? (
        <Card title="Curriculum" subtitle="Classes and subjects come ready" icon="map">
          <Banner tone="good" title="Uganda NCDC (UNEB): ready" body="Nursery to S6, 48 subjects, compulsory subjects and elective rules are set up for every new school." />
        </Card>
      ) : null}
      {step === 2 && led.length > 0 ? led.map((m) => <InvitePeople key={m.institution_id} school={m.institution_id} name={m.institution_name} />) : null}
      {step === 2 && led.length === 0 ? <Body muted>Create your school first, then invite its staff here.</Body> : null}
      {step === 3 && admissions ? <FamilyLinksCard /> : null}
      {step === 3 && !admissions ? <Body muted>Parents’ requests to see their children appear here for the headteacher, deputy and registrar.</Body> : null}
      <View style={styles.actions}>
        <Button label="Back" variant="secondary" disabled={step === 0} onPress={() => setStep(step - 1)} />
        <Button label={last ? 'Finish' : 'Continue'} icon="check" onPress={() => (last ? toast('Set-up saved. Come back any time.') : setStep(step + 1))} />
      </View>
    </Screen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    label: { ...Type.small, color: t.text, fontWeight: '600' },
    steps: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
    step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: t.borderStrong, alignItems: 'center', justifyContent: 'center' },
    dotDone: { backgroundColor: t.successSoft, borderColor: t.success },
    dotOn: { backgroundColor: t.accent, borderColor: t.accent },
    dotText: { ...Type.caption, color: t.textMuted },
    dotTextOn: { color: t.text },
    stepLabel: { ...Type.small, color: t.textSecondary },
    stepLabelOn: { color: t.text, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: Spacing.two },
  });
}
