import { Badge, Banner, Button, Card, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

const PRIORITY = {
  urgent: { label: 'Urgent', tone: 'danger' },
  high: { label: 'High', tone: 'warning' },
  normal: { label: 'Normal', tone: 'neutral' },
} as const;

type Priority = keyof typeof PRIORITY;

/** Inventory 72: one queue for verification, safeguarding, copyright and quality, with an AI first read. */
export default function TrustScreen() {
  return (
    <PreviewScreen title="Trust and safety" subtitle="Everything that needs a person, with the AI's first read">
      {(m) => {
        const urgent = m.command.trustQueue.filter((t) => t.priority === 'urgent').length;
        return (
          <>
            {urgent > 0 ? <Banner tone="danger" title={`${urgent} safeguarding case needs action now`} body="Safeguarding goes to the front of the queue and pages the on-call lead." /> : null}
            {m.command.trustQueue.map((t) => {
              const p = PRIORITY[t.priority as Priority] ?? PRIORITY.normal;
              return (
                <Card key={t.id} title={t.subject} subtitle={t.kind} icon={t.kind.startsWith('Safeguarding') ? 'alert' : 'flag'}>
                  <Row icon="sparkle" title="AI first read" detail={t.ai} badge={<Badge label={p.label} tone={p.tone} />} />
                  <Button label="Open case" compact onPress={() => undefined} />
                </Card>
              );
            })}
          </>
        );
      }}
    </PreviewScreen>
  );
}
