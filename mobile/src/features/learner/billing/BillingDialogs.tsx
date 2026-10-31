import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type Cycle, CYCLES, type Network, planPrice, receiptText, validMobileMoney } from '@/lib/billing';
import { formatMoney } from '@/lib/finance/fees';

import type { BillingState, PayFor, Plan } from './useBilling';

const NAVY = '#0F1B3D';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const ugx = (n: number) => formatMoney(n, 'UGX');

type WebDoc = { createElement: (t: 'a') => { href: string; download: string; click: () => void } };
type WebUrl = { createObjectURL: (b: unknown) => string; revokeObjectURL: (u: string) => void };
type BlobCtor = new (parts: string[], opts: { type: string }) => unknown;

/** Saves a receipt: a text file on the web, the share sheet on phones. */
export function downloadReceipt(text: string, name: string) {
  const g = globalThis as unknown as { document?: WebDoc; URL?: WebUrl; Blob?: BlobCtor };
  if (Platform.OS === 'web' && g.document && g.URL && g.Blob) {
    const url = g.URL.createObjectURL(new g.Blob([text], { type: 'text/plain' }));
    const a = g.document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    g.URL.revokeObjectURL(url);
    return;
  }
  Share.share({ message: text, title: name }).catch(() => undefined);
}

function Frame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.dialog}>
          <View style={styles.head}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Icon name="close" size={18} color={NAVY} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PayDialog({ s, what }: { s: BillingState; what: PayFor }) {
  const p = s.priceOf(what);
  const m = s.method(s.payWith);
  return (
    <Frame title="Confirm Payment" onClose={s.close}>
      <View style={styles.summary}>
        <Image source={p.icon} style={styles.sumIcon} contentFit="contain" />
        <Text style={styles.sumTitle}>{p.title}</Text>
        <Text style={styles.sumAmount}>{ugx(p.amount)}</Text>
      </View>
      <Text style={styles.label}>Pay with</Text>
      {s.methods.map((x) => {
        const on = x.id === s.payWith;
        return (
          <Pressable key={x.id} style={[styles.option, on && styles.optionOn]} onPress={() => s.setPayWith(x.id)} disabled={s.paying} accessibilityRole="radio" accessibilityState={{ checked: on }}>
            <Image source={x.logo} style={styles.logo} contentFit="contain" />
            <View style={styles.flex}>
              <Text style={styles.optTitle}>{x.label}</Text>
              <Text style={styles.optSub}>{x.sub}</Text>
            </View>
            <View style={[styles.radio, on && styles.radioOn]} />
          </Pressable>
        );
      })}
      <Text style={styles.note}>{m.kind === 'card' ? `${m.label} will be charged.` : `We'll send a prompt to ${m.sub}. Approve it with your ${m.kind === 'mtn' ? 'MTN MoMo' : 'Airtel Money'} PIN.`}</Text>
      <Pressable style={[styles.primary, s.paying && styles.busy]} onPress={() => s.pay(what)} disabled={s.paying} accessibilityRole="button">
        <Text style={styles.primaryText}>{s.paying ? 'Waiting for confirmation…' : `Pay ${ugx(p.amount)}`}</Text>
      </Pressable>
      <Text style={styles.fine}>Design preview on sample data: no real payment is made.</Text>
    </Frame>
  );
}

function SwitchDialog({ s, plan, cycle }: { s: BillingState; plan: Plan['id']; cycle: Cycle }) {
  const p = s.plan(plan);
  return (
    <Frame title={`Switch to ${p.name}?`} onClose={s.close}>
      <Text style={styles.text}>{`You'll keep everything in ${s.currentPlan.name} until ${s.current.renews}. ${p.name} (${CYCLES[cycle].label}) starts then at ${ugx(planPrice(p.monthly, cycle).total)} ${CYCLES[cycle].unit}.`}</Text>
      <Text style={styles.note}>No charge today.</Text>
      <Pressable style={styles.primary} onPress={() => s.confirmSwitch(plan, cycle)} accessibilityRole="button">
        <Text style={styles.primaryText}>{`Switch on ${s.current.renews}`}</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={s.close} accessibilityRole="button">
        <Text style={styles.secondaryText}>{`Keep ${s.currentPlan.name}`}</Text>
      </Pressable>
    </Frame>
  );
}

