import { Banner, Button, Card, KeyValue, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';

/** Inventory 11: the weekly family digest, opened from WhatsApp or SMS without signing in. */
export default function DigestScreen() {
  return (
    <PreviewScreen title="This week at school" subtitle="Your weekly summary from Maple">
      {(m) => {
        const d = m.publicPages.digest;
        return (
          <>
            <Card title={d.child} subtitle={d.week} icon="person">
              <KeyValue
                items={[
                  { label: 'Attendance', value: d.attendance },
                  { label: 'Fees still due', value: formatMoney(d.balanceUGX, 'UGX') },
                ]}
              />
            </Card>
            <Card title="Mastered this week" icon="star">
              {d.mastered.map((s) => (
                <Row key={s} icon="check" title={s} />
              ))}
            </Card>
            <Card title={`A voice note from ${d.voiceFrom}`} icon="mic">
              <Button label="Play (0:42)" icon="mic" variant="secondary" compact onPress={() => undefined} />
            </Card>
            <Button label="Pay fees" icon="wallet" onPress={() => undefined} />
            <Banner tone="info" title="Private link" body={`${d.expires}. Sign in to see everything.`} />
          </>
        );
      }}
    </PreviewScreen>
  );
}
