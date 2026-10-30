import { Badge, Banner, Button, Card, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import type { DocState } from '@/mock/teacher';

const STATE = {
  verified: { label: 'Verified', tone: 'good' },
  in_review: { label: 'In review', tone: 'info' },
  needed: { label: 'Needed', tone: 'warning' },
} as const satisfies Record<DocState, { label: string; tone: 'good' | 'info' | 'warning' }>;

/** Inventory 49: identity and teaching credentials for the verified badge and payouts. */
export default function VerificationScreen() {
  return (
    <PreviewScreen title="Verification" subtitle="Your ID and qualifications unlock the verified badge and instant payouts">
      {(m) => (
        <>
          <Banner tone="info" title="2 of 4 checks done" body="We check documents within two working days." />
          <Card icon="check">
            {m.teacher.verification.map((d) => (
              <Row
                key={d.doc}
                icon={d.state === 'verified' ? 'check' : d.state === 'in_review' ? 'clock' : 'alert'}
                title={d.doc}
                detail={d.detail}
                badge={<Badge label={STATE[d.state].label} tone={STATE[d.state].tone} />}
              />
            ))}
          </Card>
          <Button label="Upload police clearance" icon="camera" onPress={() => undefined} />
        </>
      )}
    </PreviewScreen>
  );
}
