import { router } from 'expo-router';
import { useState } from 'react';

import { Banner, Body, Button, Card, Chip, ChipRow, Grid, Heading, Row, Stat } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { PUBLIC_PREVIEWS } from '@/lib/navigation';

/** Inventory 1, 6 and 7: the public home page, with a past-paper question to try before signing up. */
export default function WelcomeScreen() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <PreviewScreen title="Maple Online School" eyebrow="Learn with Maple" subtitle="Live classes, past papers and lessons for every syllabus">
      {(m) => {
        const l = m.publicPages.landing;
        const q = l.tryQuestion;
        const right = picked === q.answer;
        return (
          <>
            <Heading>{l.headline}</Heading>
            <Body muted>{l.sub}</Body>
            <ChipRow>
              {l.boards.map((b) => (
                <Chip key={b} label={b} />
              ))}
            </ChipRow>
            <Grid min={300}>
              <Card title="Try a question" subtitle="UCE Maths · Paper 1" icon="sparkle">
                <Body>{q.text}</Body>
                <ChipRow>
                  {q.options.map((o, i) => (
                    <Chip key={o} label={o} selected={picked === i} onPress={() => setPicked(i)} />
                  ))}
                </ChipRow>
                {picked === null ? null : (
                  <Banner
                    tone={right ? 'good' : 'warning'}
                    title={right ? 'Correct' : 'Not quite'}
                    body={right ? 'UGX 500 more on UGX 2,000 is a 25% rise. Sign up to see the whole paper.' : 'Work out the rise (UGX 500) as a share of the old fare.'}
                  />
                )}
              </Card>
              <Card title="Live right now" icon="live">
                {l.liveNow.map((s) => (
                  <Row key={s} icon="live" title={s} />
                ))}
              </Card>
            </Grid>
            <Grid min={170}>
              {l.stats.map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} />
              ))}
            </Grid>
            <Grid min={300}>
              <Card title="For schools" subtitle="Registers, marks, report cards and fees in one place" icon="school">
                <Button label="Book a demo for your school" variant="secondary" compact onPress={() => undefined} />
              </Card>
              <Card title="Get started" icon="person">
                <Button label="Create a free account" onPress={() => router.push('/sign-up')} />
                <Button label="Sign in" variant="ghost" compact onPress={() => router.push('/sign-in')} />
              </Card>
            </Grid>
            <Card title="More public pages" icon="globe">
              {PUBLIC_PREVIEWS.filter((p) => p.href !== '/welcome').map((p) => (
                <Row key={p.href} icon={p.icon} title={p.label} onPress={() => router.push(p.href)} />
              ))}
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}
