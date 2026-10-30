import { Banner, Button, Card, Grid, KeyValue, ProgressBar, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';

/** Inventory 9: a public page for one live event, with seats and booking. */
export default function EventScreen() {
  return (
    <PreviewScreen publicNav back title="Live event" subtitle="Book a seat; pay with MTN, Airtel or card">
      {(m) => {
        const e = m.publicPages.liveEvent;
        const taken = e.seats - e.seatsLeft;
        return (
          <>
            <Banner tone="info" title={e.title} body={`${e.teacher} · ${e.when}`} />
            <Grid min={300}>
              <Card title="What you'll cover" icon="map">
                {e.syllabus.map((s) => (
                  <Row key={s} icon="check" title={s} />
                ))}
              </Card>
              <Card title="Seats" icon="people">
                <ProgressBar label={`${taken} of ${e.seats} booked`} value={taken / e.seats} tone={e.seatsLeft < 50 ? 'warning' : 'accent'} />
                <KeyValue
                  items={[
                    { label: 'Price', value: formatMoney(e.priceUGX, 'UGX') },
                    { label: 'Seats left', value: String(e.seatsLeft) },
                    { label: 'Recording', value: 'Included for 30 days' },
                  ]}
                />
                <Button label={`Book for ${formatMoney(e.priceUGX, 'UGX')}`} icon="wallet" onPress={() => undefined} />
              </Card>
            </Grid>
          </>
        );
      }}
    </PreviewScreen>
  );
}
