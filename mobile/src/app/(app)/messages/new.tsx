import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, EmptyState, ErrorText, Field, Loading, Screen, Segmented } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { useContacts, useStartThread } from '@/lib/messages/queries';

function humanize(value: string): string {
  const words = value.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Start a conversation about a learner. Parents choose their child and one of
 * the child's teachers or school leaders; staff arrive here from a learner.
 */
export default function NewConversationScreen() {
  const params = useLocalSearchParams<{ student?: string; name?: string }>();
  const me = useMe();
  const children = me.data?.children ?? [];
  const isParent = children.length > 0 && !params.student;
  const [child, setChild] = useState<string>(params.student ?? String(children[0]?.user_id ?? ''));
  const student = Number(child) || null;
  const contacts = useContacts(isParent ? student : null);
  const [staff, setStaff] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const start = useStartThread();

  if (!student) {
    return (
      <Screen back title="New conversation">
        <EmptyState
          icon="people"
          title="Start from a learner"
          body="Open a class from “Learners who need you” and choose a learner to write to their family."
        />
      </Screen>
    );
  }

  const chosenStaff = isParent ? Number(staff) || contacts.data?.[0]?.id : undefined;
  const ready = subject.trim() !== '' && body.trim() !== '' && (!isParent || chosenStaff != null);

  async function send() {
    const thread = await start.mutateAsync({ student: student as number, staff: chosenStaff, subject: subject.trim(), body: body.trim() });
    router.replace({ pathname: '/messages/[id]', params: { id: String(thread.id) } });
  }

  return (
    <Screen
      back
      title="New conversation"
      subtitle={isParent ? 'Write to one of your child’s teachers or the school’s leaders' : `Write to ${params.name ?? 'the learner'}’s family`}>
      <Card>
        {isParent && children.length > 1 ? (
          <Segmented
            label="Your child"
            options={children.map((c) => ({ value: String(c.user_id), label: c.full_name }))}
            value={child}
            onChange={(v) => {
              setChild(v);
              setStaff('');
            }}
          />
        ) : null}
        {isParent ? (
          contacts.isPending ? (
            <Loading label="Loading teachers" />
          ) : contacts.isError ? (
            <ErrorText message={contacts.error.message} />
          ) : contacts.data.length === 0 ? (
            <Body muted>Your child has no teachers to write to yet.</Body>
          ) : (
            <Segmented
              label="Write to"
              options={contacts.data.map((c) => ({ value: String(c.id), label: `${c.name} · ${humanize(c.role)}` }))}
              value={String(chosenStaff ?? '')}
              onChange={setStaff}
            />
          )
        ) : null}
        <Field label="Subject" value={subject} onChangeText={setSubject} maxLength={200} placeholder="e.g. Missed days this week" />
        <Field label="Message" value={body} onChangeText={setBody} multiline maxLength={4000} placeholder="Write your message…" />
        <ErrorText message={start.error?.message} />
        <Button label="Send" icon="check" busy={start.isPending} disabled={!ready} onPress={send} />
      </Card>
    </Screen>
  );
}
