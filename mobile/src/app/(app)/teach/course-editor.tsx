import { useState } from 'react';

import { Button, Card, Field, Grid, KeyValue, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';

/** Inventory 38: build modules and lessons, set price, access and completion. */
export default function CourseEditorScreen() {
  const [title, setTitle] = useState('');
  return (
    <PreviewScreen title="Course builder" subtitle="Modules, lessons, notes and how learners get access">
      {(m) => {
        const c = m.teacher.courseEditor;
        return (
          <>
            <Field label="Course title" value={title || c.title} onChangeText={setTitle} />
            <Grid min={320}>
              <Card title="Access and price" icon="wallet">
                <KeyValue
                  items={[
                    { label: 'Price', value: formatMoney(c.priceUGX, 'UGX') },
                    { label: 'Access', value: c.access },
                    { label: 'Complete at', value: `${c.completion}% watched` },
                  ]}
                />
              </Card>
              <Card title="Publishing" icon="globe">
                <Row icon="check" title="Teacher verified" detail="You can sell courses" />
                <Row icon="alert" title="2 lessons have no notes" detail="Learners like a PDF to keep" />
                <Button label="Publish course" icon="check" onPress={() => undefined} />
              </Card>
            </Grid>
            {c.modules.map((mod, i) => (
              <Card key={mod.title} title={`Module ${i + 1}: ${mod.title}`} action={<Button label="Add lesson" icon="plus" compact variant="ghost" onPress={() => undefined} />}>
                {mod.lessons.map((l) => (
                  <Row key={l} icon="play" title={l} detail="Video · notes · 5 questions" onPress={() => undefined} />
                ))}
              </Card>
            ))}
            <Button label="Add module" icon="plus" variant="secondary" onPress={() => undefined} />
          </>
        );
      }}
    </PreviewScreen>
  );
}
