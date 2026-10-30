import { useState } from 'react';

import { Badge, Button, Card, Field, Grid, Row, Stat, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';

/** Inventory 35 and 34: study passes, tutoring credit, payment methods, receipts, and joining a class by code. */
export default function BillingScreen() {
  const [code, setCode] = useState('');
  return (
    <PreviewScreen title="Wallet" subtitle="Passes, tutoring credit, payment methods and receipts">
      {(m) => {
        const b = m.learner.billing;
        return (
          <>
            <Grid min={180}>
              <Stat label="Tutoring credit" value={`${b.creditsMinutes} min`} icon="clock" tone="accent" />
              <Stat label="Active passes" value={String(b.passes.length)} icon="star" tone="good" />
            </Grid>
            <Grid min={320}>
              <Card title="Payment methods" icon="wallet">
                {b.methods.map((p) => (
                  <Row key={p.label} icon="wallet" title={p.label} badge={p.primary ? <Badge label="Main" tone="accent" /> : undefined} />
                ))}
                <Button label="Top up tutoring credit" icon="plus" compact onPress={() => undefined} />
              </Card>
              <Card title="Join a class" subtitle="Your teacher gives you a 6-digit code" icon="qr">
                <Field label="Class code" value={code} onChangeText={setCode} placeholder="482 917" keyboardType="number-pad" maxLength={7} />
                <Button label="Join class" compact disabled={code.replace(/\s/g, '').length !== 6} onPress={() => undefined} />
              </Card>
            </Grid>
            <Card title="Receipts" icon="check">
              <Table
                rows={b.receipts}
                rowKey={(r) => r.id}
                columns={[
                  { key: 'id', label: 'Receipt', render: (r) => r.id },
                  { key: 'item', label: 'For', flex: 2, render: (r) => r.item },
                  { key: 'date', label: 'Date', render: (r) => r.date },
                  { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatMoney(r.amountUGX, 'UGX') },
                ]}
              />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
