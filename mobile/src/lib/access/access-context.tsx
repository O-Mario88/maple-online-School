import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { mockData } from '@/lib/mock';
import { usePortal } from '@/lib/portal-context';
import type { PayPlan } from '@/mock/access';

import { type Payer, payerFor, resourceFor } from './areas';
import { type Access, accessOn, dayLabel, type LockReason, lockReason, localToday, type Resource, samplePlan, trialEnd, trialOverride } from './trial';

/** A locked page: why, and the course it would open (for a marketplace course). */
export interface Lock {
  reason: LockReason;
  course?: { id: string; title: string; priceUGX: number };
}

interface AccessValue {
  payer: Payer | null;
  /** Null when nothing is gated: a mode with no plan, or a build without the sample plans (until the API serves them). */
  access: Access | null;
  plans: readonly PayPlan[];
  payWith: string;
  /** Pay for a plan: everything Maple's opens again for a month. */
  pay: (planId: string) => string;
  /** Buy a marketplace course: it opens and stays open. */
  buy: (courseId: string) => void;
  /** Why this page won't open, or null. */
  lockFor: (path: string, courseId?: string) => Lock | null;
}

const AccessContext = createContext<AccessValue | null>(null);

const initialSearch = () => (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.search : '');

/** The free month and plan of whoever is signed in, for the mode in use. */
export function AccessProvider({ children }: { children: ReactNode }) {
  const { portal } = usePortal();
  const mock = useMemo(() => mockData(), []);
  const [preview] = useState(() => trialOverride(initialSearch()));
  const [paidUntil, setPaidUntil] = useState<Partial<Record<Payer, string>>>({});
  const [owned, setOwned] = useState<ReadonlySet<string>>(() => new Set());
  const today = localToday();
  const payer = payerFor(portal);
  const sample = mock?.shared.access;

  const access = useMemo(() => {
    if (!payer || !sample) return null;
    const plan = samplePlan(sample.trialDaysUsed[payer], today, preview);
    const paid = paidUntil[payer];
    return accessOn(paid ? { ...plan, paidUntil: paid } : plan, today);
  }, [payer, sample, today, preview, paidUntil]);

  const pay = useCallback(
    (planId: string) => {
      if (!payer) return '';
      const until = trialEnd(today);
      setPaidUntil((p) => ({ ...p, [payer]: until }));
      return `${sample?.plans[payer].find((x) => x.id === planId)?.name ?? 'Your plan'} is paid until ${dayLabel(until)}.`;
    },
    [payer, today, sample],
  );
  const buy = useCallback((courseId: string) => setOwned((o) => new Set([...o, courseId])), []);

  const lockFor = useCallback(
    (path: string, courseId?: string): Lock | null => {
      if (!access) return null;
      const item = courseId ? mock?.learner.explore.catalogue.find((c) => c.id === courseId) : undefined;
      const course: Resource | undefined = item
        ? { source: item.teacher.startsWith('Maple') ? 'maple' : 'marketplace', free: item.priceUGX === 0, owned: owned.has(item.id) }
        : undefined;
      const page = resourceFor(path, portal, course);
      // A library book anyone may read stays open.
      const book = path.startsWith('/learn/library/') ? path.slice('/learn/library/'.length) : '';
      const resource = page && book && sample?.freeBooks.includes(book) ? { ...page, free: true } : page;
      const reason = resource ? lockReason(resource, access) : null;
      if (!reason) return null;
      return { reason, course: item ? { id: item.id, title: item.title, priceUGX: item.priceUGX } : undefined };
    },
    [access, mock, owned, portal, sample],
  );

  const value = useMemo<AccessValue>(
    () => ({ payer, access, plans: payer && sample ? sample.plans[payer] : [], payWith: sample?.payWith ?? '', pay, buy, lockFor }),
    [payer, access, sample, pay, buy, lockFor],
  );
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessValue {
  const value = useContext(AccessContext);
  if (!value) throw new Error('useAccess needs an AccessProvider above it.');
  return value;
}
