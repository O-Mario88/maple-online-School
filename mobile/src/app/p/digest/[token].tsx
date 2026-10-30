import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { type ReactNode, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui';
import { AttendanceCard, CompetenciesCard, FeesCard, HighlightsCard, SubjectsCard, SupportBar, VoiceNoteCard } from '@/features/public/digest/DigestCards';
import { DigestHeader, DigestHero } from '@/features/public/digest/DigestHero';
import { PUBLIC_WIDE } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { readDigestToken } from '@/lib/digest-link';
import { mockData } from '@/lib/mock';

const MAX_WIDTH = 1180;
const PAGE_BACKGROUND = '#E8EEF8';

function Private({ children }: { children: ReactNode }) {
  return (
    <LightOnly>
      {/* A private link: never indexed or previewed by search engines. */}
      <Head>
        <title>Weekly Learning Digest | Maple</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </LightOnly>
  );
}

/**
 * Inventory 11: the parent's Sunday digest, opened from WhatsApp or SMS with
 * no sign-in. The link is signed and expires; the API checks the signature.
 */
export default function ParentDigestScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  // The moment the link was opened, used for the expiry check.
  const [openedAt] = useState(() => Date.now());
  const link = useMemo(() => readDigestToken(token, openedAt), [token, openedAt]);

  if (!link.ok) {
    return (
      <Private>
        <EmptyState
          icon="lock"
          title={link.reason === 'expired' ? 'This digest link has expired' : "This link isn't valid"}
          body={link.reason === 'expired' ? "Links last two weeks to keep your child's information private. Sunday's message will have a new one, or sign in to see every week." : 'Please open the link exactly as it arrived in WhatsApp or SMS.'}
        />
      </Private>
    );
  }
  if (!mock) return <PreviewScreen title="Weekly digest">{() => null}</PreviewScreen>;
  const d = mock.publicPages.parentDigest;
  if (link.child !== d.childSlug) {
    return (
      <Private>
        <EmptyState icon="lock" title="We couldn't find this digest" body="Please open the newest link from Maple." />
      </Private>
    );
  }

  return (
    <Private>
      <ScrollView style={styles.flex} contentContainerStyle={styles.page}>
        <View style={styles.inner}>
          <DigestHeader validUntil={d.validUntil} wide={wide} />
          <DigestHero d={d} wide={wide} />
          {wide ? (
            <View style={styles.columns}>
              <View style={styles.column}>
                <AttendanceCard d={d} />
                <CompetenciesCard d={d} />
              </View>
              <View style={styles.column}>
                <VoiceNoteCard d={d} />
                <HighlightsCard d={d} />
              </View>
              <View style={styles.column}>
                <SubjectsCard d={d} />
                <FeesCard d={d} />
              </View>
            </View>
          ) : (
            <>
              <VoiceNoteCard d={d} />
              <AttendanceCard d={d} />
              <FeesCard d={d} />
              <SubjectsCard d={d} />
              <CompetenciesCard d={d} />
              <HighlightsCard d={d} />
            </>
          )}
          <SupportBar d={d} />
        </View>
      </ScrollView>
    </Private>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BACKGROUND },
  flex: { flex: 1 },
  page: { paddingBottom: 32 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 18, padding: 16 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  column: { flex: 1, gap: 18 },
});
