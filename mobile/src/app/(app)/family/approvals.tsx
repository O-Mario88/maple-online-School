import { useState } from 'react';

import { Badge, Banner, Button, Card, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';
import { toast } from '@/lib/toast';

/** Inventory 56 (and 57's meeting booker): approve what your child asks to book; book a teacher's office hour. */
export default function ApprovalsScreen() {
  const [done, setDone] = useState<Record<string, 'approved' | 'declined'>>({});
  return (
    <PreviewScreen title="Approvals" subtitle="Your child asks; you decide and pay in one tap">
      {(m) => (
        <>
          {m.family.approvals.map((a) => (
            <Card key={a.id} title={a.item} subtitle={`${a.child} asked ${a.requested}`} icon="check">
              <Row
                icon="person"
                title={a.teacher}
                detail={`${a.verified ? 'Verified educator' : 'Not verified'} · rated ${a.rating}`}
                badge={<Badge label={formatMoney(a.priceUGX, 'UGX')} tone="accent" />}
              />
              {done[a.id] ? (
                <Banner tone={done[a.id] === 'approved' ? 'good' : 'info'} title={done[a.id] === 'approved' ? 'Approved and paid by MTN MoMo' : 'Declined; your child has been told'} />
              ) : (
                <Row
                  title="Your decision"
                  badge={
                    <>
                      <Button label="Approve and pay" compact icon="check" onPress={() => setDone({ ...done, [a.id]: 'approved' })} />
                      <Button label="Decline" compact variant="secondary" onPress={() => setDone({ ...done, [a.id]: 'declined' })} />
                    </>
                  }
                />
              )}
            </Card>
          ))}
          <Card title="Teacher office hours" subtitle="Book a meeting" icon="calendar">
            {m.family.officeHours.map((o) => (
              <Row key={o.slot} icon="calendar" title={o.teacher} detail={`${o.slot} · ${o.place}`} badge={<Button label="Book" compact variant="secondary" onPress={() => toast('Booked. We’ve told the teacher and added it to your calendar.')} />} />
            ))}
          </Card>
        </>
      )}
    </PreviewScreen>
  );
}
