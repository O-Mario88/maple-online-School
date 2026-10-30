import { router } from 'expo-router';

import { Badge, Button, Card, Row, Section } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 24: classes, bootcamps and instant homework help. */
export default function LiveScreen() {
  return (
    <PreviewScreen title="Live" subtitle="Your classes, bootcamps and help that's available right now">
      {(m) => {
        const rescue = m.learner.live.filter((l) => l.kind === 'rescue');
        const scheduled = m.learner.live.filter((l) => l.kind !== 'rescue');
        return (
          <>
            <Section title="Available now" description="15-minute homework rescue with a verified teacher">
              <Card icon="hand" title="Homework rescue">
                {rescue.map((l) => (
                  <Row
                    key={l.id}
                    icon="live"
                    title={l.title}
                    detail={`${l.teacher} · ${l.when}`}
                    badge={<Button label="Join · UGX 5,000" compact onPress={() => router.push('/learn/live-room')} />}
                  />
                ))}
              </Card>
            </Section>
            <Section title="Coming up">
              <Card icon="calendar">
                {scheduled.map((l) => (
                  <Row
                    key={l.id}
                    icon={l.kind === 'school' ? 'school' : 'sparkle'}
                    title={l.title}
                    detail={`${l.teacher} · ${l.when} · ${l.seats} seats`}
                    badge={l.status === 'soon' ? <Badge label="Starts soon" tone="warning" /> : <Badge label="Booked" tone="good" />}
                    onPress={() => router.push('/learn/live-room')}
                  />
                ))}
              </Card>
            </Section>
          </>
        );
      }}
    </PreviewScreen>
  );
}
