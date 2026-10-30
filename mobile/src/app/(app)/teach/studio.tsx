import { useState } from 'react';

import { Badge, Banner, Button, Card, Field, Grid, Row, Stat } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 37: turn a syllabus, worksheet or playlist into a course in about a minute. */
export default function StudioScreen() {
  const [link, setLink] = useState('');
  const [generated, setGenerated] = useState(true);
  return (
    <PreviewScreen title="AI course studio" subtitle="Upload a syllabus or past paper, or paste a playlist, and get a course to edit">
      {(m) => {
        const s = m.teacher.studio;
        return (
          <>
            <Card title="Start from" icon="sparkle">
              <Button label="Upload a PDF (syllabus, worksheet or past paper)" icon="download" variant="secondary" onPress={() => setGenerated(true)} />
              <Field label="Or paste a YouTube playlist or Google Classroom link" value={link} onChangeText={setLink} placeholder="https://" />
              <Button label="Build my course" icon="sparkle" onPress={() => setGenerated(true)} />
            </Card>
            {generated ? (
              <>
                <Banner tone="good" title={`Built from “${s.source}” in ${s.seconds} seconds`} body="Check each lesson before you publish. Nothing goes live until you say so." />
                <Grid min={160}>
                  <Stat label="Modules" value={String(s.generated.length)} icon="map" tone="accent" />
                  <Stat label="Lessons" value={String(s.generated.reduce((n, g) => n + g.lessons.length, 0))} icon="play" />
                  <Stat label="Quizzes" value={String(s.generated.reduce((n, g) => n + g.quizzes, 0))} icon="clipboard" />
                </Grid>
                {s.generated.map((g) => (
                  <Card key={g.module} title={g.module} subtitle={`${g.quizzes} quizzes`} action={<Badge label={g.competencies.join(' · ')} tone="info" />}>
                    {g.lessons.map((l) => (
                      <Row key={l} icon="play" title={l} detail="Draft lesson · notes and 5 check questions" />
                    ))}
                  </Card>
                ))}
                <Button label="Open in course builder" icon="book" onPress={() => undefined} />
              </>
            ) : null}
          </>
        );
      }}
    </PreviewScreen>
  );
}
