import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Chip, ChipRow, Field } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 15: the AI study helper, which coaches towards the answer and knows what you're working on. */
export default function CopilotScreen() {
  const { styles } = useStyles(makeStyles);
  return (
    <PreviewScreen back title="Ask Maple" subtitle="Your study helper">
      {(m) => {
        const c = m.shared.copilot;
        return (
          <>
            <Card title={c.context} subtitle="What you're working on" icon="sparkle">
              <View style={styles.thread}>
                {c.conversation.map((msg, i) => (
                  <View key={i} style={[styles.bubble, msg.from === 'learner' ? styles.mine : styles.theirs]}>
                    <Text style={styles.text}>{msg.text}</Text>
                  </View>
                ))}
              </View>
              <ChipRow>
                {c.suggestions.map((s) => (
                  <Chip key={s} label={s} />
                ))}
              </ChipRow>
              <Field label="Ask a question" placeholder="Type or hold the mic to speak" />
              <Button label="Send" icon="chat" compact onPress={() => undefined} />
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
