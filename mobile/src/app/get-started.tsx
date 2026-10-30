import { router } from 'expo-router';
import { useState } from 'react';

import { Badge, Body, Button, Card, Chip, ChipRow } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

const STEPS = ['Who are you?', 'Your syllabus', 'Your class', 'Your goal'] as const;

/** Inventory 2: after signing up, four quick choices that set up Maple for this person. */
export default function GetStartedScreen() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('Learner');
  const [curriculum, setCurriculum] = useState('Uganda NCDC (UNEB)');
  const [level, setLevel] = useState('S3');
  const [goal, setGoal] = useState('Pass my exams');
  const last = step === STEPS.length - 1;
  return (
    <PreviewScreen title="Let's set up Maple for you" subtitle="Four quick choices; you can change them later" width="narrow">
      {(m) => {
        const g = m.publicPages.getStarted;
        const pages = [
          { options: g.roles, value: role, set: setRole },
          { options: g.curricula, value: curriculum, set: setCurriculum },
          { options: g.levels, value: level, set: setLevel },
          { options: g.goals, value: goal, set: setGoal },
        ];
        const page = pages[step];
        return (
          <>
            <Badge label={`Step ${step + 1} of ${STEPS.length}`} tone="accent" />
            <Card title={STEPS[step]} icon="sparkle">
              <ChipRow>
                {page.options.map((o) => (
                  <Chip key={o} label={o} selected={page.value === o} onPress={() => page.set(o)} />
                ))}
              </ChipRow>
            </Card>
            {last ? <Body muted>{`We'll start you on ${level} ${curriculum.split(' (')[0]} with a 20-minute plan for "${goal.toLowerCase()}".`}</Body> : null}
            <Button label={last ? 'Start learning' : 'Next'} onPress={() => (last ? router.push('/') : setStep((s) => s + 1))} />
            {step > 0 ? <Button label="Back" variant="ghost" compact onPress={() => setStep((s) => s - 1)} /> : null}
          </>
        );
      }}
    </PreviewScreen>
  );
}
