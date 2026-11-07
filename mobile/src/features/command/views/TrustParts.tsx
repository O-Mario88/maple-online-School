import { useState } from 'react';

import type { ReasonAsk } from '@/features/command/kit/ReasonModal';
import { type Action, type Application, type AppStatus, blockers, decide, type Risk } from '@/features/command/logic/trust';
import { Pill } from '@/features/portal/PortalParts';
import type { Tone } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';

const STATUS: Readonly<Record<AppStatus, { label: string; tone: Tone }>> = {
  ready: { label: 'Ready', tone: 'green' },
  review: { label: 'In Review', tone: 'orange' },
  flagged: { label: 'Flagged', tone: 'red' },
  info: { label: 'Info Requested', tone: 'blue' },
  escalated: { label: 'Under Investigation', tone: 'red' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
  blocked: { label: 'Blocked', tone: 'red' },
};

/** Hub wording for the same statuses (Pending, Needs Review, …). */
const HUB_STATUS: Partial<Record<AppStatus, string>> = { ready: 'Pending', review: 'Needs Review' };

export function StatusPill({ status, hub = false, size = 12 }: { status: AppStatus; hub?: boolean; size?: number }) {
  const s = STATUS[status];
  return <Pill label={(hub && HUB_STATUS[status]) || s.label} tone={s.tone} size={size} icon={status === 'blocked' ? 'close' : undefined} />;
}

const RISK: Readonly<Record<Risk, { tone: Tone; icon: IconName }>> = {
  Low: { tone: 'green', icon: 'check' },
  Medium: { tone: 'orange', icon: 'alert' },
  High: { tone: 'red', icon: 'alert' },
};

export function RiskPill({ risk, size = 12, suffix = '' }: { risk: Risk; size?: number; suffix?: string }) {
  return <Pill label={`${risk}${suffix}`} tone={RISK[risk].tone} icon={RISK[risk].icon} size={size} />;
}

export function SafeguardPill({ state, size = 12 }: { state: Application['safeguarding']; size?: number }) {
  return state === 'clear' ? <Pill label="Clear" tone="green" icon="shield" size={size} /> : <Pill label="Minor Alert" tone="orange" icon="alert" size={size} />;
}

const DONE: Readonly<Record<Action, string>> = {
  approve: 'approved and activated. The teacher gets their welcome email.',
  reject: 'rejected. The applicant sees your reason and can appeal.',
  block: 'blocked. Their account cannot reapply without an appeal.',
  requestInfo: 'asked for more information. The application waits in review.',
  escalate: 'escalated to the Safeguarding Team, who are notified now.',
};

/**
 * Review state for a list of applications: the list, the decision dialog and the actions.
 * Decisions that need a reason (reject, block, an override) open the dialog first.
 */
export function useReview<T extends Application>(initial: readonly T[], by: string) {
  const [apps, setApps] = useState<readonly T[]>(initial);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const apply = (id: string, action: Action, note?: string) => {
    const a = apps.find((x) => x.id === id);
    if (!a) return;
    const r = decide(a, { action, by, note });
    if (r.error) return toast(r.error);
    setApps((prev) => prev.map((x) => (x.id === id ? r.app : x)));
    toast(`${a.name} ${DONE[action]}`);
  };
  const act = (a: T, action: Action) => {
    if (action === 'reject' || action === 'block') {
      return setAsk({
        title: action === 'block' ? `Block ${a.name}?` : `Reject ${a.name}?`,
        body: action === 'block' ? 'Blocking stops this person applying again. Use it for fraud or safeguarding concerns.' : 'The applicant sees this reason and can correct and resubmit or appeal.',
        confirm: action === 'block' ? 'Block Application' : 'Reject',
        tone: 'red',
        onConfirm: (note) => apply(a.id, action, note),
      });
    }
    if (action === 'approve' && blockers(a).length) {
      return setAsk({
        title: `Override and approve ${a.name}?`,
        body: `Still open: ${blockers(a).join(', ')}. Approve only if you checked these yourself; a second admin is notified of every override.`,
        confirm: 'Override & Approve',
        tone: 'orange',
        onConfirm: (note) => apply(a.id, action, note),
      });
    }
    if (action === 'requestInfo') {
      return setAsk({
        title: `Ask ${a.name} for more information`,
        body: 'Say what is missing. The applicant gets an email and the application stays in review.',
        confirm: 'Send Request',
        tone: 'blue',
        placeholder: 'e.g. Please upload a clearer copy of your teaching licence',
        onConfirm: (note) => apply(a.id, action, note),
      });
    }
    apply(a.id, action);
  };
  return { apps, setApps, ask, setAsk, act };
}
