import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Body, Button, Card, Chip, ChipRow, ErrorText, Field } from '@/components/ui';
import { api } from '@/lib/api/client';
import { parseEmails } from '@/lib/school/invites';

const ROLES: readonly { value: string; label: string }[] = [
  { value: 'subject_teacher', label: 'Teachers' },
  { value: 'class_teacher', label: 'Class teachers' },
  { value: 'deputy', label: 'Deputies' },
  { value: 'registrar', label: 'Registrar (fees)' },
  { value: 'student', label: 'Students' },
];

/** Invite staff or learners to one school by email. */
export function InvitePeopleCard({ school, name }: { school: number; name: string }) {
  const client = useQueryClient();
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
    await client.invalidateQueries({ queryKey: ['members'] });
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
