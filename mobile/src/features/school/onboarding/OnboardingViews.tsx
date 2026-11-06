import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { SchoolDesk, SchoolPhoneTop } from '@/features/portal/PortalFrame';
import { Btn, Card } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, GREEN, LINE, NAVY, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { SchoolAdmin } from '@/mock/portal';

import { BasicInfo, Branding, CurriculumCard, ImportCard, PlanCard, Preview, type Profile, Stepper } from './OnboardingParts';
import { Maple } from '@/constants/maple';

type Onboarding = SchoolAdmin['onboarding'];

/** The wizard's state: the profile being edited, the current step and the finished ones. */
function useWizard(o: Onboarding) {
  const [profile, setProfile] = useState<Profile>(o.profile);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<readonly number[]>([]);
  const set = (patch: Partial<Profile>) => setProfile((prev) => ({ ...prev, ...patch }));
  const finish = (i: number) => {
    setDone((prev) => (prev.includes(i) ? prev : [...prev, i]));
    const next = Math.min(i + 1, o.steps.length - 1);
    setCurrent(next);
    toast(i === o.steps.length - 1 ? 'All set. Your school is live on Maple.' : `Saved. Next: ${o.steps[next].title}.`);
    return next;
  };
  return { profile, set, current, setCurrent, done, finish };
}

