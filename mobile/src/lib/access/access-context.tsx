import { useGlobalSearchParams } from 'expo-router';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { useAuth } from '@/lib/auth/auth-context';
import { mockData } from '@/lib/mock';
import { usePortal } from '@/lib/portal-context';
import type { PayPlan } from '@/mock/access';

import { type Payer, payerFor, resourceFor } from './areas';
import { freeAllows, type FreeUse, monthOf, noFreeUse, recordFree } from './free';
import { guestLock } from './guest';
import { type Access, accessOn, dayLabel, type Feature, featureOpen, type LockReason, lockReason, localToday, planOverride, type Resource, samplePlan, type Tier, trialEnd, trialOverride } from './trial';

/** A locked page, why, and the plan that would open it when it needs a higher one. */
export interface Lock {
  reason: LockReason;
  needs?: Tier;
}

interface AccessValue {
  /** Browsing free without an account. */
  guest: boolean;
  payer: Payer | null;
  /** Null when nothing is gated: a mode with no plan, or a build without the sample plans (until the API serves them). */
  access: Access | null;
  plans: readonly PayPlan[];
  payWith: string;
  /** Pay for a plan: everything Maple's opens again for a month. */
  pay: (planId: string) => string;
  /** Why this page won't open, or null. */
  lockFor: (path: string, courseId?: string) => Lock | null;
  /** Whether the free plan opens this page this month (every library book; 5 lessons, 1 live class and 10 past papers a month). */
  freeFor: (path: string, id?: string) => boolean;
  /** Whether this page opens only because of the free allowance, so opening it uses some up. */
  usesFree: (path: string, id?: string) => boolean;
  /** Count an opened page against this month's free allowance. */
  recordFreeOpen: (path: string, id?: string) => void;
  /** What has been opened on the free plan this month. */
  freeUse: FreeUse;
  /** Whether a feature inside a page is open on this person's plan (step-by-step solutions, video explainers, the private tutor). */
  hasFeature: (feature: Feature) => boolean;
  /** Whether Pricing has been shown this visit since the free month ended (it is shown once by itself). */
  pricingSeen: boolean;
  markPricingSeen: () => void;
}

const AccessContext = createContext<AccessValue | null>(null);

/** The free month and plan of whoever is signed in, for the mode in use. */
export function AccessProvider({ children }: { children: ReactNode }) {
  const { portal } = usePortal();
  const { guest, joinedFromGuest } = useAuth();
  const mock = useMemo(() => mockData(), []);
  // A link (a web address, or a phone's deep link) may ask to preview a trial state; it holds until another asks otherwise.
  // ?plan=basic|pro|premium previews that plan, paid.
  const { trial, plan: planParam } = useGlobalSearchParams<{ trial?: string; plan?: string }>();
  const askedTier = planOverride(typeof planParam === 'string' ? `plan=${planParam}` : '');
  const asked = askedTier ? 'paid' : trialOverride(typeof trial === 'string' ? `trial=${trial}` : '');
  const [preview, setPreview] = useState(asked);
  const [previewTier, setPreviewTier] = useState(askedTier);
  if (asked && asked !== preview) setPreview(asked);
  if (askedTier && askedTier !== previewTier) setPreviewTier(askedTier);
  const [paid, setPaid] = useState<Partial<Record<Payer, { until: string; tier?: Tier }>>>({});
  const [pricingSeen, setPricingSeen] = useState(false);
  const markPricingSeen = useCallback(() => setPricingSeen(true), []);
  const today = localToday();
  const payer = guest ? null : payerFor(portal);
  const sample = mock?.shared.access;

  const access = useMemo(() => {
    if (!payer || !sample) return null;
    // Signing up after browsing free starts the free month today.
    const plan = samplePlan(sample.trialDaysUsed[payer], today, preview ?? (joinedFromGuest ? 'active' : null), previewTier ?? 'pro');
    const bought = paid[payer];
    return accessOn(bought ? { ...plan, paidUntil: bought.until, tier: bought.tier } : plan, today);
  }, [payer, sample, today, preview, previewTier, paid, joinedFromGuest]);

  const pay = useCallback(
    (planId: string) => {
      if (!payer) return '';
      const until = trialEnd(today);
      const chosen = sample?.plans[payer].find((x) => x.id === planId);
      setPaid((p) => ({ ...p, [payer]: { until, tier: chosen?.tier } }));
      return `${chosen?.name ?? 'Your plan'} is paid until ${dayLabel(until)}.`;
    },
    [payer, today, sample],
  );

  // The free allowance is counted per month; the sample starts each visit with none used.
  const month = monthOf(today);
  const [freeUse, setFreeUse] = useState<FreeUse>(() => noFreeUse(month));
  const freeFor = useCallback((path: string, id?: string) => !!mock && freeAllows(path, id, freeUse, month), [mock, freeUse, month]);
  const recordFreeOpen = useCallback((path: string, id?: string) => setFreeUse((u) => recordFree(path, id, u, month)), [month]);
  // Visitors browsing free are on the free tier: no plan features.
  const hasFeature = useCallback((f: Feature) => !guest && featureOpen(f, access), [guest, access]);

  const lockFor = useCallback(
    (path: string, courseId?: string): Lock | null => {
      if (!access && !guest) return null;
      const item = courseId ? mock?.learner.explore.catalogue.find((c) => c.id === courseId) : undefined;
      const course: Resource | undefined = item ? { source: item.teacher.startsWith('Maple') ? 'maple' : 'marketplace' } : undefined;
      const page = resourceFor(path, guest ? 'learner' : portal, course);
      // The free plan's allowance opens what the plan alone would not.
      const free = freeFor(path, courseId);
      const resource = page && free ? { ...page, free: true } : page;
      const reason = guest ? guestLock(path, resource) : resource && access ? lockReason(resource, access) : null;
      return reason ? { reason, needs: reason === 'upgrade' ? resource?.needs : undefined } : null;
    },
    [access, guest, mock, portal, freeFor],
  );

  const usesFree = useCallback(
    (path: string, id?: string) => {
      if ((!access && !guest) || !freeFor(path, id)) return false;
      const page = resourceFor(path, guest ? 'learner' : portal);
      if (!page) return false;
      return (guest ? guestLock(path, page) : access ? lockReason(page, access) : null) !== null;
    },
    [access, guest, portal, freeFor],
  );

  const value = useMemo<AccessValue>(
    () => ({ guest, payer, access, plans: payer && sample ? sample.plans[payer] : [], payWith: sample?.payWith ?? '', pay, lockFor, freeFor, usesFree, recordFreeOpen, freeUse, hasFeature, pricingSeen, markPricingSeen }),
    [guest, payer, access, sample, pay, lockFor, freeFor, usesFree, recordFreeOpen, freeUse, hasFeature, pricingSeen, markPricingSeen],
  );
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessValue {
  const value = useContext(AccessContext);
  if (!value) throw new Error('useAccess needs an AccessProvider above it.');
  return value;
}

/** Access where there may be no provider (public pages outside the app): null there. */
export function useOptionalAccess(): AccessValue | null {
  return useContext(AccessContext);
}