function ManageDialog({ s }: { s: BillingState }) {
  const last = s.purchases.find((r) => r.title.startsWith(s.currentPlan.name)) ?? s.purchases[0];
  return (
    <Frame title="Manage Plan" onClose={s.close}>
      <Text style={styles.text}>{`${s.currentPlan.title} • ${ugx(planPrice(s.currentPlan.monthly, s.current.cycle).total)} ${CYCLES[s.current.cycle].unit}`}</Text>
      <Pressable style={styles.row} onPress={s.toggleRenew} accessibilityRole="switch" accessibilityState={{ checked: s.current.autoRenew }}>
        <View style={styles.flex}>
          <Text style={styles.optTitle}>Auto-renew</Text>
          <Text style={styles.optSub}>{s.current.autoRenew ? `Renews on ${s.current.renews}` : `Stops after ${s.current.renews}`}</Text>
        </View>
        <View style={[styles.switch, s.current.autoRenew && styles.switchOn]}>
          <View style={[styles.knob, s.current.autoRenew && styles.knobOn]} />
        </View>
      </Pressable>
      <Pressable style={styles.row} onPress={() => s.open({ kind: 'compare' })} accessibilityRole="button">
        <Text style={[styles.optTitle, styles.flex]}>Change plan or billing cycle</Text>
        <Icon name="chevronRight" size={14} color={BODY} />
      </Pressable>
      {last ? (
        <Pressable style={styles.row} onPress={() => s.open({ kind: 'receipt', id: last.id })} accessibilityRole="button">
          <Text style={[styles.optTitle, styles.flex]}>{`Last receipt (${last.date})`}</Text>
          <Icon name="download" size={14} color={BLUE} />
        </Pressable>
      ) : null}
    </Frame>
  );
}

const COMPARE: readonly { label: string; plans: readonly Plan['id'][] }[] = [
  { label: 'Recorded lessons', plans: ['basic', 'pro', 'premium'] },
  { label: 'Past papers', plans: ['basic', 'pro', 'premium'] },
  { label: 'Digital library & flashcards', plans: ['basic', 'pro', 'premium'] },
  { label: 'Live classes', plans: ['pro', 'premium'] },
  { label: 'Study squads', plans: ['pro', 'premium'] },
  { label: 'Progress analytics', plans: ['pro', 'premium'] },
  { label: 'Discounted tutoring', plans: ['pro', 'premium'] },
  { label: '20 tutoring credits a month', plans: ['premium'] },
  { label: 'Priority support', plans: ['premium'] },
  { label: 'Personalized study plan', plans: ['premium'] },
];

