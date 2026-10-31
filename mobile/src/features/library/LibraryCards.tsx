import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, ErrorText, Field, Loading, Row } from '@/components/ui';
import { parseLessonTime } from '@/lib/lessons/lessons';
import { checkNewLink, dueLabel, itemDetail, itemHref, type LibraryChoice, type LibraryItem, MEDIA_URL } from '@/lib/library/library';
import { useAddItem, useAssignedReading, useContinue, useLibrary, useRecordProgress, useShareWithClass } from '@/lib/library/queries';
import { useClasses } from '@/lib/school/queries';


type OnError = (message: string) => void;

async function openLink(href: string | null, onError: OnError) {
  if (!href) {
    onError('This item has no file or link yet.');
    return;
  }
  try {
    await Linking.openURL(href);
  } catch {
    onError('Could not open this on this device.');
  }
}

/** Reading assigned to the student or a parent's children, soonest due first. */
export function AssignedCard({ isStudent, onError }: { isStudent: boolean; onError: OnError }) {
  const assigned = useAssignedReading();
  const progress = useRecordProgress();
  if (assigned.isPending) return <Loading label="Loading assigned reading" />;
  if (assigned.error) return <ErrorText message={assigned.error.message} />;
  if (assigned.data.length === 0) return null;
  const now = new Date();

  return (
    <Card title="Assigned reading">
      {assigned.data.map((a) => (
        <View key={a.id}>
          <Row
            title={a.title}
            detail={[dueLabel(a.due_date, now), a.note, a.is_completed ? 'Done' : `${Math.round(Number(a.completion_percentage))}%`]
              .filter(Boolean)
              .join(' · ')}
            badge={a.is_completed ? <Badge label="Done" tone="good" /> : a.required ? <Badge label="Required" tone="accent" /> : undefined}
          />
          <View style={styles.actions}>
            <Button
              label={`Open “${a.title}”`}
              variant="secondary"
              onPress={async () => {
                if (isStudent) progress.mutate({ item: a.item, completion: 0, new_visit: true });
                await openLink(itemHref(a, MEDIA_URL), onError);
              }}
            />
            {isStudent && !a.is_completed ? (
              <Button label="Mark as done" variant="secondary" onPress={() => progress.mutate({ item: a.item, completion: 100 })} />
            ) : null}
          </View>
        </View>
      ))}
      <ErrorText message={progress.error?.message} />
    </Card>
  );
}

/** The student's unfinished items. */
export function ContinueCard({ onError }: { onError: OnError }) {
  const items = useContinue(true);
  if (items.isPending || items.error || items.data.length === 0) return null;
  return (
    <Card title="Continue">
      {items.data.map((c) => (
        <Row
          key={c.item}
          title={c.title}
          detail={`${Math.round(Number(c.completion_percentage))}% done`}
          onPress={() => openLink(itemHref(c, MEDIA_URL), onError)}
          accessibilityHint="Opens where you left off"
        />
      ))}
    </Card>
  );
}

/** Search everything the person can see. */
export function BrowseCard({ onError }: { onError: OnError }) {
  const [search, setSearch] = useState('');
  const items = useLibrary(search);
  return (
    <Card title="Find in the library">
      <Field label="Search" value={search} onChangeText={setSearch} placeholder="Title or topic" autoCorrect={false} />
      {items.isPending ? <Loading label="Searching the library" /> : null}
      {items.error ? <ErrorText message={items.error.message} /> : null}
      {items.data?.length === 0 ? <Body muted>{search.trim() ? 'Nothing matches that search.' : 'The library is empty for now.'}</Body> : null}
      {items.data?.map((item) => (
        <Row
          key={item.id}
          title={item.title}
          detail={itemDetail(item)}
          onPress={() => openLink(itemHref(item, MEDIA_URL), onError)}
          accessibilityHint="Opens the item"
        />
      ))}
    </Card>
  );
}

const TYPES: readonly { value: string; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'video', label: 'Video' },
  { value: 'mock_exam', label: 'Past paper' },
  { value: 'textbook', label: 'Textbook' },
  { value: 'worksheet', label: 'Worksheet' },
];

type Where = { scope: 'institution'; school: number } | { scope: 'private' } | { scope: 'global' };

