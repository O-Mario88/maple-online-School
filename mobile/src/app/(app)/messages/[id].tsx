import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, useShell } from '@/components/ui';
import { Maple } from '@/constants/maple';
import { ConversationPane } from '@/features/messages/ConversationPane';
import { useMe } from '@/lib/auth/auth-context';

/** One conversation on its own page: where a phone opens it from Messages, and where links to it land. */
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const { inShell, wide } = useShell();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/messages'));
  // A link with no conversation number in it (an old or broken link) opens Messages' notice, not a failed request.
  const threadId = Number(id);
  const valid = Number.isInteger(threadId) && threadId > 0;
  return (
    <SafeAreaView style={styles.safe} edges={inShell ? (wide ? ['top', 'right'] : ['top', 'left', 'right']) : ['top', 'left', 'right', 'bottom']}>
      <View style={[styles.card, wide && styles.cardWide]}>
        {valid ? (
          <ConversationPane threadId={threadId} meId={me.data?.id} meName={me.data?.full_name ?? ''} onBack={back} />
        ) : (
          <EmptyState
            icon="chat"
            title="This conversation can't be found"
            body="The link may be old. Your conversations are all in Messages."
            action={<Button label="Go to Messages" variant="secondary" compact onPress={() => router.replace('/messages')} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Maple.canvas },
  card: { flex: 1, padding: 16, backgroundColor: Maple.surface },
  cardWide: { margin: 24, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: Maple.border },
});
