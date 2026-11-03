/**
 * The school's books: the chart of accounts and double-entry journal entries. Posted entries are
 * locked; mistakes are fixed by reversing them, so the ledger keeps its history.
 */

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
export const ACCOUNT_TYPES: readonly AccountType[] = ['Income', 'Expense', 'Asset', 'Liability', 'Equity'];

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  sub: string;
  status: 'Active' | 'Inactive';
  parent?: string;
  description?: string;
}

export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
}

export type EntryStatus = 'Draft' | 'Posted' | 'Reversing';

export interface Entry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  description: string;
  lines: readonly JournalLine[];
  status: EntryStatus;
  createdBy: string;
  postedBy?: string;
  postedAt?: string;
  reverses?: string;
  reversedBy?: string;
  recurring?: boolean;
}

/** Code ranges per type: 1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx–6xxx expenses. */
const RANGES: readonly { type: AccountType; from: number; to: number }[] = [
  { type: 'Asset', from: 1000, to: 1999 },
  { type: 'Liability', from: 2000, to: 2999 },
  { type: 'Equity', from: 3000, to: 3999 },
  { type: 'Income', from: 4000, to: 4999 },
  { type: 'Expense', from: 5000, to: 6999 },
];

export function typeForCode(code: string): AccountType | null {
  const n = Number(code);
  return RANGES.find((r) => n >= r.from && n <= r.to)?.type ?? null;
}

export function codeRange(type: AccountType): string {
  const r = RANGES.find((x) => x.type === type);
  return r ? `${r.from}–${r.to}` : '';
}

/** Adds an account after checking its code, name and parent. */
export function addAccount(list: readonly Account[], input: Omit<Account, 'status'>): { list: readonly Account[]; error?: string } {
  if (!/^\d{4}$/.test(input.code)) return { list, error: 'Account codes are four digits.' };
  if (list.some((a) => a.code === input.code)) return { list, error: `Code ${input.code} is already used.` };
  if (typeForCode(input.code) !== input.type) return { list, error: `${input.type} accounts use codes ${codeRange(input.type)}.` };
  if (!input.name.trim()) return { list, error: 'Give the account a name.' };
  if (input.parent) {
    const parent = list.find((a) => a.code === input.parent);
    if (!parent || parent.type !== input.type) return { list, error: `The parent account must be an existing ${input.type.toLowerCase()} account.` };
  }
  return { list: [...list, { ...input, name: input.name.trim(), status: 'Active' }] };
}

/** Accounts that appear in any entry stay, so the ledger keeps its history; they can be made inactive. */
export function canDelete(code: string, entries: readonly Entry[]): { ok: boolean; reason?: string } {
  const used = entries.filter((e) => e.lines.some((l) => l.account === code)).length;
  return used ? { ok: false, reason: `${code} is used in ${used} journal entr${used === 1 ? 'y' : 'ies'}. Make it inactive instead.` } : { ok: true };
}

export function categoryTree(list: readonly Account[]): readonly { type: AccountType; count: number; subs: readonly { name: string; count: number }[] }[] {
  return ACCOUNT_TYPES.map((type) => {
    const own = list.filter((a) => a.type === type);
    const names = Array.from(new Set(own.map((a) => a.sub)));
    return { type, count: own.length, subs: names.map((name) => ({ name, count: own.filter((a) => a.sub === name).length })) };
  });
}

const DEBIT_NORMAL: ReadonlySet<AccountType> = new Set(['Asset', 'Expense']);
const counts = (e: Entry) => e.status === 'Posted' || e.status === 'Reversing';

/** The account's balance from posted entries, on its normal side. */
export function accountBalance(code: string, entries: readonly Entry[], accounts: readonly Account[]): number {
  const type = accounts.find((a) => a.code === code)?.type ?? typeForCode(code);
  const net = entries
    .filter(counts)
    .flatMap((e) => e.lines)
    .filter((l) => l.account === code)
    .reduce((s, l) => s + l.debit - l.credit, 0);
  return type && DEBIT_NORMAL.has(type) ? net : 0 - net;
}

export function entryTotals(e: Pick<Entry, 'lines'>): { debit: number; credit: number; balanced: boolean } {
  const debit = e.lines.reduce((s, l) => s + l.debit, 0);
  const credit = e.lines.reduce((s, l) => s + l.credit, 0);
  return { debit, credit, balanced: debit === credit && debit > 0 };
}

const n = (v: number) => v.toLocaleString('en-US');

/** Everything that stops the entry posting, line by line, then the totals. */
export function validateEntry(e: Pick<Entry, 'lines'>, accounts: readonly Account[]): readonly string[] {
  const errors: string[] = [];
  if (e.lines.length < 2) errors.push('An entry needs at least two lines.');
  e.lines.forEach((l, i) => {
    const a = accounts.find((x) => x.code === l.account);
    if (!a) errors.push(`Line ${i + 1}: account ${l.account} does not exist.`);
    else if (a.status !== 'Active') errors.push(`Line ${i + 1}: ${a.code} ${a.name} is inactive.`);
    if (l.debit > 0 && l.credit > 0) errors.push(`Line ${i + 1}: put the amount on the debit or the credit side, not both.`);
    if (l.debit < 0 || l.credit < 0 || (!l.debit && !l.credit)) errors.push(`Line ${i + 1}: enter an amount above zero.`);
  });
  const t = entryTotals(e);
  if (t.debit !== t.credit) errors.push(`Debits (${n(t.debit)}) and credits (${n(t.credit)}) must be equal.`);
  return errors;
}

/** Only drafts can be edited; posted entries are corrected by reversing them. */
export function canEdit(e: Pick<Entry, 'status'>): boolean {
  return e.status === 'Draft';
}

export function postEntry<T extends Entry>(e: T, accounts: readonly Account[], by: string, at: string): { entry: T; error?: string } {
  if (e.status !== 'Draft') return { entry: e, error: `${e.id} is already posted.` };
  const errors = validateEntry(e, accounts);
  if (errors.length) return { entry: e, error: errors[0] };
  return { entry: { ...e, status: 'Posted', postedBy: by, postedAt: at } };
}

/** A posted entry is undone by a new entry with every debit and credit swapped. */
export function reverseEntry<T extends Entry>(e: T, id: string, date: string, by: string): { original: T; reversal?: T; error?: string } {
  if (e.status !== 'Posted') return { original: e, error: 'Only posted entries can be reversed.' };
  if (e.reversedBy) return { original: e, error: `${e.id} is already reversed by ${e.reversedBy}.` };
  const reversal: T = {
    ...e,
    id,
    date,
    description: `Reversal of ${e.id}: ${e.description}`,
    lines: e.lines.map((l) => ({ account: l.account, debit: l.credit, credit: l.debit })),
    status: 'Reversing',
    createdBy: by,
    postedBy: by,
    reverses: e.id,
    reversedBy: undefined,
    recurring: false,
  };
  return { original: { ...e, reversedBy: id }, reversal };
}

export function nextEntryId(list: readonly Pick<Entry, 'id'>[]): string {
  const top = list.reduce((m, e) => Math.max(m, Number(e.id.replace(/\D/g, '')) || 0), 0);
  return `JE-${top + 1}`;
}
