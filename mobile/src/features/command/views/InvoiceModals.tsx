import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { canIssue, type Currency, formatMoney, type InvoiceType } from '@/features/command/logic/invoices';
import { Btn } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, MUTED, NAVY, RED, WHITE } from '@/features/portal/tokens';
import { Segments } from '@/features/school/kit/AdminKit';
import type { catalogue as Catalogue, learnerCustomers as Learners } from '@/mock/command-center/billing';

/** What the amount dialog is for. */
export interface MoneyAsk {
  mode: 'payment' | 'credit';
  number: string;
  currency: Currency;
  balance: number;
  onConfirm: (amount: number, detail: string) => string | undefined;
}

const METHODS = ['Mobile Money (MoMo)', 'Airtel Money', 'Bank Transfer', 'Card (Flutterwave)', 'Cash at school'];

function Frame({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Chips({ items, active, onPick, label }: { items: readonly string[]; active: string; onPick: (v: string) => void; label: string }) {
  return (
    <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {items.map((x) => {
        const on = x === active;
        return (
          <Pressable key={x} style={[styles.chip, on && styles.chipOn]} onPress={() => onPick(x)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={x}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{x}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const toNumber = (s: string) => Number(s.replace(/[^\d.]/g, ''));

/** Record a full or part payment, or issue a credit note. */
export function MoneyModal({ ask, onClose }: { ask: MoneyAsk | null; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(METHODS[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const close = () => {
    setAmount('');
    setReason('');
    setError('');
    onClose();
  };
  if (!ask) return null;
  const payment = ask.mode === 'payment';
  const confirm = () => {
    const err = ask.onConfirm(toNumber(amount), payment ? method : reason);
    if (err) return setError(err);
    close();
  };
  return (
    <Frame visible title={payment ? `Record payment · ${ask.number}` : `Credit note · ${ask.number}`} onClose={close}>
      <Text style={styles.body}>{`Balance due: ${formatMoney(ask.balance, ask.currency)}. ${payment ? 'Part payments are fine; a receipt is issued for each one.' : 'A credit note lowers what is owed and is kept with the invoice.'}`}</Text>
      <Text style={styles.label}>{`Amount (${ask.currency})`}</Text>
      <View style={styles.inline}>
        <TextInput style={[styles.field, styles.flex]} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} accessibilityLabel="Amount" />
        <Pressable style={styles.fill} onPress={() => setAmount(String(ask.balance))} accessibilityRole="button" accessibilityLabel="Use the full balance">
          <Text style={styles.link}>Full balance</Text>
        </Pressable>
      </View>
      {payment ? (
        <>
          <Text style={styles.label}>Method</Text>
          <Chips items={METHODS} active={method} onPick={setMethod} label="Payment method" />
        </>
      ) : (
        <>
          <Text style={styles.label}>Reason</Text>
          <TextInput style={[styles.field, styles.tall]} value={reason} onChangeText={setReason} multiline placeholder="Ten learners withdrew before the term started" placeholderTextColor={MUTED} accessibilityLabel="Reason" />
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.btns}>
        <Btn label="Cancel" kind="outline" onPress={close} height={44} style={styles.flex} />
        <Pressable style={styles.confirm} onPress={confirm} accessibilityRole="button" accessibilityLabel={payment ? 'Record Payment' : 'Issue Credit Note'}>
          <Text style={styles.confirmText}>{payment ? 'Record Payment' : 'Issue Credit Note'}</Text>
        </Pressable>
      </View>
    </Frame>
  );
}

/** Exchange rates from UGX used to price items in another currency (illustrative). */
export const FX: Readonly<Record<Currency, number>> = { UGX: 1, KES: 0.0348, TZS: 0.71, RWF: 0.37, USD: 0.00027 };

export interface NewInvoice {
  type: InvoiceType;
  customer: string;
  age?: number;
  guardian?: string;
  item: string;
  qty: number;
  unitPrice: number;
  currency: Currency;
  draft: boolean;
}

/** Create an institutional or independent-learner invoice. */
export function CreateInvoiceModal({
  visible,
  onClose,
  onCreate,
  catalogue,
  schools,
  learners,
  number,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (n: NewInvoice) => void;
  catalogue: typeof Catalogue;
  schools: readonly string[];
  learners: typeof Learners;
  number: string;
}) {
  const [type, setType] = useState<InvoiceType>('Institution');
  const [customer, setCustomer] = useState(schools[0]);
  const [item, setItem] = useState(catalogue[0].item);
  const [qty, setQty] = useState('100');
  const [currency, setCurrency] = useState<Currency>('UGX');
  const [error, setError] = useState('');
  const items = catalogue.filter((c) => c.for === type);
  const price = (items.find((c) => c.item === item) ?? items[0]).price;
  const unitPrice = Math.round(price * FX[currency] * 100) / 100;
  const learner = learners.find((l) => l.name === customer);
  const count = Math.max(0, Math.floor(toNumber(qty)));
  const pickType = (t: string) => {
    const next = t === 'Institution' ? 'Institution' : 'Student';
    setType(next);
    setCustomer(next === 'Institution' ? schools[0] : learners[0].name);
    setItem(catalogue.find((c) => c.for === next)?.item ?? '');
    setQty(next === 'Institution' ? '100' : '1');
    setError('');
  };
  const submit = (draft: boolean) => {
    const lines = count ? [{ description: item, qty: count, unitPrice }] : [];
    const check = canIssue({ type, learnerAge: learner?.age, guardian: learner?.guardian ? { name: learner.guardian, verified: true } : undefined, lines });
    if (!draft && !check.ok) return setError(check.reason ?? 'This invoice cannot be issued yet.');
    if (!count) return setError('Add a quantity of at least 1.');
    onCreate({ type, customer, age: learner?.age, guardian: learner?.guardian, item, qty: count, unitPrice, currency, draft });
    setError('');
    onClose();
  };
  return (
    <Frame visible={visible} title={`New invoice · ${number}`} onClose={onClose}>
      <Segments items={['Institution', 'Independent Student']} active={type === 'Institution' ? 'Institution' : 'Independent Student'} onChange={pickType} size={13} stretch />
      <Text style={styles.label}>{type === 'Institution' ? 'School' : 'Learner'}</Text>
      <Chips items={type === 'Institution' ? schools : learners.map((l) => l.name)} active={customer} onPick={setCustomer} label="Customer" />
      {learner ? <Text style={styles.body}>{learner.age < 18 ? (learner.guardian ? `Under 18: billed to ${learner.guardian} (verified guardian).` : 'Under 18 with no verified guardian yet: save as a draft until a guardian is verified.') : 'Adult learner: billed directly.'}</Text> : null}
      <Text style={styles.label}>Item</Text>
      <Chips items={items.map((c) => c.item)} active={item} onPick={setItem} label="Item" />
      <View style={styles.inline}>
        <View style={styles.flex}>
          <Text style={styles.label}>{type === 'Institution' ? 'Learners' : 'Quantity'}</Text>
          <TextInput style={styles.field} value={qty} onChangeText={setQty} keyboardType="numeric" accessibilityLabel="Quantity" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.label}>Currency</Text>
          <Chips items={['UGX', 'KES', 'USD']} active={currency} onPick={(c) => setCurrency(c as Currency)} label="Currency" />
        </View>
      </View>
      <View style={styles.sum}>
        <Text style={styles.body}>{`${count} × ${formatMoney(unitPrice, currency)}`}</Text>
        <Text style={styles.total}>{formatMoney(Math.round(count * unitPrice * 100) / 100, currency)}</Text>
      </View>
      <Text style={styles.small}>Tuition is VAT exempt. The invoice gets a branded PDF, a payment link and a QR code, and reminders go out 3 days before and after the due date.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.btns}>
        <Btn label="Save Draft" kind="outline" onPress={() => submit(true)} height={44} style={styles.flex} />
        <Pressable style={styles.confirm} onPress={() => submit(false)} accessibilityRole="button" accessibilityLabel="Issue Invoice">
          <Text style={styles.confirmText}>Issue Invoice</Text>
        </Pressable>
      </View>
    </Frame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  box: { width: '100%', maxWidth: 520, maxHeight: '92%', padding: 20, borderRadius: 16, backgroundColor: WHITE },
  scroll: { gap: 10, paddingTop: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: NAVY },
  body: { fontSize: 13.5, lineHeight: 19, color: BODY },
  small: { fontSize: 12, lineHeight: 17, color: BODY },
  label: { marginTop: 2, fontSize: 13, fontWeight: '600', color: NAVY },
  inline: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  field: { height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY },
  tall: { height: 84, paddingTop: 10, textAlignVertical: 'top' },
  fill: { height: 44, justifyContent: 'center', paddingHorizontal: 6 },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipOn: { borderColor: BLUE, backgroundColor: '#EAF1FE' },
  chipText: { fontSize: 12.5, color: NAVY },
  chipTextOn: { fontWeight: '700', color: BLUE },
  sum: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, backgroundColor: '#F4F7FC' },
  total: { fontSize: 17, fontWeight: '800', color: NAVY },
  error: { fontSize: 13, color: RED },
  btns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  confirm: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  confirmText: { fontSize: 15, fontWeight: '700', color: WHITE },
});
