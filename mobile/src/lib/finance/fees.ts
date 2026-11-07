import type { components } from '@/lib/api/schema';

export type Invoice = components['schemas']['Invoice'];
export type Payment = components['schemas']['Payment'];
export type FeeItem = components['schemas']['FeeItem'];
export type FinanceSummary = components['schemas']['FinanceSummary'];

/** School roles that run fees. Matches the Go API's roles.Finance. */
const FINANCE_ROLES = new Set(['headteacher', 'deputy', 'registrar']);

/** "UGX 650,000". Amounts are whole minor units (for UGX, shillings). */
export function formatMoney(minor: number, currency: string): string {
  return `${currency} ${Math.round(minor).toLocaleString('en-US')}`;
}

const COMPACT_STEPS: readonly (readonly [number, string])[] = [
  [1_000_000_000, 'B'],
  [1_000_000, 'M'],
  [1_000, 'K'],
];

/** A short amount for small tiles ("UGX 7.1B", "UGX 420K"); amounts under 10,000 stay exact. */
export function formatMoneyCompact(minor: number, currency: string): string {
  const amount = Math.round(minor);
  if (Math.abs(amount) < 10_000) return formatMoney(amount, currency);
  const [size, suffix] = COMPACT_STEPS.find(([step]) => Math.abs(amount) >= step) ?? COMPACT_STEPS[2];
  const value = Number((amount / size).toPrecision(3));
  return `${currency} ${value}${suffix}`;
}

interface MembershipLike {
  institution_id: number;
  institution_name: string;
  role: string;
  status: string;
}

export interface SchoolChoice {
  id: number;
  name: string;
}

/** Schools where the person runs fees (active headteacher, deputy or registrar). */
export function financeSchools(memberships: readonly MembershipLike[]): SchoolChoice[] {
  const seen = new Set<number>();
  const out: SchoolChoice[] = [];
  for (const m of memberships) {
    if (m.status === 'active' && FINANCE_ROLES.has(m.role) && !seen.has(m.institution_id)) {
      seen.add(m.institution_id);
      out.push({ id: m.institution_id, name: m.institution_name });
    }
  }
  return out;
}

/** A fresh key for one payment attempt, so a retry can't charge twice. */
export function newIdempotencyKey(): string {
  const random = Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
  return `app-${Date.now().toString(36)}-${random}`;
}

const STATUS: Readonly<Record<Invoice['status'], string>> = {
  issued: 'Unpaid',
  partially_paid: 'Part paid',
  paid: 'Paid',
  void: 'Cancelled',
};

export function invoiceStatusLabel(status: Invoice['status']): string {
  return STATUS[status];
}
