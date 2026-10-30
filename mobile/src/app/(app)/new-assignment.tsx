import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Body, Button, Card, ErrorText, Field, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useCreateAssignment } from '@/lib/learning/queries';

/** A teacher sets new work for their class. */
export default function NewAssignmentScreen() {
  const theme = useTheme();
  const create = useCreateAssignment();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [publish, setPublish] = useState(true);

  const score = Number(maxScore);
  const scoreOk = maxScore.trim() !== '' && Number.isFinite(score) && score > 0 && score <= 999;
  const canSave = title.trim() !== '' && instructions.trim() !== '' && scoreOk;

  async function handleSave() {
    await create.mutateAsync({
      title: title.trim(),
      instructions: instructions.trim(),
      type: 'assignment',
      max_score: String(score),
      is_published: publish,
    });
    router.back();
  }

  return (
    <Screen back title="New assignment">
      <Card>
        <Field label="Title" value={title} onChangeText={setTitle} maxLength={255} placeholder="e.g. Fractions homework" />
        <Field
          label="Instructions"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          placeholder="What should students do?"
        />
        <Field label="Out of (marks)" value={maxScore} onChangeText={setMaxScore} keyboardType="numeric" />
        {!scoreOk ? <ErrorText message="Marks must be a number from 1 to 999." /> : null}
        <View style={styles.toggle}>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: theme.text }]}>Publish now</Text>
            <Body muted>{publish ? 'Students can see it straight away.' : 'Saved as a draft. Students can’t see it yet.'}</Body>
          </View>
          <Switch
            value={publish}
            onValueChange={setPublish}
            trackColor={{ true: theme.accent, false: theme.border }}
            accessibilityLabel="Publish now"
          />
        </View>
        <ErrorText message={create.error?.message} />
        <Button
          label={publish ? 'Publish assignment' : 'Save draft'}
          onPress={handleSave}
          disabled={!canSave}
          busy={create.isPending}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
});
