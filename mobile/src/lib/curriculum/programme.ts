/**
 * Reading a national curriculum programme (GET /api/v1/curriculum/programmes/{country}/):
 * subject counts, the rules for one class, and plain-language descriptions.
 */
import type { components } from '@/lib/api/schema';

export type Programme = components['schemas']['Programme'];
export type ProgrammeTrack = Programme['tracks'][number];
export type ProgrammeLevel = ProgrammeTrack['levels'][number];
export type ProgrammeClass = ProgrammeLevel['classes'][number];
export type ProgrammeRule = components['schemas']['ProgrammeRule'];

export function subjectCounts(c: ProgrammeClass): { compulsory: number; electives: number } {
  const compulsory = c.subjects.filter((s) => s.compulsory).length;
  return { compulsory, electives: c.subjects.length - compulsory };
}

export function rulesFor(rules: readonly ProgrammeRule[], className: string): ProgrammeRule[] {
  return rules.filter((r) => r.classes.includes(className));
}

/** Subject codes to names, across the whole track. */
export function subjectNames(track: ProgrammeTrack): Map<string, string> {
  const names = new Map<string, string>();
  for (const level of track.levels) {
    for (const c of level.classes) {
      for (const s of c.subjects) names.set(s.code, s.name);
    }
  }
  return names;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** "a, b and c" */
export function joinAnd(items: readonly string[], last = 'and'): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${last} ${items[items.length - 1]}`;
}

function named(codes: readonly string[], names: ReadonlyMap<string, string>): string[] {
  return codes.map((c) => names.get(c) ?? c);
}

/** One sentence a parent or teacher can read. Empty for rules shown elsewhere. */
export function describeRule(rule: ProgrammeRule, names: ReadonlyMap<string, string>): string {
  const note = text(rule.note);
  const withNote = (sentence: string) => (note ? `${sentence} ${note}` : sentence);
  switch (rule.kind) {
    case 'elective_limit':
      return withNote(`Learners choose up to ${Number(rule.max_electives)} electives.`);
    case 'exam': {
      const subjects = named(strings(rule.subjects), names);
      const title = `${text(rule.board)} ${text(rule.name)}`.trim();
      return withNote(subjects.length > 0 ? `${title}: ${joinAnd(subjects)}.` : `${title} is sat in this class.`);
    }
    case 'components': {
      const parts = strings(rule.components);
      return rule.choose === 1 ? `One of: ${joinAnd(parts, 'or')}.` : `Covers ${joinAnd(parts)}.`;
    }
    case 'alternative':
    case 'principal_subjects':
      return note;
    case 'approach':
      return `${approachLabel(text(rule.approach))}: ${strings(rule.structure).join(' → ')}.`;
    default:
      return '';
  }
}

function approachLabel(approach: string): string {
  switch (approach) {
    case 'thematic':
      return 'Thematic curriculum';
    case 'competency_based':
      return 'Competency-based curriculum';
    default:
      return 'Subject-based curriculum';
  }
}

export interface Combination {
  code: string;
  subjects: string;
}

export function combinationsFor(rules: readonly ProgrammeRule[], className: string, names: ReadonlyMap<string, string>): Combination[] {
  const rule = rulesFor(rules, className).find((r) => r.kind === 'combinations');
  if (!rule || !Array.isArray(rule.combinations)) return [];
  return rule.combinations.flatMap((c: unknown) => {
    if (typeof c !== 'object' || c === null) return [];
    const { code, subjects } = c as { code?: unknown; subjects?: unknown };
    return [{ code: text(code), subjects: joinAnd(named(strings(subjects), names)) }];
  });
}

export interface SubjectGroup {
  code: string;
  name: string;
  subjects: string[];
}

export function groupsFor(rules: readonly ProgrammeRule[], className: string, names: ReadonlyMap<string, string>): SubjectGroup[] {
  const rule = rulesFor(rules, className).find((r) => r.kind === 'subject_groups');
  if (!rule || !Array.isArray(rule.groups)) return [];
  return rule.groups.flatMap((g: unknown) => {
    if (typeof g !== 'object' || g === null) return [];
    const { code, name, subjects } = g as { code?: unknown; name?: unknown; subjects?: unknown };
    return [{ code: text(code), name: text(name), subjects: named(strings(subjects), names) }];
  });
}
