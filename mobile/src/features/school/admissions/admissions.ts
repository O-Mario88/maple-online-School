/**
 * Rules for Admissions & Leads: the inquiry pipeline, and the consent that decides what a school
 * may see. A school sees a family's contact details only after that family deliberately asked
 * this school to contact them, only on the channels they allowed, and only while that consent stands.
 */

export const PIPELINE = ['New', 'Contact Authorized', 'Contacted', 'Interested', 'Applied', 'Enrolled'] as const;
export const CLOSED = ['Declined', 'Withdrawn', 'Closed'] as const;
export type Stage = (typeof PIPELINE)[number] | (typeof CLOSED)[number];
export type Channel = 'phone' | 'email';

/** A family's permission for one school to contact them, for one purpose. */
export interface Consent {
  school: string;
  purpose: string;
  channels: readonly Channel[];
  status: 'granted' | 'withdrawn';
  at: string;
}

export interface Inquiry {
  ref: string;
  /** The name the family deliberately gave with the inquiry. */
  name: string;
  level: string;
  program: string;
  date: string;
  stage: Stage;
  school: string;
  consent: Consent | null;
  /** Held by Maple; released only through `contactFor`. */
  contact: { phone?: string; email?: string };
}

export interface Viewer {
  school: string;
  role: 'admissions' | 'admin' | 'teacher' | 'finance';
  name: string;
}

const STAFF: readonly Viewer['role'][] = ['admissions', 'admin'];
const consented = (i: Inquiry) => i.consent?.status === 'granted' && i.consent.school === i.school;

/** The contact details this viewer may see: authorised channels only, for the school the family chose, while consent stands. */
export function contactFor(i: Inquiry, v: Viewer): { phone?: string; email?: string } | null {
  if (!STAFF.includes(v.role) || v.school !== i.school || !consented(i) || !i.consent) return null;
  const allowed = i.consent.channels;
  return {
    ...(allowed.includes('phone') && i.contact.phone ? { phone: i.contact.phone } : {}),
    ...(allowed.includes('email') && i.contact.email ? { email: i.contact.email } : {}),
  };
}

/** Moves an inquiry one stage on. Nothing moves past New until the family authorises contact. */
export function advance(i: Inquiry): { inquiry: Inquiry } | { error: string } {
  if ((CLOSED as readonly Stage[]).includes(i.stage)) return { error: 'This inquiry is closed.' };
  if (i.stage === 'Enrolled') return { error: 'Already enrolled.' };
  if (!consented(i)) return { error: 'This family hasn’t authorised contact yet. You can contact them once they do.' };
  const next = PIPELINE[PIPELINE.indexOf(i.stage as (typeof PIPELINE)[number]) + 1];
  return { inquiry: { ...i, stage: next } };
}

/** The pipeline columns, in order, with the inquiries at each stage. */
export function pipeline<T extends Inquiry>(list: readonly T[]): readonly { stage: (typeof PIPELINE)[number]; items: readonly T[] }[] {
  return PIPELINE.map((stage) => ({ stage, items: list.filter((i) => i.stage === stage) }));
}

export interface ExportRow {
  ref: string;
  name: string;
  level: string;
  program: string;
  stage: Stage;
  phone?: string;
  email?: string;
}
export type ExportResult = { error: string } | { rows: readonly ExportRow[]; audit: { by: string; purpose: string; at: string; count: number } };

/** An export for authorised staff with a stated purpose: this school's inquiries, consented contacts only, and the audit record. */
export function exportInquiries(list: readonly Inquiry[], v: Viewer, purpose: string, today: string): ExportResult {
  if (!purpose.trim()) return { error: 'Say why you’re exporting; every export is logged.' };
  if (!STAFF.includes(v.role)) return { error: 'Only admissions staff and administrators can export inquiries.' };
  const rows = list.filter((i) => i.school === v.school).map((i) => ({ ref: i.ref, name: i.name, level: i.level, program: i.program, stage: i.stage, ...(contactFor(i, v) ?? {}) }));
  return { rows, audit: { by: v.name, purpose: purpose.trim(), at: today, count: rows.length } };
}
