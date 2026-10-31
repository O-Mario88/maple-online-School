/** The numbers and words on each portal's home page. */

export function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Share of billed fees collected, from 0 to 1. */
export function collectionRate(summary: { billed_minor: number; collected_minor: number }): number {
  if (summary.billed_minor <= 0) return 0;
  return Math.min(1, summary.collected_minor / summary.billed_minor);
}

interface InvoiceLike {
  total_minor: number;
  paid_minor: number;
  status: string;
  currency: string;
}

export interface Balance {
  currency: string;
  minor: number;
}

/** What a family still owes, per currency. Void and settled invoices count for nothing. */
export function familyBalance(invoices: readonly InvoiceLike[]): Balance[] {
  const owed = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.status === 'void') continue;
    const due = Math.max(0, inv.total_minor - inv.paid_minor);
    owed.set(inv.currency, (owed.get(inv.currency) ?? 0) + due);
  }
  return [...owed].filter(([, minor]) => minor > 0).map(([currency, minor]) => ({ currency, minor }));
}

/** An API word as a label: "subject_teacher" -> "Subject teacher". */
export function humanize(value: string): string {
  const words = value.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