function CompareDialog({ s }: { s: BillingState }) {
  return (
    <Frame title="Compare Plans" onClose={s.close}>
      <View style={styles.tRow}>
        <Text style={[styles.tHead, styles.tLabel]}>{CYCLES[s.cycleTab].label}</Text>
        {s.hub.plans.map((p) => (
          <View key={p.id} style={styles.tCell}>
            <Text style={styles.tHead}>{p.name}</Text>
            <Text style={styles.optSub}>{ugx(planPrice(p.monthly, s.cycleTab).total)}</Text>
          </View>
        ))}
      </View>
      {COMPARE.map((f) => (
        <View key={f.label} style={styles.tRow}>
          <Text style={[styles.optSub, styles.tLabel]}>{f.label}</Text>
          {s.hub.plans.map((p) => (
            <View key={p.id} style={styles.tCell}>
              {f.plans.includes(p.id) ? <Icon name="check" size={14} color="#16A34A" /> : <Text style={styles.dash}>—</Text>}
            </View>
          ))}
        </View>
      ))}
      <View style={styles.tRow}>
        <View style={styles.tLabel} />
        {s.hub.plans.map((p) => {
          const current = s.current.plan === p.id && s.current.cycle === s.cycleTab;
          return (
            <View key={p.id} style={styles.tCell}>
              <Pressable style={[styles.tBtn, current && styles.tBtnOn]} disabled={current} onPress={() => s.choose(p.id, s.cycleTab)} accessibilityRole="button" accessibilityLabel={current ? `${p.name} is your plan` : `Choose ${p.name}`}>
                <Text style={[styles.tBtnText, current && styles.tBtnTextOn]}>{current ? 'Current' : 'Choose'}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Frame>
  );
}

function MethodDialog({ s }: { s: BillingState }) {
  const [kind, setKind] = useState<Network | 'card'>('mtn');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const logo = (k: string) => s.hub.methods.find((m) => m.kind === k)?.logo ?? s.hub.methods[0].logo;
  const add = () => {
    if (kind === 'card') return;
    const number = validMobileMoney(phone, kind);
    if (!number) {
      setError(kind === 'mtn' ? 'Enter an MTN number, e.g. 0772 123 456.' : 'Enter an Airtel number, e.g. 0701 987 654.');
      return;
    }
    if (s.methods.some((m) => m.sub === number)) {
      setError('That number is already saved.');
      return;
    }
    s.addMethod({ id: `${kind}-${number.replace(/\D/g, '')}`, kind, label: kind === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money', sub: number, logo: logo(kind), primary: false });
  };
  return (
    <Frame title="Add Payment Method" onClose={s.close}>
      <View style={styles.kinds}>
        {(['mtn', 'airtel', 'card'] as const).map((k) => (
          <Pressable
            key={k}
            style={[styles.kind, kind === k && styles.optionOn]}
            onPress={() => {
              setKind(k);
              setError(null);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: kind === k }}>
            <Image source={logo(k)} style={styles.logo} contentFit="contain" />
            <Text style={styles.optSub}>{k === 'mtn' ? 'MTN MoMo' : k === 'airtel' ? 'Airtel Money' : 'Card'}</Text>
          </Pressable>
        ))}
      </View>
      {kind === 'card' ? (
        <Text style={styles.text}>For your safety, card details are entered on the secure payment page the next time you pay. Choose your card there and it will be saved here.</Text>
      ) : (
        <>
          <Text style={styles.label}>Mobile money number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setError(null);
            }}
            placeholder={kind === 'mtn' ? '0772 123 456' : '0701 987 654'}
            placeholderTextColor="#8A93A6"
            keyboardType="phone-pad"
            autoFocus
            accessibilityLabel="Mobile money number"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={add} accessibilityRole="button">
            <Text style={styles.primaryText}>Add Number</Text>
          </Pressable>
        </>
      )}
    </Frame>
  );
}

function ReceiptDialog({ s, id }: { s: BillingState; id: string }) {
  const r = s.purchase(id);
  if (!r) return null;
  const text = receiptText(r, s.hub.learner);
  return (
    <Frame title="Receipt" onClose={s.close}>
      <View style={styles.receipt}>
        {text.split('\n').map((line, i) => (
          <Text key={i} style={i < 2 ? styles.receiptHead : styles.receiptLine}>
            {line}
          </Text>
        ))}
      </View>
      <Pressable style={styles.primary} onPress={() => downloadReceipt(text, `maple-receipt-${r.id}.txt`)} accessibilityRole="button">
        <Text style={styles.primaryText}>Download Receipt</Text>
      </Pressable>
    </Frame>
  );
}

export function BillingDialogs({ s }: { s: BillingState }) {
  const d = s.dialog;
  if (!d) return null;
  switch (d.kind) {
    case 'pay':
      return <PayDialog s={s} what={d.what} />;
    case 'switch':
      return <SwitchDialog s={s} plan={d.plan} cycle={d.cycle} />;
    case 'manage':
      return <ManageDialog s={s} />;
    case 'compare':
      return <CompareDialog s={s} />;
    case 'method':
      return <MethodDialog s={s} />;
    case 'receipt':
      return <ReceiptDialog s={s} id={d.id} />;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(8,12,20,0.5)' },
  dialog: { width: '100%', maxWidth: 460, maxHeight: '90%', borderRadius: 14, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16 },
  title: { fontSize: 17, fontWeight: '700', color: NAVY },
  body: { gap: 10, padding: 18 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, backgroundColor: '#F4F7FC' },
  sumIcon: { width: 36, height: 36 },
  sumTitle: { flex: 1, fontSize: 13.5, fontWeight: '600', color: NAVY },
  sumAmount: { fontSize: 15, fontWeight: '800', color: NAVY },
  label: { marginTop: 4, fontSize: 12, fontWeight: '600', color: NAVY },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E3E9F2' },
  optionOn: { borderColor: '#3B82F6', backgroundColor: '#F5F9FF' },
  logo: { width: 40, height: 34 },
  optTitle: { fontSize: 13, fontWeight: '600', color: NAVY },
  optSub: { marginTop: 2, fontSize: 11.5, color: BODY },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#B5BFCE' },
  radioOn: { borderWidth: 5, borderColor: '#0B6BFF' },
  note: { fontSize: 12, lineHeight: 17, color: BODY },
  fine: { fontSize: 10.5, color: '#8A93A6', textAlign: 'center' },
  text: { fontSize: 13, lineHeight: 19, color: '#2B3445' },
  primary: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0B6BFF' },
  busy: { opacity: 0.7 },
  primaryText: { fontSize: 13.5, fontWeight: '600', color: '#FFFFFF' },
  secondary: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#C9DAF8' },
  secondaryText: { fontSize: 13.5, fontWeight: '600', color: BLUE },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF1F6' },
  switch: { width: 38, height: 22, justifyContent: 'center', paddingHorizontal: 2, borderRadius: 11, backgroundColor: '#D5DDEA' },
  switchOn: { backgroundColor: '#0B6BFF' },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  knobOn: { alignSelf: 'flex-end' },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F0F3F7' },
  tLabel: { flex: 1.4 },
  tCell: { flex: 1, alignItems: 'center' },
  tHead: { fontSize: 11.5, fontWeight: '700', color: NAVY, textAlign: 'center' },
  dash: { fontSize: 12, color: '#B8C0CD' },
  tBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#3B82F6' },
  tBtnOn: { borderColor: '#0B6BFF', backgroundColor: '#0B6BFF' },
  tBtnText: { fontSize: 11.5, fontWeight: '600', color: BLUE },
  tBtnTextOn: { color: '#FFFFFF' },
  kinds: { flexDirection: 'row', gap: 8 },
  kind: { flex: 1, alignItems: 'center', gap: 4, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E3E9F2' },
  input: { height: 44, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 15, color: NAVY },
  error: { fontSize: 12, color: '#B91C1C' },
  receipt: { gap: 4, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E3E9F2', backgroundColor: '#FBFCFE' },
  receiptHead: { fontSize: 13, fontWeight: '700', color: NAVY },
  receiptLine: { fontSize: 12.5, color: '#2B3445' },
});
