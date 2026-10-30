import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Banner, Button, Card, Chip, ChipRow, Field, Row } from '@/components/ui';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 59: a 15-minute self-service set-up for a whole school. */
export default function OnboardingWizardScreen() {
  const { styles } = useStyles(makeStyles);
  const [step, setStep] = useState(1);
  const [curriculum, setCurriculum] = useState('Uganda NCDC (UNEB)');
  return (
    <PreviewScreen title="Set up your school" subtitle="About 15 minutes. You can come back to any step.">
      {(m) => {
        const o = m.school.onboarding;
        return (
          <>
            <View style={styles.steps} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: o.steps.length, now: step + 1 }}>
              {o.steps.map((s, i) => (
                <View key={s} style={styles.step}>
                  <View style={[styles.dot, i < step && styles.dotDone, i === step && styles.dotOn]}>
                    <Text style={[styles.dotText, i <= step && styles.dotTextOn]}>{i < step ? '✓' : i + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, i === step && styles.stepLabelOn]}>{s}</Text>
                </View>
              ))}
            </View>
            {step === 0 ? (
              <Card title="School profile" icon="school">
                <Field label="School name" value={o.profile.name} editable={false} />
                <Field label="Motto" value={o.profile.motto} editable={false} />
                <Row icon="sparkle" title="Brand colour" detail={o.profile.colour} />
              </Card>
            ) : null}
            {step === 1 ? (
              <Card title="Curriculum" subtitle="Classes and subjects are created for you" icon="map">
                <ChipRow>
                  {o.curricula.map((c) => (
                    <Chip key={c} label={c} selected={c === curriculum} onPress={() => setCurriculum(c)} />
                  ))}
                </ChipRow>
                <Banner tone="good" title={`${curriculum}: ready`} body="Nursery to S6, 48 subjects, compulsory subjects and elective rules included." />
              </Card>
            ) : null}
            {step === 2 ? (
              <Card title="Rosters" subtitle="Upload learners, teachers and parents from Excel" icon="people">
                <Row icon="download" title="S1 intake 2027.xlsx" detail="184 learners found" badge={<Badge label="2 to fix" tone="warning" />} />
                <Button label="Review the import" variant="secondary" onPress={() => undefined} />
              </Card>
            ) : null}
            {step === 3 ? (
              <Card title="Choose a plan" icon="wallet">
                <Row icon="star" title="Pilot term" detail="Free until 4 Dec 2026" badge={<Badge label="Selected" tone="accent" />} />
                <Row icon="people" title="Claim teachers' class spaces" detail="3 of your teachers already use Maple" />
              </Card>
            ) : null}
            <View style={styles.actions}>
              <Button label="Back" variant="secondary" disabled={step === 0} onPress={() => setStep(step - 1)} />
              <Button label={step === o.steps.length - 1 ? 'Finish' : 'Continue'} icon="check" onPress={() => setStep(Math.min(step + 1, o.steps.length - 1))} />
            </View>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    steps: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
    step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: t.borderStrong, alignItems: 'center', justifyContent: 'center' },
    dotDone: { backgroundColor: t.successSoft, borderColor: t.success },
    dotOn: { backgroundColor: t.accent, borderColor: t.accent },
    dotText: { ...Type.caption, color: t.textMuted },
    dotTextOn: { color: t.text },
    stepLabel: { ...Type.small, color: t.textSecondary },
    stepLabelOn: { color: t.text, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: Spacing.two },
  });
}
