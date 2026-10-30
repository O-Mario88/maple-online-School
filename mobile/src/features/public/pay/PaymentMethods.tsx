import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import { checkMobileNumber, type MobileNetwork } from '@/lib/pay-link';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';
import { Receipt, type ReceiptData } from './Receipt';

type Methods = MockData['publicPages']['invoicePage']['methods'];
type Method = MobileNetwork | 'card' | 'applePay' | 'googlePay' | 'qr';

const LABELS: Readonly<Record<Method, string>> = { mtn: 'MTN MoMo', airtel: 'Airtel Money', mpesa: 'M-Pesa', card: 'Card', applePay: 'Apple Pay', googlePay: 'Google Pay', qr: 'Scan to Pay' };
const MOBILE: readonly MobileNetwork[] = ['mtn', 'airtel', 'mpesa'];
/** How long the sandbox waits before the payment "comes back" approved. */
const APPROVAL_MS = 2500;

type Stage = { kind: 'choose' } | { kind: 'waiting'; payer: string } | { kind: 'paid'; receipt: ReceiptData };

function Section({ icon, title, sub, children }: { icon: 'wallet' | 'grid' | 'qr'; title: string; sub: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionIcon}>
          <Icon name={icon} size={20} color={Brand.blue} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.body}>{sub}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

