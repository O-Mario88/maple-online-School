import { useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, ErrorText, Field, Loading, Row } from '@/components/ui';
import { lessonWhen, upcomingLessons } from '@/lib/lessons/lessons';
import { liveAction, providerFor, type LiveAction, type LiveSession } from '@/lib/lessons/live';
import { useAddLiveSession, useLessons, useLiveSessions } from '@/lib/lessons/queries';

const STATUS_TEXT: Readonly<Record<'wait' | 'ended' | 'cancelled', string>> = {
  wait: 'Opens 15 minutes before',
  ended: 'Ended · replay coming',
  cancelled: 'Cancelled',
};

/** Live sessions for the person's lessons, with Join or Watch replay. */
export function LiveSessionsCard() {
  const sessions = useLiveSessions();
  const [openError, setOpenError] = useState<string | null>(null);

  if (sessions.isPending) return <Loading label="Loading live sessions" />;
  if (sessions.error) return <ErrorText message={sessions.error.message} />;
  if (sessions.data.length === 0) return null;

  async function open(href: string) {
    try {
      await Linking.openURL(href);
    } catch {
      setOpenError('Could not open the meeting on this device.');
    }
  }

  return (
    <Card title="Live sessions">
      <ErrorText message={openError} />
      {sessions.data.map((s) => (
        <SessionRow key={s.id} session={s} action={liveAction(s, new Date())} onOpen={open} />
      ))}
    </Card>
  );
}

interface SessionRowProps {
  session: LiveSession;
  action: LiveAction;
  onOpen: (href: string) => void;
}

function SessionRow({ session, action, onOpen }: SessionRowProps) {
  const when = session.scheduled_start ? lessonWhen(session.scheduled_start) : 'Time to be set';
  const detail = [when, session.hostName, session.provider === 'zoom' ? 'Zoom' : 'Google Meet'].join(' · ');
  if (action.kind === 'join' || action.kind === 'replay') {
    const label = action.kind === 'join' ? 'Join' : 'Watch replay';
    return (
      <View>
        <Row title={session.title} detail={detail} badge={<Badge label={action.kind === 'join' ? 'Live' : 'Replay'} tone="accent" />} />
        <Button label={`${label}: ${session.title}`} onPress={() => onOpen(action.href)} />
      </View>
    );
  }
  return <Row title={session.title} detail={`${detail} · ${STATUS_TEXT[action.kind]}`} />;
}

/** Staff attach a Google Meet or Zoom link to an upcoming lesson. */
export function AddLiveLinkCard() {
  const lessons = useLessons();
  const sessions = useLiveSessions();
  const add = useAddLiveSession();
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [link, setLink] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  const open = useMemo(() => {
    const taken = new Set((sessions.data ?? []).map((s) => s.lesson));
    return upcomingLessons(lessons.data ?? [], new Date()).filter((l) => !taken.has(l.id));
  }, [lessons.data, sessions.data]);

  if (lessons.isPending || sessions.isPending) return null;
  if (open.length === 0) return null;
  const chosen = lessonId ?? open[0].id;

  async function save() {
    const provider = providerFor(link);
    setProblem(provider ? null : 'Paste a Google Meet (https://meet.google.com/…) or Zoom link.');
    if (!provider) return;
    await add.mutateAsync({ lesson: chosen, meeting_link: link.trim(), provider });
    setLink('');
  }

  return (
    <Card title="Add a live link">
      <Body muted>Lesson</Body>
      <View style={styles.choices}>
        {open.map((l) => (
          <Button
            key={l.id}
            label={`${l.id === chosen ? '✓ ' : ''}${l.title} · ${lessonWhen(l.scheduled_at)}`}
            variant="secondary"
            onPress={() => setLessonId(l.id)}
          />
        ))}
      </View>
      <Field label="Meeting link" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" placeholder="https://meet.google.com/…" />
      <ErrorText message={problem} />
      <ErrorText message={add.error?.message} />
      <Button label="Add live session" onPress={save} busy={add.isPending} />
    </Card>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
});
