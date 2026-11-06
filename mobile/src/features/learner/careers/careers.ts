/**
 * Rules behind Career Compass: suggesting several careers from what a learner enjoys and does
 * well (never a single answer or a diagnosis), how a learner's subjects fit a program, whether a
 * program's accreditation is verified, and what the guidance focuses on at each stage.
 */

export interface CareerFacts {
  id: string;
  title: string;
  interests: readonly string[];
  /** Subjects that help. */
  strengths: readonly string[];
  /** Where the work happens, e.g. hospital, office, outdoors. */
  environments: readonly string[];
}

export interface Answers {
  interests: readonly string[];
  strengths: readonly string[];
  environments: readonly string[];
}

export const MIN_SUGGESTIONS = 3;
const WEIGHT = { interest: 3, strength: 2, environment: 1 } as const;

const list = (xs: readonly string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const place = (e: string) => (e === 'outdoors' ? 'outdoors' : `in ${/^[aeiou]/i.test(e) ? 'an' : 'a'} ${e}`);

/** Careers worth exploring, best fit first, each with plain reasons; at least three, so there's always a choice. */
export function matchCareers<T extends CareerFacts>(careers: readonly T[], a: Answers): readonly { career: T; reasons: readonly string[] }[] {
  const scored = careers.map((career) => {
    const interests = career.interests.filter((x) => a.interests.includes(x));
    const strengths = career.strengths.filter((x) => a.strengths.includes(x));
    const envs = career.environments.filter((x) => a.environments.includes(x));
    const reasons = [
      interests.length ? `Matches your interest in ${list(interests)}` : null,
      strengths.length ? `Uses your ${strengths.length === 1 ? 'strength' : 'strengths'} in ${list(strengths)}` : null,
      envs.length ? `Suits working ${envs.map(place).join(' or ')}` : null,
    ].filter((r): r is string => r !== null);
    return { career, reasons, score: interests.length * WEIGHT.interest + strengths.length * WEIGHT.strength + envs.length * WEIGHT.environment };
  });
  const matched = scored.filter((x) => x.score > 0).sort((x, y) => y.score - x.score);
  const others = scored.filter((x) => x.score === 0).map((x) => ({ ...x, reasons: ['A different direction worth exploring'] }));
  return [...matched, ...others.slice(0, Math.max(0, MIN_SUGGESTIONS - matched.length))].map(({ career, reasons }) => ({ career, reasons }));
}

/** How a learner's subjects fit a program's essential subjects. Always check the current official requirement too. */
export function subjectFit(essentials: readonly string[], subjects: readonly string[]): { status: 'meets' | 'partly' | 'missing'; missing: readonly string[] } {
  const missing = essentials.filter((s) => !subjects.includes(s));
  if (missing.length === 0) return { status: 'meets', missing };
  return { status: missing.length === essentials.length ? 'missing' : 'partly', missing };
}

/** Months a program verification stays current before it's reviewed again. */
export const REVIEW_MONTHS = 12;

const monthsBetween = (from: string, to: string) => {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0);
};

/** A program's own accreditation status; the university being verified never verifies its programs. */
export function programStatus(acc: { status: 'accredited' | 'pending' | 'not-accredited'; verifiedOn: string | null }, today: string): 'verified' | 'review-due' | 'unverified' {
  if (acc.status !== 'accredited' || !acc.verifiedOn) return 'unverified';
  return monthsBetween(acc.verifiedOn, today) <= REVIEW_MONTHS ? 'verified' : 'review-due';
}

/** What guidance focuses on at each stage: explore early, choose subjects at O-Level, apply at A-Level. */
export function stageFocus(level: string): { focus: 'Explore' | 'Choose subjects' | 'Apply'; tip: string } {
  const n = Number(/^S\.(\d)/.exec(level)?.[1] ?? 0);
  if (n >= 5) return { focus: 'Apply', tip: 'Shortlist programs, check entry requirements and plan applications and scholarships.' };
  if (n >= 3) return { focus: 'Choose subjects', tip: 'Pick A-Level subjects that keep the careers you like open.' };
  return { focus: 'Explore', tip: 'Explore many careers and notice what you enjoy; nothing is decided yet.' };
}

const unique = (xs: readonly string[]) => xs.filter((x, i) => xs.indexOf(x) === i);
const fieldWord = (f: string) => (f === f.toUpperCase() ? f : f.toLowerCase());

/** Where a subject can take a learner: the careers that use it, their fields, and one plain sentence. */
export function subjectLinks<T extends CareerFacts & { field: string }>(careers: readonly T[], subject: string): { careers: readonly T[]; fields: readonly string[]; sentence: string } {
  const found = careers.filter((c) => c.strengths.includes(subject));
  const fields = unique(found.map((c) => c.field));
  return { careers: found, fields, sentence: fields.length ? `${subject} connects to careers in ${list(fields.map(fieldWord))}.` : '' };
}

