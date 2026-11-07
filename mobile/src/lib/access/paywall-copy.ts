/** The badge, title and subtitle at the top of the plans page, for each state the person is in. */
import type { Tier } from './trial';

export type PaywallState =
  | { kind: 'ended' }
  | { kind: 'trial'; daysLeft: number; ends: string }
  | { kind: 'paid'; plan: string }
  | { kind: 'upgrade'; plan: string; tier: Tier };

export interface PaywallCopy {
  pill: string;
  tone: 'red' | 'blue' | 'green';
  title: string;
  subtitle: string;
  /** A shorter subtitle for phones, when the design gives one. */
  phone?: string;
}

export function paywallCopy(state: PaywallState): PaywallCopy {
  switch (state.kind) {
    case 'ended':
      return {
        pill: 'Access Paused',
        tone: 'red',
        title: 'Your free month has ended',
        subtitle: 'You can still see your progress, the catalogue and free resources. Choose a plan to unlock full access and keep learning without limits.',
        phone: 'You can still see your progress, the catalogue and free resources. Choose a plan to open everything again.',
      };
    case 'trial': {
      const days = `${state.daysLeft} ${state.daysLeft === 1 ? 'day' : 'days'}`;
      return {
        pill: 'Free Trial',
        tone: 'blue',
        title: `${days} left of your free month`,
        subtitle: `Everything is open until ${state.ends}, marketplace included. Choose a plan to keep learning after that.`,
      };
    }
    case 'paid':
      return { pill: 'Your Plan', tone: 'green', title: `You’re on ${state.plan}`, subtitle: 'Everything in your plan is open, with no ads. You can move to another plan here at any time.' };
    case 'upgrade':
      return {
        pill: 'Upgrade',
        tone: 'blue',
        title: `Upgrade to ${state.plan}`,
        subtitle:
          state.tier === 'premium'
            ? 'A private tutor, question interpretation videos, projects and study squads come with Premium. Everything you have now stays open.'
            : 'Live classes and step-by-step past paper solutions come with Pro and above. Everything you have now stays open.',
      };
  }
}
