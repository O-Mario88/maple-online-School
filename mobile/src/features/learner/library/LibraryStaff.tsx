import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Choice, Choices, FORM, FormCard, FormLabel, FormMessage, Input, PrimaryButton } from '@/features/shared/DesignForm';
import { parseLessonTime } from '@/lib/lessons/lessons';
import { checkNewLink, type LibraryChoice } from '@/lib/library/library';
import { useAddItem, useLibrary, useShareWithClass } from '@/lib/library/queries';
import { useClasses } from '@/lib/school/queries';

const TYPES: readonly { value: string; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'video', label: 'Video' },
  { value: 'mock_exam', label: 'Past paper' },
  { value: 'textbook', label: 'Textbook' },
  { value: 'worksheet', label: 'Worksheet' },
];
const MAX_SHARE_CHOICES = 8;

type Where = { scope: 'institution'; school: number } | { scope: 'private' } | { scope: 'global' };

/** Staff add an item by link, to a school library, their own shelf, or Maple's (after review). */
function AddItem({ choices }: { choices: LibraryChoice[] }) {
  const add = useAddItem();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('notes');
  const [where, setWhere] = useState<Where>(choices[0] ? { scope: 'institution', school: choices[0].id } : { scope: 'private' });
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const save = async () => {
    const message = checkNewLink(title, link);
    setProblem(message);
    if (message) return;
    const placement = where.scope === 'institution' ? { visibility_scope: 'institution' as const, owner_institution: where.school } : { visibility_scope: where.scope };
    await add.mutateAsync({ title: title.trim(), external_url: link.trim(), content_type: type, ...placement }).then(
      (item) => {
        setSaved(`Added “${item.title}”${item.publication_status === 'under_review' ? '. It appears for everyone once reviewed.' : '.'}`);
        setTitle('');
        setLink('');
      },
      () => undefined,
    );
  };

  return (
    <FormCard title="Add to the Library">
      <Input label="Title" value={title} onChangeText={setTitle} maxLength={500} placeholder="e.g. UNEB Biology 2024 Paper 1" />
      <Input label="Web address" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" placeholder="https://" />
      <FormLabel>Type</FormLabel>
      <Choices>
        {TYPES.map((t) => (
          <Choice key={t.value} label={t.label} on={type === t.value} onPress={() => setType(t.value)} />
        ))}
      </Choices>
      <FormLabel>Who can see it</FormLabel>
      <Choices>
        {choices.map((c) => (
          <Choice key={c.id} label={`${c.name} library`} on={where.scope === 'institution' && where.school === c.id} onPress={() => setWhere({ scope: 'institution', school: c.id })} />
        ))}
        <Choice label="Only me" on={where.scope === 'private'} onPress={() => setWhere({ scope: 'private' })} />
        <Choice label="All Maple learners (after review)" on={where.scope === 'global'} onPress={() => setWhere({ scope: 'global' })} />
      </Choices>
      <FormMessage text={problem ?? add.error?.message} />
      <FormMessage text={saved} good />
      <PrimaryButton label="Add" busy={add.isPending} onPress={save} />
    </FormCard>
  );
}

/** Staff put one of their items on a class's reading list, optionally with a due date. */
function ShareWithClass() {
  const mine = useLibrary('', true);
  const classes = useClasses();
  const share = useShareWithClass();
  const [itemId, setItemId] = useState<string | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [due, setDue] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  if (!mine.data?.length || !classes.data?.length) return null;
  const item = itemId ?? mine.data[0].id;
  const cls = classId ?? classes.data[0].id;

  const submit = async () => {
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
    await share.mutateAsync({ id: item, body: { class: cls, ...(dueDate ? { due_date: dueDate } : {}) } }).then(
      (res) => setDone(`Shared with ${res.assigned} student${res.assigned === 1 ? '' : 's'}.`),
      () => undefined,
    );
  };

  return (
    <FormCard title="Share with a Class">
      <FormLabel>Item</FormLabel>
      <Choices>
        {mine.data.slice(0, MAX_SHARE_CHOICES).map((i) => (
          <Choice key={i.id} label={i.title} on={i.id === item} onPress={() => setItemId(i.id)} />
        ))}
      </Choices>
      <FormLabel>Class</FormLabel>
      <Choices>
        {classes.data.map((c) => (
          <Choice key={c.id} label={c.title} on={c.id === cls} onPress={() => setClassId(c.id)} />
        ))}
      </Choices>
      <Input label="Due date (YYYY-MM-DD, optional)" value={due} onChangeText={setDue} placeholder="2026-11-20" autoCorrect={false} />
      <FormMessage text={problem ?? share.error?.message} />
      <FormMessage text={done} good />
      <PrimaryButton label="Share" busy={share.isPending} onPress={submit} />
    </FormCard>
  );
}

/** Staff tools on the Library page: add items and set class reading. */
export function LibraryStaff({ choices }: { choices: LibraryChoice[] }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.h2} accessibilityRole="header">
        For Teachers
      </Text>
      <AddItem choices={choices} />
      <ShareWithClass />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12 },
  h2: { fontSize: 18, fontWeight: '800', color: FORM.ink },
});
