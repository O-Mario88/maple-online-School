import { useState } from 'react';

import { Button, Card, Field, Row } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 39: cut a 60-second short from a recorded class, or upload one. */
export default function ShortsCreatorScreen() {
  const [title, setTitle] = useState('The elimination trick');
  return (
    <PreviewScreen title="Shorts creator" subtitle="Turn your best 60 seconds into a revision clip learners can find">
      {(m) => (
        <>
          <Card title="Moments from your recordings" subtitle="Picked by how many learners rewatched them" icon="sparkle">
            {m.teacher.clips.map((c) => (
              <Row key={c.id} icon="play" title={c.title} detail={`${c.source} · ${c.moment}`} onPress={() => setTitle(c.title)} />
            ))}
          </Card>
          <Card title="Your short" icon="play">
            <Field label="Title" value={title} onChangeText={setTitle} />
            <Field label="Subject and course" value="Mathematics · S3 Algebra and Functions" editable={false} />
            <Button label="Upload a vertical video instead" icon="download" variant="secondary" onPress={() => undefined} />
            <Button label="Publish to Shorts" icon="check" onPress={() => undefined} />
          </Card>
        </>
      )}
    </PreviewScreen>
  );
}
