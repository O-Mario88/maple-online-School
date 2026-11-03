import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useShell } from '@/components/ui';
import type { Home } from '@/features/learner/home/HomeFrame';
import type { ReaderData } from '@/features/learner/reader/catalog';
import { readerFor } from '@/features/learner/reader/readerFor';
import { READER_REF_WIDTH, ReaderDesk, ReaderPhone } from '@/features/learner/reader/ReaderViews';
import { useBookReader } from '@/features/learner/reader/useBookReader';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { mockData } from '@/lib/mock';

/** Digital Library › any book or resource (`/learn/library/[id]`): read, highlight, take notes, listen and check understanding. */
export default function LibraryReaderScreen() {
  const mock = useMemo(() => mockData(), []);
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!mock) {
    return (
      <PreviewScreen title="Book reader" subtitle="Chapters, notes, read aloud and quizzes">
        {() => null}
      </PreviewScreen>
    );
  }
  const r = typeof id === 'string' ? readerFor(mock, id) : null;
  if (!r)
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>We couldn’t find that book</Text>
        <Pressable onPress={() => router.replace('/learn/library')} accessibilityRole="link">
          <Text style={styles.backText}>Back to the library</Text>
        </Pressable>
      </View>
    );
  return <ReaderView key={r.book.id} r={r} h={mock.learner.learnerHome} />;
}

function ReaderView({ r, h }: { r: ReaderData; h: Home }) {
  const x = useBookReader(r);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!wide) return <ReaderPhone x={x} h={h} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={READER_REF_WIDTH}>
        <ReaderDesk x={x} h={h} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: '#EEF3FA' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  missingTitle: { fontSize: 20, fontWeight: '800', color: '#0B1424' },
  backText: { fontSize: 15, fontWeight: '600', color: '#1463F3' },
});
