import { Badge, Button, Card, Field, Grid, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 14: help articles and live service status. */
export default function HelpScreen() {
  return (
    <PreviewScreen title="Help" subtitle="Answers for learners, parents, teachers and schools">
      {(m) => (
        <>
          <Field label="Search help" placeholder="e.g. pay fees with MTN" />
          <Grid min={280}>
            {m.publicPages.help.map((h) => (
              <Card key={h.topic} title={h.topic} icon="flag">
                {h.articles.map((a) => (
                  <Row key={a} icon="chat" title={a} onPress={() => undefined} />
                ))}
              </Card>
            ))}
          </Grid>
          <Card title="Service status" icon="live">
            {m.publicPages.status.map((s) => (
              <Row key={s.service} icon={s.state === 'Working' ? 'check' : 'alert'} title={s.service} badge={<Badge label={s.state} tone={s.state === 'Working' ? 'good' : 'warning'} />} />
            ))}
          </Card>
          <Button label="Chat with support on WhatsApp" icon="chat" variant="secondary" onPress={() => undefined} />
        </>
      )}
    </PreviewScreen>
  );
}
