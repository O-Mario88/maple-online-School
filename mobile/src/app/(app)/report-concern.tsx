import { useState } from 'react';

import { Banner, Button, Card, Chip, ChipRow, Field, ToggleRow } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 16: anyone can report a safety, content or payment concern from any screen. */
export default function ReportConcernScreen() {
  const [kind, setKind] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  return (
    <PreviewScreen back title="Report a concern" subtitle="Tell us what happened. You can stay anonymous to other users." width="narrow">
      {(m) => {
        const c = m.shared.concern;
        if (sent) {
          return <Banner tone="good" title="Thank you. We've got it." body={c.promise} />;
        }
        return (
          <>
            <Card title="What is it about?" icon="flag">
              <ChipRow>
                {c.kinds.map((k) => (
                  <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />
                ))}
              </ChipRow>
              <Field label="What happened?" multiline placeholder="Who, where in Maple, and when" />
              <ToggleRow label="Attach the screen I was on" initial />
            </Card>
            <Banner tone="info" title="In danger right now?" body="Call the Uganda child helpline on 116 (free)." />
            <Button label="Send report" icon="check" disabled={kind === null} onPress={() => setSent(true)} />
          </>
        );
      }}
    </PreviewScreen>
  );
}
