import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Body, Button, Card, Screen } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { type Lock, useAccess } from '@/lib/access/access-context';
import { dayLabel } from '@/lib/access/trial';
import { formatMoney } from '@/lib/finance/fees';
import { toast } from '@/lib/toast';

const ugx = (n: number) => formatMoney(n, 'UGX');

/** The plans to continue with, one chosen, and the button that pays for it. */
function Plans() {
  const { styles } = useStyles(makeStyles);
  const { plans, payer, payWith, pay } = useAccess();
  const [chosen, setChosen] = useState(() => plans.find((p) => p.popular)?.id ?? plans[0]?.id ?? '');
  const plan = plans.find((p) => p.id === chosen);
  const per = payer === 'school' ? 'per learner a month' : 'a month';
  return (
    <>
      <View style={styles.plans}>
        {plans.map((p) => {
          const on = p.id === chosen;
          return (
            <Pressable
              key={p.id}
              style={[styles.plan, on && styles.planOn]}
              onPress={() => setChosen(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${p.name}, ${ugx(p.monthly)} ${per}`}>
              <View style={styles.planHead}>
                <Text style={styles.planName}>{p.name}</Text>
                {p.popular ? <Badge label="Most popular" tone="accent" /> : null}
              </View>
              <Text style={styles.price}>
                {ugx(p.monthly)} <Text style={styles.per}>{per}</Text>
              </Text>
              <Text style={styles.blurb}>{p.blurb}</Text>
            </Pressable>
          );
        })}
      </View>
      {plan ? (
        <Card title="Pay with" subtitle={payWith} icon="wallet">
          <Button
            label={`Pay ${ugx(plan.monthly)} to continue`}
            icon="lock"
            onPress={() => {
              toast(`${pay(plan.id)} Everything is open again.`);
            }}
          />
        </Card>
      ) : null}
    </>
  );
}

/** A marketplace course on its own: bought once, it stays open. */
function BuyCourse({ course }: { course: NonNullable<Lock['course']> }) {
  const { buy } = useAccess();
  return (
    <Card title={course.title} subtitle="A teacher's course from the marketplace" icon="cart">
      <Body muted>Your plan opens Maple&apos;s own lessons, papers and library. Marketplace courses are bought one by one, and stay yours once bought.</Body>
      <Button
        label={`Buy for ${ugx(course.priceUGX)}`}
        onPress={() => {
          buy(course.id);
          toast(`${course.title} is yours. It stays open.`);
        }}
      />
    </Card>
  );
}

/**
 * The page in place of a locked one: the free month has ended ('pay'), or it is a marketplace course
 * to buy ('buy'). Without a lock it is the plans page.
 */
export function Paywall({ lock }: { lock?: Lock | null }) {
  const { access } = useAccess();
  if (lock?.reason === 'buy' && lock.course) {
    return (
      <Screen back title="Buy this course" subtitle="Marketplace courses aren't part of a plan.">
        <BuyCourse course={lock.course} />
      </Screen>
    );
  }
  const ended = lock?.reason === 'pay' || access?.phase === 'locked';
  const title = ended ? 'Your free month has ended' : access?.phase === 'paid' ? 'Your plan' : `Free trial: ${access?.daysLeft ?? 0} days left`;
  const subtitle = ended
    ? 'You can still see your progress, the catalogue and free resources. Choose a plan to open everything again.'
    : access?.phase === 'paid'
      ? 'Everything is open. Change your plan here.'
      : `Everything is open until ${access ? dayLabel(access.trialEnds) : ''}, marketplace included. Choose a plan to keep going after that.`;
  return (
    <Screen back={!lock} eyebrow={ended ? 'Locked' : 'Free trial'} title={title} subtitle={subtitle} width="wide">
      {lock?.course ? <BuyCourse course={lock.course} /> : null}
      <Plans />
      {lock ? <Button label="Back to home" variant="secondary" icon="home" onPress={() => router.replace('/')} /> : null}
    </Screen>
  );
}

/** A small lock mark for a card that won't open, or a Free mark for one that always does. */
export function LockMark({ locked, free }: { locked: boolean; free: boolean }) {
  const { styles, theme } = useStyles(makeStyles);
  if (free) {
    return (
      <View style={[styles.mark, styles.markFree]} accessibilityLabel="Free">
        <Text style={[styles.markText, { color: theme.success }]}>Free</Text>
      </View>
    );
  }
  if (!locked) return null;
  return (
    <View style={styles.mark} accessibilityLabel="Locked">
      <Icon name="lock" size={11} color={theme.text} />
      <Text style={styles.markText}>Locked</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    plans: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
    plan: {
      flexGrow: 1,
      flexBasis: 240,
      gap: Spacing.two,
      padding: Spacing.four,
      borderRadius: Radius.lg,
      borderWidth: 2,
      borderColor: t.border,
      backgroundColor: t.backgroundElement,
    },
    planOn: { borderColor: t.accent, backgroundColor: t.accentSoft },
    planHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, flexWrap: 'wrap' },
    planName: { ...Type.heading, color: t.text },
    price: { ...Type.title, color: t.text },
    per: { ...Type.small, color: t.textMuted },
    blurb: { ...Type.small, color: t.textSecondary },
    mark: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: Radius.pill,
      backgroundColor: 'rgba(255,255,255,0.92)',
    },
    markFree: { backgroundColor: t.successSoft },
    markText: { fontSize: 11, fontWeight: '700', color: t.text },
  });
}
