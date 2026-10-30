import { useState } from 'react';

import { Button, Card, Chip, ChipRow, Field, KeyValue, Table } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';

const METHODS = ['MTN MoMo', 'Airtel Money', 'Card'] as const;
type Method = (typeof METHODS)[number];

/** Inventory 12: a fee payment link a parent can open and pay without an account. */
export default function PayLinkScreen() {
  const [method, setMethod] = useState<Method>('MTN MoMo');
  return (
    <PreviewScreen title="Pay school fees" subtitle="Secure payment link">
      {(m) => {
        const p = m.publicPages.payLink;
        const total = p.items.reduce((s, i) => s + i.ugx, 0);
        const due = total - p.paidUGX;
        return (
          <>
            <Card title={p.school} subtitle={`${p.learner} · ${p.invoice}`} icon="school">
              <Table
                rows={p.items}
                rowKey={(i) => i.name}
                columns={[
                  { key: 'name', label: 'Item', flex: 2, render: (i) => i.name },
                  { key: 'ugx', label: 'Amount', align: 'right', render: (i) => formatMoney(i.ugx, 'UGX') },
                ]}
              />
              <KeyValue
                items={[
                  { label: 'Already paid', value: formatMoney(p.paidUGX, 'UGX') },
                  { label: 'Due now', value: formatMoney(due, 'UGX') },
                ]}
              />
            </Card>
            <Card title="Pay with" icon="wallet">
              <ChipRow>
                {METHODS.map((x) => (
                  <Chip key={x} label={x} selected={method === x} onPress={() => setMethod(x)} />
                ))}
              </ChipRow>
              {method === 'Card' ? null : <Field label="Phone number" placeholder="07XX XXX XXX" keyboardType="phone-pad" />}
              <Button label={`Pay ${formatMoney(due, 'UGX')}`} icon="lock" onPress={() => undefined} />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
