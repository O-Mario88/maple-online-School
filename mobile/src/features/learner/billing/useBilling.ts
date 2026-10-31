import { useState } from 'react';

import { type Cycle, CYCLES, planPrice } from '@/lib/billing';
import type { MockData } from '@/mock';

export type Hub = MockData['learner']['billingHub'];
export type Plan = Hub['plans'][number];
export type Method = Hub['methods'][number];
export type PurchaseRow = Hub['purchases'][number];
export type PhoneTab = 'overview' | 'wallet' | 'history';

/** What is being paid for in the payment dialog. */
export type PayFor = { type: 'credits'; pack: number } | { type: 'plan'; plan: Plan['id']; cycle: Cycle };
export type Dialog = { kind: 'pay'; what: PayFor } | { kind: 'switch'; plan: Plan['id']; cycle: Cycle } | { kind: 'manage' } | { kind: 'compare' } | { kind: 'method' } | { kind: 'receipt'; id: string } | null;

const TOAST_MS = 2800;
/** A short pause so the payment feels like it is being confirmed with the provider. */
const PAY_MS = 1200;
const RANK: Record<Plan['id'], number> = { basic: 0, pro: 1, premium: 2 };

/** The Billing & Subscriptions page state. Payments are simulated: this is a design build on sample data. */
export function useBilling(hub: Hub) {
  const [cycleTab, setCycleTab] = useState<Cycle>('monthly');
  const [current, setCurrent] = useState(hub.current);
  const [pending, setPending] = useState<{ plan: Plan['id']; cycle: Cycle } | null>(null);
  const [balance, setBalance] = useState(hub.credits.balance);
  const [pack, setPack] = useState(1);
  const [auto, setAuto] = useState(hub.credits.auto.on);
  const [methods, setMethods] = useState<readonly Method[]>(hub.methods);
  const [purchases, setPurchases] = useState<readonly PurchaseRow[]>(hub.purchases);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [payWith, setPayWith] = useState(hub.methods.find((m) => m.primary)?.id ?? hub.methods[0].id);
  const [paying, setPaying] = useState(false);
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('overview');
  const [allPurchases, setAllPurchases] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const toast = (m: string) => {
    setToastText(m);
    setTimeout(() => setToastText((t) => (t === m ? null : t)), TOAST_MS);
  };
  const plan = (id: Plan['id']) => hub.plans.find((p) => p.id === id) ?? hub.plans[1];
  const method = (id: string) => methods.find((m) => m.id === id) ?? methods[0];
  const priceOf = (what: PayFor) => {
    if (what.type === 'credits') return { title: `${hub.credits.packs[what.pack].credits} Tutoring Credits`, amount: hub.credits.packs[what.pack].price, icon: hub.icons.credits };
    const p = plan(what.plan);
    return { title: `${p.name} (${CYCLES[what.cycle].label})`, amount: planPrice(p.monthly, what.cycle).total, icon: hub.icons.pass };
  };
  const record = (title: string, amount: number, icon: number) =>
    setPurchases((list) => [{ id: `r-${1043 + list.length - hub.purchases.length}`, title, amount, date: hub.today, method: method(payWith).label, icon }, ...list]);

  return {
    hub,
    cycleTab,
    setCycleTab,
    current,
    currentPlan: plan(current.plan),
    pending,
    plan,
    balance,
    pack,
    setPack,
    auto,
    toggleAuto: () => {
      setAuto(!auto);
      toast(auto ? 'Auto Top-Up is off' : `Auto Top-Up is on: we'll add ${hub.credits.auto.add} credits when you drop below ${hub.credits.auto.below}`);
    },
    methods,
    method,
    purchases: allPurchases ? purchases : purchases.slice(0, 5),
    allPurchases,
    toggleAllPurchases: () => setAllPurchases(!allPurchases),
    purchase: (id: string) => purchases.find((p) => p.id === id),
    dialog,
    close: () => {
      if (!paying) setDialog(null);
    },
    open: setDialog,
    /** Choosing a plan: an upgrade (or a longer cycle) is paid now; a downgrade waits for the renewal date. */
    choose: (id: Plan['id'], cycle: Cycle) => {
      if (id === current.plan && cycle === current.cycle) return;
      if (RANK[id] < RANK[current.plan]) setDialog({ kind: 'switch', plan: id, cycle });
      else setDialog({ kind: 'pay', what: { type: 'plan', plan: id, cycle } });
    },
    confirmSwitch: (id: Plan['id'], cycle: Cycle) => {
      setPending({ plan: id, cycle });
      setDialog(null);
      toast(`${plan(id).name} starts on ${current.renews}. No charge today.`);
    },
    priceOf,
    payWith,
    setPayWith,
    paying,
    pay: (what: PayFor) => {
      setPaying(true);
      setTimeout(() => {
        const p = priceOf(what);
        record(p.title, p.amount, p.icon);
        if (what.type === 'credits') setBalance((b) => b + hub.credits.packs[what.pack].credits);
        else {
          setCurrent((c) => ({ ...c, plan: what.plan, cycle: what.cycle, autoRenew: true }));
          setPending(null);
        }
        setPaying(false);
        setDialog(null);
        toast(`Paid ${p.title}. Your receipt is in Recent Purchases.`);
      }, PAY_MS);
    },
    toggleRenew: () => {
      setCurrent((c) => ({ ...c, autoRenew: !c.autoRenew }));
      toast(current.autoRenew ? `Your pass stays active until ${current.renews}, then stops.` : 'Auto-renew is back on.');
    },
    makePrimary: (id: string) => {
      setMethods((list) => list.map((m) => ({ ...m, primary: m.id === id })));
      setPayWith(id);
      toast(`${method(id).label} is now your primary method`);
    },
    removeMethod: (id: string) => {
      setMethods((list) => list.filter((m) => m.id !== id));
      if (payWith === id) setPayWith(methods.find((m) => m.primary && m.id !== id)?.id ?? methods[0].id);
      toast(`${method(id).label} removed`);
    },
    addMethod: (m: Method) => {
      setMethods((list) => [...list, m]);
      setDialog(null);
      toast(`${m.label} added`);
    },
    phoneTab,
    setPhoneTab,
    toast,
    toastText,
  };
}
export type BillingState = ReturnType<typeof useBilling>;
