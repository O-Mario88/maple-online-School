import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Chip, ChipRow, Field } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import type { MockData } from '@/mock';

type Copilot = MockData['shared']['copilot'];
type Message = Copilot['conversation'][number];
const COACH_REPLY = 'Good question. What do you think the first step is? Tell me and I’ll check it with you.';

/** The conversation with a working ask box: a question gets a coaching reply that points to the next step. */
function Conversation({ c }: { c: Copilot }) {
  const { styles } = useStyles(makeStyles);
  const [thread, setThread] = useState<readonly Message[]>(c.conversation);
  const [draft, setDraft] = useState('');
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setThread((t) => [...t, { from: 'learner', text }, { from: 'maple', text: COACH_REPLY }]);
    setDraft('');
  };
  return (
    <>
      <View style={styles.thread}>
        {thread.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.from === 'learner' ? styles.mine : styles.theirs]}>
            <Text style={styles.text}>{msg.text}</Text>
          </View>
        ))}
      </View>
      <ChipRow>
        {c.suggestions.map((s) => (
          <Chip key={s} label={s} onPress={() => setDraft(s)} />
        ))}
      </ChipRow>
      <Field label="Ask a question" placeholder="Type or hold the mic to speak" value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" />
      <Button label="Send" icon="chat" compact onPress={send} />
    </>
  );
}

/** Inventory 15: the AI study helper, which coaches towards the answer and knows what you're working on. */
export default function CopilotScreen() {
  return (
    <PreviewScreen back title="Ask Maple" subtitle="Your study helper">
      {(m) => {
        const c = m.shared.copilot;
        return (
          <>
            <Card title={c.context} subtitle="What you're working on" icon="sparkle">
              <Conversation c={c} />
            </Card>
            <Body muted>{c.note}</Body>
            <Button label="Report a concern" icon="flag" variant="ghost" compact onPress={() => router.push('/report-concern')} />
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    thread: { gap: Spacing.two },
    bubble: { maxWidth: '85%', padding: Spacing.two, borderRadius: Radius.lg },
    mine: { alignSelf: 'flex-end', backgroundColor: t.accentSoft },
    theirs: { alignSelf: 'flex-start', backgroundColor: t.backgroundSelected },
    text: { ...Type.body, color: t.text },
  });
}
