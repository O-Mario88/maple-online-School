import { Badge, Card, Grid, Stat, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';

/** Inventory 74: mobile-money and card batches matched to invoices, and where the money sits. */
export default function RevenueScreen() {
  return (
    <PreviewScreen title="Revenue" subtitle="Every provider batch matched to invoices, and how the money splits">
      {(m) => {
        const r = m.command.revenue;
        return (
          <>
            <Grid min={200}>
              <Stat label="Held in escrow" value={formatMoney(r.split.escrowUGX, 'UGX')} detail="Released when lessons are delivered" icon="lock" />
              <Stat label="Maple net" value={formatMoney(r.split.netUGX, 'UGX')} icon="chart" tone="good" />
              <Stat label="Schools' own fees" value={formatMoney(r.split.byosUGX, 'UGX')} detail="Paid straight to schools" icon="school" />
            </Grid>
            <Card title="Settlement batches" icon="wallet">
              <Table
                rows={r.batches}
                rowKey={(b) => b.id}
                columns={[
                  { key: 'provider', label: 'Provider', flex: 1.5, render: (b) => b.provider },
                  { key: 'id', label: 'Batch', render: (b) => b.id },
                  { key: 'amount', label: 'Amount', align: 'right', render: (b) => formatMoney(b.amountUGX, 'UGX') },
                  { key: 'matched', label: 'Matched', align: 'right', render: (b) => `${(b.matched * 100).toFixed(1)}%` },
                  { key: 'status', label: 'Status', align: 'right', render: (b) => <Badge label={b.status} tone={b.status === 'Reconciled' ? 'good' : 'warning'} /> },
                ]}
              />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
