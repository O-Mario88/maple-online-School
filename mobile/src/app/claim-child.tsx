import { useState } from 'react';

import { Banner, Button, Card, Field, KeyValue } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 3: a parent links their child with the code or QR the school sent home. */
export default function ClaimChildScreen() {
  const [checked, setChecked] = useState(false);
  return (
    <PreviewScreen back title="Link your child" subtitle="Use the code on the slip or SMS from school" width="narrow">
      {(m) => {
        const c = m.publicPages.claimChild;
        return (
          <>
            <Card title="Claim code" icon="qr">
              <Field label="8-character code" defaultValue={c.code} autoCapitalize="characters" />
              <Button label="Find my child" onPress={() => setChecked(true)} />
              <Button label="Scan the QR instead" icon="camera" variant="ghost" compact onPress={() => undefined} />
            </Card>
            {checked ? (
              <>
                <Banner tone="good" title="We found your child" body="Check the details, then confirm. The school is told straight away." />
                <Card title={c.match.name} icon="person">
                  <KeyValue
                    items={[
                      { label: 'Class', value: c.match.cls },
                      { label: 'School', value: c.match.school },
                      { label: 'Admission no.', value: c.match.adm },
                    ]}
                  />
                  <Button label="Yes, this is my child" icon="check" onPress={() => undefined} />
                </Card>
              </>
            ) : null}
          </>
        );
      }}
    </PreviewScreen>
  );
}