/** Areas worth exploring from the subjects a learner does well in, and the subjects to grow next. It suggests; it never predicts. */
export function exploreFromStrengths<T extends CareerFacts & { field: string }>(careers: readonly T[], strong: readonly string[]): { fields: readonly string[]; growNext: readonly string[]; careers: readonly T[] } {
  const found = careers.filter((c) => c.strengths.some((s) => strong.includes(s)));
  return { careers: found, fields: unique(found.map((c) => c.field)), growNext: unique(found.flatMap((c) => c.strengths).filter((s) => !strong.includes(s))) };
}

/** The subjects a learner is furthest along in, from their progress. Subjects not started are left out. */
export function strongestSubjects(subjects: readonly { name: string; done: number; total: number }[], count = 2): string[] {
  return subjects
    .filter((x) => x.done > 0 && x.total > 0)
    .map((x) => ({ name: x.name, share: x.done / x.total }))
    .sort((a, b) => b.share - a.share)
    .slice(0, count)
    .map((x) => x.name);
}

/** Career fields as a sentence list: "engineering, ICT and education". */
export const fieldList = (fields: readonly string[]): string => list(fields.map(fieldWord));

/** How much of a career's interests, subjects and work settings appear in the learner's answers, as a whole percent. */
export function matchStrength(career: CareerFacts, a: Answers): number {
  const total = career.interests.length * WEIGHT.interest + career.strengths.length * WEIGHT.strength + career.environments.length * WEIGHT.environment;
  if (!total) return 0;
  const hit =
    career.interests.filter((x) => a.interests.includes(x)).length * WEIGHT.interest +
    career.strengths.filter((x) => a.strengths.includes(x)).length * WEIGHT.strength +
    career.environments.filter((x) => a.environments.includes(x)).length * WEIGHT.environment;
  return Math.round((hit / total) * 100);
}

/** Career areas ranked by their best-matching career; areas with no match are left out. */
export function areaMatches<T extends CareerFacts & { area: string }>(careers: readonly T[], a: Answers): { area: string; percent: number }[] {
  const best = new Map<string, number>();
  careers.forEach((c) => best.set(c.area, Math.max(best.get(c.area) ?? 0, matchStrength(c, a))));
  return [...best.entries()]
    .filter(([, percent]) => percent > 0)
    .map(([area, percent]) => ({ area, percent }))
    .sort((x, y) => y.percent - x.percent);
}

export interface CareerFilters {
  query: string;
  area?: string;
  /** A study route: Degree, Diploma, Certificate or Vocational. */
  level?: string;
  environment?: string;
  /** A subject that helps. */
  subject?: string;
  field?: string;
}

/** Careers whose title, field or related work contains the search, narrowed by the chosen area, study route, work setting, subject and field. */
export function searchCareers<T extends CareerFacts & { area: string; field: string; overview: string; related: readonly string[]; pathways?: readonly { level: string }[] }>(careers: readonly T[], f: CareerFilters): T[] {
  const q = f.query.trim().toLowerCase();
  return careers.filter(
    (c) =>
      (!f.area || c.area === f.area) &&
      (!f.level || (c.pathways ?? []).some((p) => p.level === f.level)) &&
      (!f.environment || c.environments.includes(f.environment)) &&
      (!f.subject || c.strengths.includes(f.subject)) &&
      (!f.field || c.field === f.field) &&
      (!q || [c.title, c.field, c.overview, ...c.related].some((x) => x.toLowerCase().includes(q))),
  );
}

export type CareerSort = 'relevant' | 'name';

/** "Most relevant" puts the closest match to the learner's answers first; "name" is A–Z. */
export function sortCareers<T extends CareerFacts>(careers: readonly T[], a: Answers, sort: CareerSort): T[] {
  const byName = (x: T, y: T) => x.title.localeCompare(y.title);
  if (sort === 'name') return [...careers].sort(byName);
  return [...careers].sort((x, y) => matchStrength(y, a) - matchStrength(x, a) || byName(x, y));
}

/** A career path in four stages: today's subjects, applying, studying, and the work itself. */
export function careerStages(
  goal: { title: string; essentials: readonly string[]; pathways: readonly { level: string; years: string }[]; progression: readonly string[] },
  level: string,
  programs: readonly { award: string }[],
): { when: string; title: string; body: string }[] {
  return [
    { when: `Now · ${level}`, title: 'Keep your subjects on track', body: goal.essentials.length ? `Most programs ask for ${list(goal.essentials)} at A-Level.` : 'Many subject combinations are accepted.' },
    { when: 'Next year', title: 'Shortlist and apply', body: programs.length ? `${programs.length} programs teach this: ${programs.map((p) => p.award).join(', ')}.` : 'No programs listed yet.' },
    { when: 'After UACE', title: 'Study and train', body: goal.pathways.map((p) => `${p.level}: ${p.years}`).join(' · ') },
    { when: 'Your career', title: goal.title, body: goal.progression.join(' → ') },
  ];
}
