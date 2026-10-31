import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { type ReactNode, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { CheckoutHeader, CheckoutSummary, LinkFacts, Promises } from '@/features/public/pay/CheckoutSummary';
import { PaymentMethods } from '@/features/public/pay/PaymentMethods';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';
import { readPayToken } from '@/lib/pay-link';

const MAX_WIDTH = 1180;
const SUMMARY = 480;

function Private({ wide, children }: { wide: boolean; children: ReactNode }) {
  return (
    <LightOnly>
      {/* A private payment link: never indexed by search engines. */}
      <Head>
        <title>Secure Payment | Maple</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <CheckoutHeader wide={wide} />
        {children}
      </SafeAreaView>
    </LightOnly>
  );
}

/**
 * Inventory 12: a no-sign-in payment page from an invoice link. MTN MoMo,
 * Airtel Money, M-Pesa, cards, Apple Pay, Google Pay or a QR code, then an
 * instant receipt. The API checks the link's signature and takes the money.
 */
export default function PayInvoiceScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const [openedAt] = useState(() => Date.now());
  const link = useMemo(() => readPayToken(token, openedAt), [token, openedAt]);

  if (!link.ok) {
    return (
      <Private wide={wide}>
        <EmptyState
          icon="lock"
          title={link.reason === 'expired' ? 'This payment link has expired' : "This payment link isn't valid"}
          body={link.reason === 'expired' ? 'Ask the school for a new link, or pay from the parent app.' : 'Please open the link exactly as it arrived in WhatsApp, SMS or email.'}
        />
      </Private>
    );
  }
  if (!mock) return <PreviewScreen title="Payment">{() => null}</PreviewScreen>;
  const inv = mock.publicPages.invoicePage;
  if (link.invoice !== inv.invoice) {
    return (
      <Private wide={wide}>
        <EmptyState icon="search" title="We couldn't find this invoice" body="It may already be paid. Check with the school." />
      </Private>
    );
  }
  const total = inv.items.reduce((sum, i) => sum + i.ugx, 0);

  return (
    <Private wide={wide}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.page}>
        <View style={[styles.inner, wide && styles.innerWide]}>
          <View style={[styles.summary, wide && styles.summaryWide]}>
            <CheckoutSummary inv={inv} total={total} />
            {wide ? <LinkFacts validUntil={inv.validUntil} /> : null}
            {wide ? <Promises inv={inv} /> : null}
          </View>
          <View style={[styles.flex, styles.methods]}>
            <PaymentMethods methods={inv.methods} totalUGX={total} invoice={inv.invoice} learner={inv.child.name} />
            {wide ? null : <LinkFacts validUntil={inv.validUntil} />}
          </View>
        </View>
      </ScrollView>
    </Private>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.canvas },
  flex: { flex: 1 },
  page: { paddingBottom: 32 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 20, padding: 16 },
  innerWide: { flexDirection: 'row', alignItems: 'flex-start', padding: 24 },
  summary: { gap: 16 },
  summaryWide: { width: SUMMARY },
  methods: { gap: 16, minWidth: 0 },
});
