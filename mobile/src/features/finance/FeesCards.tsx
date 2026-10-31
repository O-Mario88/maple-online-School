import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, ErrorText, Field, Loading, Row } from '@/components/ui';
import { formatMoney, invoiceStatusLabel, type Invoice, type SchoolChoice } from '@/lib/finance/fees';
import {
  useAddFeeItem,
  useCheckout,
  useFeeItems,
  useGenerateInvoices,
  useInvoices,
  usePayment,
  useRecordPayment,
  useSummary,
} from '@/lib/finance/queries';
import { useClasses } from '@/lib/school/queries';

const tick = (on: boolean, label: string) => (on ? `✓ ${label}` : label);

function wholeNumber(text: string): number | null {
  const n = Number(text.replace(/[,\s]/g, ''));
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---- families --------------------------------------------------------------------------

/** A student's or parent's invoices, each payable by mobile money. */
export function FamilyInvoicesCard() {
  const invoices = useInvoices();
  const [paying, setPaying] = useState<Invoice | null>(null);
  if (invoices.isPending) return <Loading label="Loading fees" />;
  if (invoices.error) return <ErrorText message={invoices.error.message} />;

  return (
    <Card title="School fees">
      {invoices.data.length === 0 ? <Body muted>No invoices yet.</Body> : null}
      {invoices.data.map((inv) => (
        <View key={inv.id}>
          <Row
            title={`${inv.number} · ${inv.student_name}`}
            detail={`${formatMoney(inv.total_minor, inv.currency)} · balance ${formatMoney(inv.balance_minor, inv.currency)}${inv.due_date ? ` · due ${inv.due_date}` : ''}`}
            badge={<Badge label={invoiceStatusLabel(inv.status)} tone={inv.status === 'paid' ? 'good' : 'accent'} />}
          />
          {inv.balance_minor > 0 && inv.status !== 'void' ? (
            <Button label={`Pay ${inv.number}`} variant="secondary" onPress={() => setPaying(inv)} />
          ) : null}
        </View>
      ))}
      {paying ? <PayPanel invoice={paying} onDone={() => setPaying(null)} /> : null}
    </Card>
  );
}

function PayPanel({ invoice, onDone }: { invoice: Invoice; onDone: () => void }) {
  const checkout = useCheckout();
  const [method, setMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(String(invoice.balance_minor));
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const payment = usePayment(paymentId);

  async function pay() {
    const minor = wholeNumber(amount);
    if (!minor || minor > invoice.balance_minor) {
      setProblem(`Enter an amount up to ${formatMoney(invoice.balance_minor, invoice.currency)}.`);
      return;
    }
    setProblem(null);
    const started = await checkout.mutateAsync({ invoice: invoice.id, amount_minor: minor, method, phone: phone.trim() });
    setPaymentId(started.id);
  }

  if (payment.data) {
    const p = payment.data;
    return (
      <View style={styles.panel}>
        {p.status === 'pending' ? <Body>Approve the payment prompt on {p.payer_phone}. This updates by itself.</Body> : null}
        {p.status === 'successful' ? <Body>Paid {formatMoney(p.amount_minor, p.currency)}. Receipt {p.receipt_number}.</Body> : null}
        {p.status === 'failed' ? <ErrorText message={p.failure_reason || 'The payment did not go through.'} /> : null}
        <Button label="Done" variant="secondary" onPress={onDone} />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Body muted>Pay {invoice.number} by mobile money</Body>
      <View style={styles.choices}>
        <Button label={tick(method === 'mtn_momo', 'MTN Mobile Money')} variant="secondary" onPress={() => setMethod('mtn_momo')} />
        <Button label={tick(method === 'airtel_money', 'Airtel Money')} variant="secondary" onPress={() => setMethod('airtel_money')} />
      </View>
      <Field label="Mobile money number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+256 772 000 111" />
      <Field label={`Amount (${invoice.currency})`} value={amount} onChangeText={setAmount} keyboardType="number-pad" />
      <ErrorText message={problem ?? checkout.error?.message} />
      <Button label="Send payment prompt" onPress={pay} busy={checkout.isPending} />
      <Button label="Cancel" variant="secondary" onPress={onDone} />
    </View>
  );
}

// ---- finance staff -----------------------------------------------------------------------

/** Billed, collected and outstanding, plus the tools to bill and record payments. */
export function SchoolFeesCards({ school }: { school: SchoolChoice }) {
  const summary = useSummary(school.id);
  return (
    <>
      <Card title={`${school.name} fees`}>
        {summary.isPending ? <Loading label="Loading the summary" /> : null}
        {summary.error ? <ErrorText message={summary.error.message} /> : null}
        {summary.data ? (
          <>
            <Row title="Billed" detail={formatMoney(summary.data.billed_minor, summary.data.currency)} />
            <Row title="Collected" detail={formatMoney(summary.data.collected_minor, summary.data.currency)} />
            <Row title="Outstanding" detail={formatMoney(summary.data.outstanding_minor, summary.data.currency)} />
            {summary.data.pending_payments > 0 ? <Body muted>{summary.data.pending_payments} mobile money payments waiting for confirmation.</Body> : null}
          </>
        ) : null}
      </Card>
      <FeeItemsCard school={school} />
      <GenerateCard school={school} />
      <RecordPaymentCard school={school} />
    </>
  );
}

function FeeItemsCard({ school }: { school: SchoolChoice }) {
  const items = useFeeItems(school.id);
  const add = useAddFeeItem();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  async function save() {
    const minor = wholeNumber(amount);
    if (!name.trim() || !minor) {
      setProblem('Give the fee a name and an amount in shillings.');
      return;
    }
    setProblem(null);
    await add.mutateAsync({ school: school.id, name: name.trim(), amount_minor: minor, currency: 'UGX' });
    setName('');
    setAmount('');
  }

  return (
    <Card title="Fee items">
      {items.data?.map((f) => <Row key={f.id} title={f.name} detail={formatMoney(f.amount_minor, f.currency)} />)}
      {items.data?.length === 0 ? <Body muted>No fees yet. Add tuition, lunch and the rest.</Body> : null}
      <Field label="Fee name" value={name} onChangeText={setName} placeholder="e.g. Tuition" />
      <Field label="Amount (UGX)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="500000" />
      <ErrorText message={problem ?? add.error?.message} />
      <Button label="Add fee" onPress={save} busy={add.isPending} />
    </Card>
  );
}

function GenerateCard({ school }: { school: SchoolChoice }) {
  const items = useFeeItems(school.id);
  const classes = useClasses();
  const generate = useGenerateInvoices();
  const [classId, setClassId] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [due, setDue] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const schoolClasses = (classes.data ?? []).filter((c) => c.institution === school.id);
  if (!items.data?.length || schoolClasses.length === 0) return null;
  const cls = classId ?? schoolClasses[0].id;

  async function submit() {
    const res = await generate.mutateAsync({ class: cls, fee_items: chosen, ...(due.trim() ? { due_date: due.trim() } : {}) });
    setResult(`Created ${res.created} invoices${res.skipped ? `, skipped ${res.skipped} already billed` : ''}.`);
  }

  return (
    <Card title="Invoice a class">
      <View style={styles.choices}>
        {schoolClasses.map((c) => (
          <Button key={c.id} label={tick(c.id === cls, c.title)} variant="secondary" onPress={() => setClassId(c.id)} />
        ))}
      </View>
      <Body muted>Fees to include</Body>
      <View style={styles.choices}>
        {items.data.map((f) => (
          <Button
            key={f.id}
            label={tick(chosen.includes(f.id), `${f.name} · ${formatMoney(f.amount_minor, f.currency)}`)}
            variant="secondary"
            onPress={() => setChosen((cur) => (cur.includes(f.id) ? cur.filter((x) => x !== f.id) : [...cur, f.id]))}
          />
        ))}
      </View>
      <Field label="Due date (YYYY-MM-DD, optional)" value={due} onChangeText={setDue} placeholder="2026-12-01" autoCorrect={false} />
      <ErrorText message={generate.error?.message} />
      {result ? <Body>{result}</Body> : null}
      <Button label="Create invoices" onPress={submit} busy={generate.isPending} disabled={chosen.length === 0} />
    </Card>
  );
}

function RecordPaymentCard({ school }: { school: SchoolChoice }) {
  const invoices = useInvoices();
  const record = useRecordPayment();
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [method, setMethod] = useState<'cash' | 'bank'>('cash');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const open = (invoices.data ?? []).filter((i) => i.school === school.id && i.balance_minor > 0 && i.status !== 'void');
  if (open.length === 0) return null;
  const inv = open.find((i) => i.id === invoiceId) ?? open[0];

  async function submit() {
    const minor = wholeNumber(amount);
    if (!minor || minor > inv.balance_minor) {
      setProblem(`Enter an amount up to ${formatMoney(inv.balance_minor, inv.currency)}.`);
      return;
    }
    setProblem(null);
    const p = await record.mutateAsync({ invoice: inv.id, amount_minor: minor, method });
    setDone(`Recorded ${formatMoney(p.amount_minor, p.currency)} for ${p.student_name}. Receipt ${p.receipt_number}.`);
    setAmount('');
  }

  return (
    <Card title="Record a payment">
      <View style={styles.choices}>
        {open.slice(0, 10).map((i) => (
          <Button
            key={i.id}
            label={tick(i.id === inv.id, `${i.student_name} · ${formatMoney(i.balance_minor, i.currency)} due`)}
            variant="secondary"
            onPress={() => setInvoiceId(i.id)}
          />
        ))}
      </View>
      <View style={styles.choices}>
        <Button label={tick(method === 'cash', 'Cash')} variant="secondary" onPress={() => setMethod('cash')} />
        <Button label={tick(method === 'bank', 'Bank deposit')} variant="secondary" onPress={() => setMethod('bank')} />
      </View>
      <Field label={`Amount (${inv.currency})`} value={amount} onChangeText={setAmount} keyboardType="number-pad" />
      <ErrorText message={problem ?? record.error?.message} />
      {done ? <Body>{done}</Body> : null}
      <Button label="Record payment" onPress={submit} busy={record.isPending} />
    </Card>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
  panel: { gap: 8, marginTop: 8 },
});
