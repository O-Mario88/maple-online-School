/**
 * Rules for a school application on the School Network: what each of the four steps needs,
 * how phone numbers, emails, dates of birth and PLE results are checked, and progress.
 * Nothing here is shared with the school until the learner (or guardian) submits.
 */
import type { Stay } from './schoolNetwork';

export type StepKey = 'applicant' | 'academic' | 'documents' | 'review';
export const STEPS: readonly { key: StepKey; label: string }[] = [
  { key: 'applicant', label: 'Applicant Details' },
  { key: 'academic', label: 'Academic Information' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review & Submit' },
];

export interface ApplicationForm {
  applyingFor: string;
  first: string;
  middle: string;
  last: string;
  /** YYYY-MM-DD */
  dob: string;
  gender: string;
  nationality: string;
  guardian: { name: string; relationship: string; phone: string; email: string; occupation: string; address: string };
  current: { school: string; grade: string; year: string };
  academic: { stream: string; subjects: readonly string[]; pleAggregate: string; pleIndex: string; pleYear: string; boarding: Stay | ''; needs: string };
  /** Required document id → the attached file's name. */
  documents: Readonly<Record<string, string>>;
  consent: boolean;
}

/** Field key → what to fix. Keys are dotted for nested fields, e.g. "guardian.phone". */
export type Errors = Readonly<Record<string, string>>;

const MIN_AGE = 5;
const MAX_AGE = 25;
const PLE_BEST = 4;
const PLE_WORST = 36;
const FIRST_PLE_YEAR = 2000;
const UG_DIGITS = 9;

const blank = (v: string) => !v.trim();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The number after +256, accepting a leading 0 or 256; null when it is not nine digits. */
export function ugandaNumber(phone: string): string | null {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('256')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  return d.length === UG_DIGITS ? d : null;
}

function parseDate(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d ? date : null;
}

/** Whole years between a date of birth and a day (both YYYY-MM-DD). */
export function ageOn(dob: string, today: string): number {
  const [by, bm, bd] = dob.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

function dobError(dob: string, today: string): string | null {
  if (!parseDate(dob)) return 'Enter the date of birth';
  if (dob >= today) return 'Enter a date of birth in the past';
  const age = ageOn(dob, today);
  return age < MIN_AGE || age > MAX_AGE ? `Learners must be ${MIN_AGE} to ${MAX_AGE} years old` : null;
}

const toErrors = (checks: readonly (readonly [string, string | null])[]): Errors => Object.fromEntries(checks.filter((c): c is readonly [string, string] => c[1] !== null));

function applicantErrors(f: ApplicationForm, today: string): Errors {
  const g = f.guardian;
  return toErrors([
    ['first', blank(f.first) ? 'Enter the first name' : null],
    ['last', blank(f.last) ? 'Enter the last name' : null],
    ['dob', dobError(f.dob, today)],
    ['gender', blank(f.gender) ? 'Choose a gender' : null],
    ['nationality', blank(f.nationality) ? 'Choose a nationality' : null],
    ['guardian.name', blank(g.name) ? 'Enter the parent or guardian’s full name' : null],
    ['guardian.relationship', blank(g.relationship) ? 'Choose the relationship' : null],
    ['guardian.phone', blank(g.phone) ? 'Enter a phone number' : ugandaNumber(g.phone) ? null : 'Enter the 9 digits after +256, e.g. 772 345 678'],
    ['guardian.email', !blank(g.email) && !EMAIL.test(g.email.trim()) ? 'Enter an email like name@example.com' : null],
    ['guardian.address', blank(g.address) ? 'Enter the home address' : null],
  ]);
}

function academicErrors(f: ApplicationForm, today: string): Errors {
  const a = f.academic;
  const agg = Number(a.pleAggregate);
  const year = Number(a.pleYear);
  const thisYear = Number(today.slice(0, 4));
  return toErrors([
    ['stream', blank(a.stream) ? 'Choose a stream' : null],
    ['pleAggregate', blank(a.pleAggregate) ? 'Enter the PLE aggregate' : Number.isInteger(agg) && agg >= PLE_BEST && agg <= PLE_WORST ? null : `PLE aggregates run from ${PLE_BEST} to ${PLE_WORST}`],
    ['pleIndex', blank(a.pleIndex) ? 'Enter the PLE index number' : null],
    ['pleYear', /^\d{4}$/.test(a.pleYear) && year >= FIRST_PLE_YEAR && year <= thisYear ? null : 'Enter the year of the PLE sitting'],
  ]);
}

/** What still needs fixing on a step; empty when the step is complete. */
export function stepErrors(f: ApplicationForm, step: StepKey, docs: readonly string[], today: string): Errors {
  if (step === 'applicant') return applicantErrors(f, today);
  if (step === 'academic') return academicErrors(f, today);
  if (step === 'documents') return Object.fromEntries(docs.filter((d) => !f.documents[d]).map((d) => [d, 'Attach this document']));
  return f.consent ? {} : { consent: 'Confirm the details are true and agree to share them with this school' };
}

const FILL_STEPS: readonly StepKey[] = ['applicant', 'academic', 'documents'];
const PCT_PER_STEP = 25;

/** Steps completed in order (a quarter each); the fourth counts only once the application is submitted. */
export function progressOf(f: ApplicationForm, docs: readonly string[], today: string, submitted: boolean): { pct: number; done: number } {
  const firstOpen = FILL_STEPS.findIndex((s) => Object.keys(stepErrors(f, s, docs, today)).length > 0);
  const filled = firstOpen === -1 ? FILL_STEPS.length : firstOpen;
  const done = filled === FILL_STEPS.length && submitted && f.consent ? STEPS.length : filled;
  return { pct: done * PCT_PER_STEP, done };
}
