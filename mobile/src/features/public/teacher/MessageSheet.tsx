import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { Sheet, SheetButton } from '@/components/ui/Sheet';
import { useAuth } from '@/lib/auth/auth-context';
import { MAX_MESSAGE, MODERATION_HELP, moderate } from '@/lib/squad';
import { toast } from '@/lib/toast';

import { Brand } from '../palette';

/** Write to a teacher from their storefront. Visitors sign in first; messages pass the same safety check as squad chat. */
export function MessageSheet({ teacher, visible, onClose }: { teacher: string; visible: boolean; onClose: () => void }) {
  const { status } = useAuth();
  const [text, setText] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  const close = () => {
    setText('');
    setProblem(null);
    onClose();
  };
  const send = () => {
    const check = moderate(text);
    if (!check.ok) {
      setProblem(MODERATION_HELP[check.reason]);
      return;
    }
    close();
    toast(`Message sent to ${teacher}. You'll find the reply in Messages.`);
  };

  if (status !== 'signedIn') {
    return (
      <Sheet visible={visible} title={`Message ${teacher}`} onClose={close}>
        <Text style={styles.body}>Sign in or create a free account to message teachers. Every conversation stays on Maple, where it is kept safe.</Text>
        <SheetButton
          primary
          label="Sign in to message"
          onPress={() => {
            close();
            router.push('/sign-in');
          }}
        />
        <SheetButton
          label="Create a free account"
          onPress={() => {
            close();
            router.push('/sign-up');
          }}
        />
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} title={`Message ${teacher}`} onClose={close}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(v) => {
          setText(v);
          setProblem(null);
        }}
        multiline
        maxLength={MAX_MESSAGE}
        placeholder="Ask about lessons, times or your goals"
        placeholderTextColor="#8A92A3"
        accessibilityLabel={`Message to ${teacher}`}
      />
      {problem ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {problem}
        </Text>
      ) : null}
      <SheetButton primary label="Send message" onPress={send} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 13.5, lineHeight: 20, color: Brand.body },
  input: { minHeight: 110, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#D5DEEB', fontSize: 14, color: Brand.ink, textAlignVertical: 'top' },
  error: { fontSize: 12.5, color: '#B42318' },
});
