import { useState } from 'react';
import { Platform, Share } from 'react-native';

import { Badge, Body, Button, Card, EmptyState, ErrorText, Field, Grid, Loading, Row, Screen, Segmented, Stat } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { financeSchools, formatMoney, invoiceStatusLabel, type Invoice, type SchoolChoice } from '@/lib/finance/fees';
import { exportFileName, type StudentBalance, studentBalances } from '@/lib/finance/ledger';
import { fetchJournalCsv, useSchoolInvoices, useStatement, useSummary, useVoidInvoice } from '@/lib/finance/queries';
import { toast } from '@/lib/toast';

const CURRENCY = 'UGX';

/** Save the journal: a download on the web, the share sheet on phones. */
async function exportJournal(school: SchoolChoice) {
  const csv = await fetchJournalCsv(school.id);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName(school.name);
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: exportFileName(school.name), message: csv });
}

/** An invoice line; an unpaid invoice can be cancelled with a second tap. */
function InvoiceRow({ inv }: { inv: Invoice }) {
  const cancel = useVoidInvoice();
  const [confirming, setConfirming] = useState(false);
  const canCancel = inv.status === 'issued' && inv.paid_minor === 0;

  const onCancel = () => {
    if (!confirming) return setConfirming(true);
    cancel.mutate(inv.id, {
      onSuccess: () => toast(`${inv.number} cancelled. A reversing entry is in the journal.`),
      onError: (e) => toast(e.message),
      onSettled: () => setConfirming(false),
    });
  };

  return (
    <Row
      title={`${inv.number} · ${formatMoney(inv.total_minor, inv.currency)}`}
      detail={`${invoiceStatusLabel(inv.status)} · paid ${formatMoney(inv.paid_minor, inv.currency)}${inv.due_date ? ` · due ${inv.due_date}` : ''}`}
      badge={
        canCancel ? (
          <Button compact variant={confirming ? 'danger' : 'ghost'} label={confirming ? 'Tap again to cancel' : 'Cancel invoice'} busy={cancel.isPending} onPress={onCancel} />
        ) : (
          <Badge label={invoiceStatusLabel(inv.status)} tone={inv.status === 'paid' ? 'good' : 'info'} />
        )
      }
    />
  );
}

/** One learner: the running statement from the ledger, and their invoices. */
function StudentLedger({ row, school }: { row: StudentBalance; school: SchoolChoice }) {
  const statement = useStatement(row.student, school.id);
  return (
    <>
      <Card title={`${row.name} · statement`} subtitle={`Balance ${formatMoney(statement.data?.balance_minor ?? row.balance, CURRENCY)}`} icon="receipt">
        {statement.isPending ? <Loading label="Loading the statement" /> : null}
        <ErrorText message={statement.error?.message} />
        {statement.data?.lines.length === 0 ? <Body muted>No entries yet.</Body> : null}
        {statement.data?.lines.map((l, i) => (
          <Row
            key={`${l.reference}-${i}`}
            title={`${new Date(l.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · ${l.memo || l.kind}`}
            detail={`${l.reference} · ${l.debit_minor > 0 ? `billed ${formatMoney(l.debit_minor, l.currency)}` : `paid ${formatMoney(l.credit_minor, l.currency)}`}`}
            badge={<Badge label={formatMoney(l.balance_minor, l.currency)} tone={l.balance_minor > 0 ? 'warning' : 'good'} />}
          />
        ))}
      </Card>
      <Card title="Invoices" icon="doc">
        {row.invoices.map((inv) => (
          <InvoiceRow key={inv.id} inv={inv} />
        ))}
      </Card>
    </>
  );
}

function SchoolLedger({ school }: { school: SchoolChoice }) {
  const invoices = useSchoolInvoices(school.id);
  const summary = useSummary(school.id);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  if (invoices.isPending) return <Loading label="Loading the ledger" />;
  if (invoices.error) return <ErrorText message={invoices.error.message} />;

  const rows = studentBalances(invoices.data ?? []);
  const q = query.trim().toLowerCase();
  const shown = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
  const chosen = rows.find((r) => r.student === picked) ?? null;
  const s = summary.data;

  const onExport = async () => {
    setExporting(true);
    try {
      await exportJournal(school);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not export the journal.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {s ? (
        <Grid min={170}>
          <Stat label="Billed" value={formatMoney(s.billed_minor, s.currency)} icon="receipt" tone="neutral" />
          <Stat label="Collected" value={formatMoney(s.collected_minor, s.currency)} icon="check" tone="good" />
          <Stat label="Outstanding" value={formatMoney(s.outstanding_minor, s.currency)} icon="wallet" tone={s.outstanding_minor > 0 ? 'warning' : 'good'} />
        </Grid>
      ) : null}
      <Grid min={340}>
        <Card title="Learners" subtitle="Most owed first. Tap a learner for their statement." icon="people">
          <Field label="Search learners" value={query} onChangeText={setQuery} placeholder="e.g. Amani" />
          {rows.length === 0 ? <Body muted>No invoices yet. Bill a class from Fees.</Body> : null}
          {shown.map((r) => (
            <Row
              key={r.student}
              title={r.name}
              detail={`Billed ${formatMoney(r.billed, CURRENCY)} · paid ${formatMoney(r.paid, CURRENCY)}`}
              badge={<Badge label={r.balance > 0 ? formatMoney(r.balance, CURRENCY) : 'Cleared'} tone={r.balance > 0 ? 'warning' : 'good'} />}
              onPress={() => setPicked(r.student)}
            />
          ))}
        </Card>
        <Card title="Journal export" subtitle="Every posted entry, ready for QuickBooks, Xero or a spreadsheet" icon="download">
          <Button label="Export the journal (CSV)" variant="secondary" icon="download" busy={exporting} onPress={onExport} />
        </Card>
      </Grid>
      {chosen ? <StudentLedger key={chosen.student} row={chosen} school={school} /> : null}
    </>
  );
}

/** The student fee ledger on the real API: balances by learner, statements, cancelling unpaid invoices and the journal export. */
export function LiveLedger() {
  const me = useMe();
  const schools = me.data ? financeSchools(me.data.memberships) : [];
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const school = schools.find((s) => s.id === schoolId) ?? schools[0];

  return (
    <Screen width="wide" title="Student ledger" subtitle="What each learner owes, their statement, and the school's journal for the accountant.">
      {me.isPending ? <Loading label="Loading your schools" /> : null}
      {me.data && !school ? <EmptyState icon="wallet" title="For the bursar and school leaders" body="The headteacher, deputy and registrar run the school's fees." /> : null}
      {schools.length > 1 && school ? (
        <Segmented label="School" options={schools.map((s) => ({ value: String(s.id), label: s.name }))} value={String(school.id)} onChange={(v) => setSchoolId(Number(v))} />
      ) : null}
      {school ? <SchoolLedger key={school.id} school={school} /> : null}
    </Screen>
  );
}
