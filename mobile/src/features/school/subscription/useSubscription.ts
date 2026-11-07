import { useState } from 'react';

import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';
import type { MockData } from '@/mock';

import { capacityAlert, changePreview, contractPrice, type PlanId, type PlanVersion, usagePct } from './plans';

export type Admin = MockData['schoolAdmin'];
export const TABS = ['Overview', 'Plans & Upgrades', 'Learner Capacity', 'Usage & Allowances', 'Invoices & Payments', 'Billing Settings'] as const;
export type Tab = (typeof TABS)[number];
export const TAB_ICONS: readonly IconName[] = ['clock', 'layers', 'people', 'pulse', 'receipt', 'settings'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Dec 10, 2026" from YYYY-MM-DD. */
export const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
export const ugx = (n: number) => `UGX ${n.toLocaleString('en-US')}`;

/** The school's subscription page: its plan, capacity, usage, the plan-change preview and billing settings. */
export function useSubscription(a: Admin) {
  const sub = a.subscription;
  const versions = a.planVersions;
  const [tab, setTab] = useState<Tab>('Overview');
  const [planId, setPlanId] = useState<PlanId>(sub.contract.planId);
  const [pending, setPending] = useState<{ planId: PlanId; at: string } | null>(null);
  const [target, setTarget] = useState<PlanId | null>(null);
  const [billing, setBilling] = useState(sub.billing);
  const byId = (id: PlanId): PlanVersion => versions.find((v) => v.planId === id && v.version === sub.contract.version) ?? versions[0];
  const current = byId(planId);
  const learners = sub.learners.licensed;
  const term = { start: sub.term.start, end: sub.term.end, today: todayISO() };
  const usage = [
    { key: 'live', label: 'Live Classes', icon: 'screen' as IconName, used: sub.usage.liveSessions, allowance: current.allowances.liveSessions, unit: 'sessions' },
    { key: 'storage', label: 'Storage (Videos & Files)', icon: 'database' as IconName, used: sub.usage.storageGB, allowance: current.allowances.storageGB, unit: 'GB' },
    { key: 'stream', label: 'Video Streaming', icon: 'play' as IconName, used: sub.usage.streamingGB, allowance: current.allowances.streamingGB, unit: 'GB' },
  ].map((u) => ({ ...u, pct: usagePct(u.used, u.allowance) }));
  const sorted = [...versions].filter((v) => v.version === sub.contract.version).sort((x, y) => x.priceUGX - y.priceUGX);
  const next = sorted.find((v) => v.priceUGX > current.priceUGX);
  const targetPlan = target ? byId(target) : null;

  return {
    sub,
    versions: sorted,
    tab,
    setTab,
    current,
    priceUGX: contractPrice({ planId, version: sub.contract.version }, versions),
    learners,
    learnerPct: usagePct(learners, current.learners),
    alert: capacityAlert(learners, current.learners),
    usage,
    pending,
    billing,
    setBilling: (patch: Partial<typeof billing>) => setBilling((b) => ({ ...b, ...patch })),
    saveBilling: () => toast('Billing settings saved.'),
    /** Opens the change preview for a plan. */
    preview: (id: PlanId) => setTarget(id),
    /** Upgrade Plan: the next plan up, or the plan list when already on the top plan. */
    upgrade: () => (next ? setTarget(next.planId) : setTab('Plans & Upgrades')),
    target: targetPlan,
    change: targetPlan ? changePreview(current, targetPlan, term, { learners, storageGB: sub.usage.storageGB }) : null,
    closeChange: () => setTarget(null),
    confirmChange: () => {
      if (!targetPlan) return;
      const p = changePreview(current, targetPlan, term, { learners, storageGB: sub.usage.storageGB });
      if (p.kind === 'upgrade') {
        setPlanId(targetPlan.planId);
        setPending(null);
        toast(`Upgraded to ${targetPlan.name}. ${ugx(p.chargeNowUGX)} for the rest of this term goes on your next invoice.`);
      } else {
        setPending({ planId: targetPlan.planId, at: sub.renewal });
        toast(`${targetPlan.name} starts at renewal on ${longDate(sub.renewal)}. Nothing changes before then.`);
      }
      setTarget(null);
    },
    download: (id: string) => toast(`${id} downloaded.`),
    payUpcoming: () => toast(`Pay ${ugx(sub.upcoming.amountUGX)} by bank transfer or Mobile Money; the reference is on the invoice.`),
    addSeats: () => toast('Extra seats are priced in your contract with Maple. A quote request has been sent to your account manager.'),
  };
}

export type SubState = ReturnType<typeof useSubscription>;