/** Staff add an item by link. */
export function AddItemCard({ choices }: { choices: LibraryChoice[] }) {
  const add = useAddItem();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('notes');
  const [where, setWhere] = useState<Where>(choices[0] ? { scope: 'institution', school: choices[0].id } : { scope: 'private' });
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState<LibraryItem | null>(null);
  const tick = (on: boolean, label: string) => (on ? `✓ ${label}` : label);

  async function save() {
    const message = checkNewLink(title, link);
    setProblem(message);
    if (message) return;
    const placement =
      where.scope === 'institution' ? { visibility_scope: 'institution' as const, owner_institution: where.school } : { visibility_scope: where.scope };
    const item = await add.mutateAsync({ title: title.trim(), external_url: link.trim(), content_type: type, ...placement });
    setSaved(item);
    setTitle('');
    setLink('');
  }

  return (
    <Card title="Add to the library">
      <Field label="Title" value={title} onChangeText={setTitle} maxLength={500} placeholder="e.g. UNEB Biology 2024 Paper 1" />
      <Field label="Web address" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" placeholder="https://" />
      <Body muted>Type</Body>
      <View style={styles.choices}>
        {TYPES.map((t) => (
          <Button key={t.value} label={tick(type === t.value, t.label)} variant="secondary" onPress={() => setType(t.value)} />
        ))}
      </View>
      <Body muted>Who can see it</Body>
      <View style={styles.choices}>
        {choices.map((c) => (
          <Button
            key={c.id}
            label={tick(where.scope === 'institution' && where.school === c.id, `${c.name} library`)}
            variant="secondary"
            onPress={() => setWhere({ scope: 'institution', school: c.id })}
          />
        ))}
        <Button label={tick(where.scope === 'private', 'Only me')} variant="secondary" onPress={() => setWhere({ scope: 'private' })} />
        <Button label={tick(where.scope === 'global', 'All Maple learners (after review)')} variant="secondary" onPress={() => setWhere({ scope: 'global' })} />
      </View>
      <ErrorText message={problem ?? add.error?.message} />
      {saved ? <Body>Added “{saved.title}”{saved.publication_status === 'under_review' ? '. It will appear for everyone once reviewed.' : '.'}</Body> : null}
      <Button label="Add" onPress={save} busy={add.isPending} />
    </Card>
  );
}

/** Staff put one of their items on a class's reading list, optionally with a due date. */
export function ShareCard() {
  const mine = useLibrary('', true);
  const classes = useClasses();
  const share = useShareWithClass();
  const [itemId, setItemId] = useState<string | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [due, setDue] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (mine.isPending || classes.isPending || !mine.data?.length || !classes.data?.length) return null;
  const item = itemId ?? mine.data[0].id;
  const cls = classId ?? classes.data[0].id;

  async function submit() {
    let dueDate: string | undefined;
    if (due.trim()) {
      const parsed = parseLessonTime(due, '17:00');
      if (parsed.error || !parsed.value) {
        setProblem(parsed.error);
        return;
      }
      dueDate = parsed.value;
    }
    setProblem(null);
    const res = await share.mutateAsync({ id: item, body: { class: cls, ...(dueDate ? { due_date: dueDate } : {}) } });
    setDone(`Shared with ${res.assigned} student${res.assigned === 1 ? '' : 's'}.`);
  }

  return (
    <Card title="Share with a class">
      <Body muted>Item</Body>
      <View style={styles.choices}>
        {mine.data.slice(0, 8).map((i) => (
          <Button key={i.id} label={i.id === item ? `✓ ${i.title}` : i.title} variant="secondary" onPress={() => setItemId(i.id)} />
        ))}
      </View>
      <Body muted>Class</Body>
      <View style={styles.choices}>
        {classes.data.map((c) => (
          <Button key={c.id} label={c.id === cls ? `✓ ${c.title}` : c.title} variant="secondary" onPress={() => setClassId(c.id)} />
        ))}
      </View>
      <Field label="Due date (YYYY-MM-DD, optional)" value={due} onChangeText={setDue} placeholder="2026-11-20" autoCorrect={false} />
      <ErrorText message={problem ?? share.error?.message} />
      {done ? <Body>{done}</Body> : null}
      <Button label="Share" onPress={submit} busy={share.isPending} />
    </Card>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
  actions: { gap: 8 },
});