function BackTitle({ title, onBack, size }: { title: string; onBack: () => void; size: number }) {
  return (
    <View style={styles.backTitle}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}>
        <Icon name="arrowLeft" size={size * 0.8} color={NAVY} />
      </Pressable>
      <Text style={[styles.title, { fontSize: size }]} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

/** The 15-Minute Self-Service School Onboarding Wizard on the desktop reference: all four steps on one page. */

/** Back from the wizard: to where the admin came from, or the dashboard when they opened it directly. */
const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

export function OnboardingDesk({ o, plan }: { o: Onboarding; plan?: string }) {
  const w = useWizard(o);
  return (
    <SchoolDesk search="Search for anything..." me={o.me} help nav={o.nav} active="Onboarding">
      <View style={styles.headRow}>
        <View style={styles.flex}>
          <BackTitle title="School Onboarding" onBack={leave} size={34} />
          <Text style={styles.subtitle}>Set up your school in a few simple steps and start learning with Maple.</Text>
        </View>
        <View style={styles.est}>
          <Icon name="timer" size={24} color={BODY} />
          <Text style={styles.estText}>Est. time: 15 minutes</Text>
        </View>
      </View>
      <Stepper steps={o.steps} current={w.current} done={w.done} onPick={w.setCurrent} />
      <Card style={styles.step1}>
        <Text style={styles.stepTitle}>Step 1: School Profile & Branding</Text>
        <Text style={styles.stepSub}>Tell us about your school and customize how it appears on Maple.</Text>
        <View style={styles.row}>
          <BasicInfo p={w.profile} set={w.set} style={styles.colBasic} />
          <Branding p={w.profile} set={w.set} style={styles.colBrand} />
          <Preview p={w.profile} style={styles.colPreview} />
        </View>
        <Btn label="Save & Continue" iconRight="arrowRight" onPress={() => w.finish(0)} height={54} style={styles.save} />
      </Card>
      <View style={styles.row}>
        <View style={styles.flex}>
          <CurriculumCard o={o} />
        </View>
        <View style={styles.flex}>
          <ImportCard o={o} />
        </View>
        <View style={styles.flex}>
          <PlanCard o={o} initial={plan} />
        </View>
      </View>
    </SchoolDesk>
  );
}

/** One step on its own phone screen, with Save & Continue at the bottom. */
function PhoneStep({ o, w, index, onBack, onNext, plan }: { o: Onboarding; w: ReturnType<typeof useWizard>; index: number; onBack: () => void; onNext: (next: number) => void; plan?: string }) {
  const s = o.steps[index];
  return (
    <ScrollView contentContainerStyle={styles.phoneScroll}>
      <View style={styles.phonePad}>
        <BackTitle title={`Step ${index + 1} of 4`} onBack={onBack} size={26} />
        <Text style={styles.phoneStepTitle}>{s.title}</Text>
        <Text style={styles.phoneSub}>{s.body}</Text>
      </View>
      <View style={styles.phoneBody}>
        {index === 0 ? (
          <>
            <BasicInfo p={w.profile} set={w.set} />
            <Branding p={w.profile} set={w.set} phone />
            <Preview p={w.profile} />
          </>
        ) : null}
        {index === 1 ? <CurriculumCard o={o} phone /> : null}
        {index === 2 ? <ImportCard o={o} /> : null}
        {index === 3 ? <PlanCard o={o} initial={plan} /> : null}
        <Btn label={index === 3 ? 'Activate & Finish' : 'Save & Continue'} iconRight="arrowRight" onPress={() => onNext(w.finish(index))} height={56} textStyle={styles.continueText} />
      </View>
    </ScrollView>
  );
}

/** The phone reference: the four steps as a checklist, the time it takes, and Continue. */
export function OnboardingPhone({ o, plan }: { o: Onboarding; plan?: string }) {
  const w = useWizard(o);
  const [open, setOpen] = useState<number | null>(null);
  if (open !== null) {
    return (
      <View style={styles.phoneRoot}>
        <SchoolPhoneTop initial={o.me.initial} notifications={o.me.notifications} help />
        <PhoneStep o={o} w={w} index={open} plan={plan} onBack={() => setOpen(null)} onNext={(next) => setOpen(w.done.length >= 3 && open === 3 ? null : next)} />
      </View>
    );
  }
  return (
    <View style={styles.phoneRoot}>
      <SchoolPhoneTop initial={o.me.initial} notifications={o.me.notifications} help />
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        <View style={styles.phonePad}>
          <BackTitle title="School Onboarding" onBack={leave} size={27} />
          <Text style={styles.phoneSub}>Get your school set up in just 15 minutes.</Text>
        </View>
        <View style={styles.phoneBody}>
          <Card style={styles.list}>
            {o.steps.map((s, i) => {
              const on = i === w.current;
              const finished = w.done.includes(i);
              return (
                <Pressable key={s.title} style={styles.listRow} onPress={() => setOpen(i)} accessibilityRole="button" accessibilityLabel={`Step ${i + 1}: ${s.title}. ${s.body}${finished ? ' Done.' : ''}`}>
                  <View style={styles.rail}>
                    {i > 0 ? <View style={styles.railTop} /> : null}
                    {i < o.steps.length - 1 ? <View style={styles.railBottom} /> : null}
                    <View style={[styles.dot, on && styles.dotOn, finished && !on && styles.dotDone]}>
                      {finished && !on ? <Icon name="check" size={20} color={WHITE} /> : <Text style={[styles.dotText, on && styles.dotTextOn]}>{i + 1}</Text>}
                    </View>
                  </View>
                  <View style={[styles.listText, i > 0 && styles.listLine]}>
                    <Text style={styles.listTitle}>{s.title}</Text>
                    <Text style={styles.listBody}>{s.body}</Text>
                  </View>
                  <View style={styles.chevron}>
                    <Icon name="chevronRight" size={22} color={BLUE} />
                  </View>
                </Pressable>
              );
            })}
          </Card>
          <Card style={styles.time}>
            <Icon name="clock" size={34} color={BODY} />
            <View style={styles.flex}>
              <Text style={styles.timeLabel}>Est. time to complete</Text>
              <Text style={styles.timeValue}>15 minutes</Text>
              <Text style={styles.timeNote}>You can save and continue later.</Text>
            </View>
          </Card>
          <Image source={o.art} style={styles.art} contentFit="contain" accessibilityLabel="A school building" />
          <Btn label="Continue" iconRight="arrowRight" onPress={() => setOpen(w.current)} height={58} textStyle={styles.continueText} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 20, marginBottom: 18 },
  backTitle: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  subtitle: { marginTop: 6, marginLeft: 44, fontSize: 16, color: BODY },
  est: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  estText: { fontSize: 16, color: NAVY },
  step1: { gap: 6, marginTop: 20 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  stepSub: { fontSize: 16, color: BODY, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 20, marginTop: 20 },
  colBasic: { flex: 1.05 },
  colBrand: { flex: 1 },
  colPreview: { flex: 1 },
  save: { alignSelf: 'flex-end', marginTop: 20, paddingHorizontal: 34 },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneScroll: { paddingBottom: 36 },
  phonePad: { paddingHorizontal: 20, paddingTop: 10, gap: 6 },
  phoneSub: { fontSize: 16, lineHeight: 22, color: BODY },
  phoneStepTitle: { marginTop: 8, fontSize: 21, fontWeight: '800', color: NAVY },
  phoneBody: { gap: 18, paddingHorizontal: 20, paddingTop: 18 },
  list: { padding: 0, paddingHorizontal: 14 },
  listRow: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  rail: { width: 44, alignItems: 'center', justifyContent: 'center' },
  railTop: { position: 'absolute', top: 0, height: '50%', width: 2, backgroundColor: Maple.blueLine },
  railBottom: { position: 'absolute', bottom: 0, height: '50%', width: 2, backgroundColor: Maple.blueLine },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: NAVY, backgroundColor: WHITE },
  dotOn: { borderColor: BLUE, backgroundColor: BLUE },
  dotDone: { borderColor: GREEN, backgroundColor: GREEN },
  dotText: { fontSize: 19, fontWeight: '700', color: NAVY },
  dotTextOn: { color: WHITE },
  listText: { flex: 1, minWidth: 0, gap: 4, paddingVertical: 18 },
  listLine: { borderTopWidth: 1, borderColor: LINE },
  listTitle: { fontSize: 16.5, fontWeight: '700', color: NAVY },
  chevron: { justifyContent: 'center' },
  listBody: { fontSize: 14.5, lineHeight: 20, color: BODY },
  time: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  timeLabel: { fontSize: 14.5, color: BODY },
  timeValue: { marginTop: 2, fontSize: 26, fontWeight: '800', color: NAVY },
  timeNote: { marginTop: 2, fontSize: 15, color: BODY },
  art: { width: '100%', aspectRatio: 329 / 133 },
  continueText: { fontSize: 18 },
});