/** Choose a method, give the details it needs, pay in one tap, and get the receipt. */
export function PaymentMethods({ methods, totalUGX, invoice, learner }: { methods: Methods; totalUGX: number; invoice: string; learner: string }) {
  const [method, setMethod] = useState<Method>('mtn');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ kind: 'choose' });

  useEffect(() => {
    if (stage.kind !== 'waiting') return undefined;
    const id = setTimeout(() => {
      const now = new Date();
      setStage({
        kind: 'paid',
        receipt: {
          receipt: `RCT-${invoice.slice(-6)}-${String(now.getTime()).slice(-4)}`,
          invoice,
          learner,
          method: LABELS[method],
          payer: stage.payer,
          amountUGX: totalUGX,
          paidAt: now.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });
    }, APPROVAL_MS);
    return () => clearTimeout(id);
  }, [stage, method, invoice, learner, totalUGX]);

  if (stage.kind === 'paid') return <Receipt r={stage.receipt} />;

  const isMobile = (MOBILE as readonly string[]).includes(method);
  const choose = (m: Method) => {
    setMethod(m);
    setError(null);
  };
  const pay = () => {
    if (isMobile) {
      const check = checkMobileNumber(method as MobileNetwork, phone);
      if (!check.ok) {
        setError(check.message);
        return;
      }
      setStage({ kind: 'waiting', payer: check.international });
      return;
    }
    setStage({ kind: 'waiting', payer: LABELS[method] });
  };

  const tile = (m: Method, source: number, big: boolean) => {
    const on = method === m;
    return (
      <Pressable key={m} style={[big ? styles.bigTile : styles.tile, on && styles.tileOn]} onPress={() => choose(m)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={LABELS[m]}>
        <Image source={source} style={big ? styles.bigTileImage : styles.tileImage} contentFit={big ? 'cover' : 'contain'} />
        {big ? null : <Text style={styles.tileLabel}>{m === 'card' ? 'Debit or Credit Card' : LABELS[m]}</Text>}
        {on ? <View style={styles.tick}><Icon name="check" size={14} color={Brand.surface} /></View> : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Choose Your Payment Method
      </Text>
      <Text style={styles.body}>Select a payment option below. Your payment will be processed securely.</Text>

      <Section icon="wallet" title="Mobile Money" sub="Pay instantly with your mobile money account.">
        <View style={styles.tiles}>
          {tile('mtn', methods.mtn, true)}
          {tile('airtel', methods.airtel, true)}
          {tile('mpesa', methods.mpesa, true)}
        </View>
        {isMobile ? (
          <View style={styles.phoneRow}>
            <TextInput
              style={styles.phone}
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                setError(null);
              }}
              placeholder={method === 'mpesa' ? '0712 345 678' : method === 'airtel' ? '0701 234 567' : '0772 123 456'}
              placeholderTextColor={Brand.muted}
              keyboardType="phone-pad"
              accessibilityLabel={`${LABELS[method]} phone number`}
            />
          </View>
        ) : null}
        {error ? <Text style={styles.error} accessibilityLiveRegion="assertive">{error}</Text> : null}
      </Section>

      <Section icon="grid" title="Cards & Digital Wallets" sub="Pay with your card or digital wallet.">
        <View style={styles.tiles}>
          {tile('card', methods.card, false)}
          {tile('applePay', methods.applePay, false)}
          {tile('googlePay', methods.googlePay, false)}
        </View>
      </Section>

      <Section icon="qr" title="Scan to Pay (All Networks)" sub="Scan this QR code with your mobile money app.">
        <Pressable style={[styles.qrRow, method === 'qr' && styles.tileOn]} onPress={() => choose('qr')} accessibilityRole="radio" accessibilityState={{ selected: method === 'qr' }} accessibilityLabel="Scan to pay">
          <Image source={methods.qr} style={styles.qr} contentFit="contain" accessibilityLabel="Payment QR code" />
          <View style={styles.qrSteps}>
            {['Open your mobile money app (MTN, Airtel or M-Pesa)', 'Scan the QR code', 'Confirm the amount and complete payment'].map((s, i) => (
              <View key={s} style={styles.qrStep}>
                <Text style={styles.stepNum}>{String(i + 1)}</Text>
                <Text style={styles.body}>{s}</Text>
              </View>
            ))}
          </View>
        </Pressable>
      </Section>

      {stage.kind === 'waiting' ? (
        <View style={styles.waiting} accessibilityLiveRegion="polite">
          <Text style={styles.waitingTitle}>{isMobile ? `Check your phone (${stage.payer})` : `Confirm in ${LABELS[method]}`}</Text>
          <Text style={styles.body}>{isMobile ? 'Enter your mobile money PIN to approve the payment. This page updates on its own.' : 'Finish the payment in the window that opened. This page updates on its own.'}</Text>
        </View>
      ) : (
        <Pressable style={styles.pay} onPress={pay} accessibilityRole="button" accessibilityLabel={`Pay ${formatMoney(totalUGX, 'UGX')} with ${LABELS[method]}`}>
          <Icon name="lock" size={18} color={Brand.surface} />
          <Text style={styles.payText}>{`Pay ${formatMoney(totalUGX, 'UGX')}`}</Text>
        </Pressable>
      )}
      <Text style={styles.terms}>By completing this payment, you agree to our Terms of Service and Privacy Policy.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 14, padding: 22, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  title: { fontSize: 24, fontWeight: '800', color: Brand.ink },
  body: { fontSize: 13, color: Brand.body, flexShrink: 1 },
  section: { gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Brand.line },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  tiles: { flexDirection: 'row', gap: 10 },
  bigTile: { flex: 1, aspectRatio: 168 / 98, borderRadius: 10, overflow: 'hidden', borderWidth: 3, borderColor: 'transparent' },
  bigTileImage: { width: '100%', height: '100%' },
  tile: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  tileImage: { width: '70%', height: 34 },
  tileLabel: { fontSize: 12, color: Brand.body, textAlign: 'center' },
  tileOn: { borderColor: Brand.blue, borderWidth: 3 },
  tick: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  phoneRow: { flexDirection: 'row', gap: 10 },
  phone: { flex: 1, minHeight: 46, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: Brand.line, fontSize: 16, color: Brand.ink },
  error: { fontSize: 13, color: Brand.live },
  qrRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  qr: { width: 130, height: 130 },
  qrSteps: { flex: 1, minWidth: 200, gap: 12, padding: 12, borderRadius: 10, backgroundColor: Brand.canvas },
  qrStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, textAlign: 'center', lineHeight: 22, fontSize: 11, fontWeight: '800', color: Brand.surface, backgroundColor: Brand.blue, overflow: 'hidden' },
  waiting: { gap: 6, padding: 16, borderRadius: 12, backgroundColor: Brand.amberSoft },
  waitingTitle: { fontSize: 15, fontWeight: '800', color: Brand.ink },
  pay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 56, borderRadius: 12, backgroundColor: Brand.blue },
  payText: { fontSize: 18, fontWeight: '700', color: Brand.surface },
  terms: { fontSize: 12, color: Brand.muted, textAlign: 'center' },
});
