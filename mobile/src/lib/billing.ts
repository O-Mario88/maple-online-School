/**
 * Learner billing rules: study-pass prices per billing cycle, tutoring-credit packs and
 * auto top-up, mobile money numbers (MTN and Airtel Uganda) and receipt text.
 */
import { formatMoney } from '@/lib/finance/fees';

export type Cycle = 'monthly' | 'term' | 'annual';

/** Months and discount (%) for each billing cycle. */
export const CYCLES: Readonly<Record<Cycle, { months: number; saving: number; label: string; unit: string }>> = {
  monthly: { months: 1, saving: 0, label: 'Monthly', unit: 'per month' },
  term: { months: 3, saving: 10, label: 'Term (3 Months)', unit: 'per term' },
  annual: { months: 12, saving: 20, label: 'Annual', unit: 'per year' },
};

/** One credit buys this many minutes of 1-to-1 tutoring. */
export const CREDIT_MINUTES = 15;

export function planPrice(monthly: number, cycle: Cycle): { total: number; months: number; perMonth: number; saving: number } {
  const c = CYCLES[cycle];
  const total = Math.round(monthly * c.months * (1 - c.saving / 100));
  return { total, months: c.months, perMonth: Math.round(total / c.months), saving: c.saving };
}

type Pack = { credits: number; price: number };

/** How much cheaper (%) a pack is per credit than the base pack. */
export function packSaving(pack: Pack, base: Pack): number {
  const unit = base.price / base.credits;
  return Math.round((1 - pack.price / (pack.credits * unit)) * 100);
}

export function needsTopUp(balance: number, auto: { on: boolean; below: number }): boolean {
  return auto.on && balance < auto.below;
}

export type Network = 'mtn' | 'airtel';
const PREFIXES: Readonly<Record<Network, readonly string[]>> = { mtn: ['76', '77', '78', '79'], airtel: ['70', '74', '75'] };

/** A Ugandan mobile money number on the given network, as "+256 772 123 456", or null. */
export function validMobileMoney(raw: string, network: Network): string | null {
  const digits = raw.replace(/\D/g, '');
  const national = digits.startsWith('256') && digits.length === 12 ? digits.slice(3) : digits.startsWith('0') && digits.length === 10 ? digits.slice(1) : null;
  if (!national || !PREFIXES[network].includes(national.slice(0, 2))) return null;
  return `+256 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

export interface Purchase {
  id: string;
  title: string;
  amount: number;
  date: string;
  method: string;
}

/** A plain-text receipt the learner can download or share. */
export function receiptText(p: Purchase, name: string): string {
  return [
    'Maple Global Online School',
    `Receipt ${p.id.toUpperCase()}`,
    `Billed to ${name}`,
    '',
    p.title,
    `Amount: ${formatMoney(p.amount, 'UGX')}`,
    `Paid with ${p.method} on ${p.date}`,
    'Status: Paid',
  ].join('\n');
}
