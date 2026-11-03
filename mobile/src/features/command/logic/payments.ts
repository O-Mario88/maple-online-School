/**
 * Rules behind Maple Command › Finance › Payment Transactions and Settlement Reconciliation: one
 * record of payment events across providers, refunds and manual payments, and matching each
 * provider's settlement batch (gross less fees and refunds) to what actually reached the bank.
 */

export type TxnStatus = 'Successful' | 'Pending' | 'Failed' | 'Refunded' | 'Chargeback';

export interface Txn {
  id: string;
  at: string;
  customer: string;
  type: string;
  provider: string;
  amount: number;
  status: TxnStatus;
  /** Amount refunded so far. */
  refunded: number;
  manual?: boolean;
  reason?: string;
}

const pct = (n: number, of: number) => (of ? Math.round((n / of) * 1000) / 10 : 0);

/** Value of every payment that did not fail, and the count in each status. */
export function txnSummary(list: readonly Txn[]) {
  const is = (s: TxnStatus) => list.filter((t) => t.status === s);
  const successful = is('Successful').length;
  return {
    value: list.filter((t) => t.status !== 'Failed').reduce((s, t) => s + t.amount, 0),
    count: list.length,
    successful,
    successRate: pct(successful, list.length),
    pending: is('Pending').length,
    failed: is('Failed').length,
    refunded: is('Refunded').length,
    refundedValue: list.reduce((s, t) => s + t.refunded, 0),
    chargebacks: is('Chargeback').length,
    chargebackValue: is('Chargeback').reduce((s, t) => s + t.amount, 0),
  };
}

/** Successful value by provider, largest first, with each one's whole-number share. */
export function providerShare(list: readonly Txn[]): readonly { provider: string; value: number; pct: number }[] {
  const ok = list.filter((t) => t.status === 'Successful');
  const total = ok.reduce((s, t) => s + t.amount, 0);
  const names = Array.from(new Set(ok.map((t) => t.provider)));
  return names
    .map((provider) => {
      const value = ok.filter((t) => t.provider === provider).reduce((s, t) => s + t.amount, 0);
      return { provider, value, pct: total ? Math.round((value / total) * 100) : 0 };
    })
    .sort((a, b) => b.value - a.value);
}

/** Refunds part or all of a successful payment; the full amount marks it Refunded. */
export function refund<T extends Txn>(t: T, amount: number, reason: string): { txn: T; error?: string } {
  if (t.status !== 'Successful') return { txn: t, error: 'Only successful payments can be refunded.' };
  if (!reason.trim()) return { txn: t, error: 'Give a reason for the refund.' };
  const left = t.amount - t.refunded;
  if (!(amount > 0)) return { txn: t, error: 'Enter a refund amount above zero.' };
  if (amount > left) return { txn: t, error: `That is more than the ${left.toLocaleString('en-US')} left to refund.` };
  const refunded = t.refunded + amount;
  return { txn: { ...t, refunded, status: refunded >= t.amount ? 'Refunded' : 'Successful', reason: reason.trim() } };
}

/** Records a payment received outside the gateways (bank, cash); its reference must be new. */
export function recordManual<T extends Txn>(list: readonly T[], p: { reference: string; amount: number; customer: string; provider: string; at: string }): { list: readonly T[]; error?: string } {
  const ref = p.reference.trim();
  if (!ref) return { list, error: 'Enter the payment reference.' };
  if (list.some((t) => t.id === ref)) return { list, error: `Reference ${ref} is already recorded.` };
  if (!(p.amount > 0)) return { list, error: 'Enter an amount above zero.' };
  if (!p.customer.trim()) return { list, error: 'Who paid?' };
  const row = { id: ref, at: p.at, customer: p.customer.trim(), type: 'Manual Payment', provider: p.provider, amount: p.amount, status: 'Successful', refunded: 0, manual: true } as T;
  return { list: [row, ...list] };
}

export interface Batch {
  id: string;
  provider: string;
  gross: number;
  fees: number;
  refunds: number;
  /** What reached the bank; null until the statement is matched. */
  deposit: number | null;
  resolved?: boolean;
  note?: string;
}

export type ReconStatus = 'Reconciled' | 'Difference' | 'Investigate' | 'Pending Match';

export function expected(b: Batch): number {
  return b.gross - b.fees - b.refunds;
}

export function variance(b: Batch): number {
  return b.deposit === null ? 0 : b.deposit - expected(b);
}

/** Differences up to 2% of the expected settlement are explained routinely; larger ones are investigated. */
const DIFFERENCE_LIMIT = 0.02;

export function reconStatus(b: Batch): ReconStatus {
  if (b.deposit === null) return 'Pending Match';
  const v = variance(b);
  if (v === 0 || b.resolved) return 'Reconciled';
  return Math.abs(v) <= expected(b) * DIFFERENCE_LIMIT ? 'Difference' : 'Investigate';
}

export function matchDeposit<T extends Batch>(b: T, deposit: number): T {
  return { ...b, deposit };
}

/** Explains a difference and books it: a shortfall is a provider deduction, an excess is held for review. */
export function resolveDifference<T extends Batch>(b: T, note: string): { batch: T; entry?: readonly { account: string; debit: number; credit: number }[]; error?: string } {
  if (!note.trim()) return { batch: b, error: 'Explain the difference before resolving it.' };
  const v = variance(b);
  if (!v) return { batch: b, error: `${b.id} has no difference to resolve.` };
  const amount = Math.abs(v);
  const entry = v < 0 ? [
    { account: '6150 Payment Provider Fees', debit: amount, credit: 0 },
    { account: '1150 Provider Clearing', debit: 0, credit: amount },
  ] : [
    { account: '1150 Provider Clearing', debit: amount, credit: 0 },
    { account: '2190 Unidentified Receipts', debit: 0, credit: amount },
  ];
  return { batch: { ...b, resolved: true, note: note.trim() }, entry };
}

/** The part of a batch that is matched: the deposit up to what was expected, or all of it once a difference is resolved. */
export function reconciledValue(b: Batch): number {
  if (b.deposit === null) return 0;
  return b.resolved ? expected(b) : Math.min(b.deposit, expected(b));
}

/** What is still open: the whole batch until it is matched, then any unresolved variance. */
export function unreconciledValue(b: Batch): number {
  if (b.deposit === null) return expected(b);
  return b.resolved ? 0 : Math.abs(variance(b));
}

export function reconSummary(list: readonly Batch[]) {
  const exp = list.reduce((s, b) => s + expected(b), 0);
  const reconciled = list.reduce((s, b) => s + reconciledValue(b), 0);
  return {
    expected: exp,
    deposits: list.reduce((s, b) => s + (b.deposit ?? 0), 0),
    reconciled,
    unreconciled: list.reduce((s, b) => s + unreconciledValue(b), 0),
    exceptions: list.filter((b) => reconStatus(b) !== 'Reconciled').length,
    rate: pct(reconciled, exp),
  };
}
