import { Badge, Banner, Button, Card, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';
import { toast } from '@/lib/toast';

function toneFor(needs: string): 'good' | 'warning' | 'danger' {
  if (needs === 'Ready') return 'good';
  if (needs.startsWith('Retry')) return 'danger';
  return 'warning';
}

/** Inventory 75: teacher payouts, with two people approving large amounts. */
export default function PayoutsScreen() {
  return (
    <PreviewScreen title="Payouts" subtitle="Teacher earnings going out; anything over UGX 2M needs two approvers">
      {(m) => (
        <>
          <Banner tone="info" title="Two-person approval" body="The person who approved first can't approve again. Every approval is logged." />
          {m.command.payoutQueue.map((p) => (
            <Card key={p.id} title={p.teacher} subtitle={`${p.id} · ${p.to}`} icon="wallet">
              <Row icon="wallet" title={formatMoney(p.amountUGX, 'UGX')} detail={p.firstApprover ? `Approved by ${p.firstApprover}` : 'Not yet approved'} badge={<Badge label={p.needs} tone={toneFor(p.needs)} />} />
              <Button label={p.needs.startsWith('Retry') ? 'Retry payout' : 'Approve'} compact onPress={() => toast(p.needs.startsWith('Retry') ? 'Payout sent again.' : 'Payout approved.')} />
            </Card>
          ))}
        </>
      )}
    </PreviewScreen>
  );
}
