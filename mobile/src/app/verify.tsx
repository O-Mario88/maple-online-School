import { Banner, Card, Chip, ChipRow, KeyValue } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 13: anyone can check a Maple certificate is genuine. */
export default function VerifyScreen() {
  return (
    <PreviewScreen publicNav title="Check a certificate" subtitle="Scan the QR on a Maple certificate, or enter its ID">
      {(m) => {
        const c = m.publicPages.credential;
        return (
          <>
            <Banner tone="good" title="This certificate is genuine" body={`Signature check: ${c.signature}`} />
            <Card title={c.title} subtitle={c.issuer} icon="star">
              <KeyValue
                items={[
                  { label: 'Awarded to', value: c.holder },
                  { label: 'Issued', value: c.issued },
                  { label: 'Certificate ID', value: c.id },
                ]}
              />
            </Card>
            <Card title="Skills shown" icon="check">
              <ChipRow>
                {c.competencies.map((s) => (
                  <Chip key={s} label={s} selected />
                ))}
              </ChipRow>
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
