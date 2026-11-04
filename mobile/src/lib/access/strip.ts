/** What the free-month strip says: the full sentence on wide screens, a short line that fits beside the button on phones. */
export type StripState = { kind: 'guest' } | { kind: 'trial'; daysLeft: number; ends: string } | { kind: 'ended' };

export function stripMessage(state: StripState, phone: boolean): { text: string; action: string } {
  if (state.kind === 'guest') {
    return { text: phone ? 'Browsing free resources.' : 'You’re browsing free resources. Sign up free and everything opens for a month.', action: 'Sign up free' };
  }
  if (state.kind === 'ended') {
    return { text: phone ? 'Your free month has ended.' : 'Your free month has ended. Free plan: 5 lessons, 1 live class and 10 past papers a month, every library book, with ads.', action: 'Pay to continue' };
  }
  const days = `${state.daysLeft} ${state.daysLeft === 1 ? 'day' : 'days'} left`;
  return { text: phone ? `Free trial: ${days}.` : `Free trial: ${days}. Everything is open until ${state.ends}.`, action: 'Choose a plan' };
}
