import { Banner, Button, Card, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';
import { toast } from '@/lib/toast';

/** Inventory 69 (Phase 6): the full accounting suite; here, the trial balance. */
export default function AccountingScreen() {
  return (
    <PreviewScreen title="Accounting" subtitle="Chart of accounts, journals, suppliers and reports (planned for Phase 6)">
      {(m) => {
        const rows = m.school.accounting.trialBalance;
        const debit = rows.reduce((s, r) => s + r.debit, 0);
        const credit = rows.reduce((s, r) => s + r.credit, 0);
        return (
          <>
            <Banner tone={debit === credit ? 'good' : 'danger'} title={debit === credit ? 'Trial balance agrees' : 'Trial balance is out'} body={`Debits ${formatMoney(debit, 'UGX')} · credits ${formatMoney(credit, 'UGX')}`} />
            <Card title="Trial balance · 30 Oct 2026" icon="chart">
              <Table
                rows={rows}
                rowKey={(r) => r.code}
                columns={[
                  { key: 'code', label: 'Code', render: (r) => r.code },
                  { key: 'account', label: 'Account', flex: 2, render: (r) => r.account },
                  { key: 'dr', label: 'Debit', align: 'right', render: (r) => (r.debit ? formatMoney(r.debit, 'UGX') : '—') },
                  { key: 'cr', label: 'Credit', align: 'right', render: (r) => (r.credit ? formatMoney(r.credit, 'UGX') : '—') },
                ]}
              />
            </Card>
            <Button label="Export to QuickBooks or Xero" icon="download" variant="secondary" onPress={() => toast('Ledger exported. QuickBooks or Xero will import it on its next sync.')} />
          </>
        );
      }}
    </PreviewScreen>
  );
}
