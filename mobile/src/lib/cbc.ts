/**
 * Uganda's NCDC competency-based curriculum (CBC): the subject learning domains (KUSVA),
 * the generic skills, the national values and learning outcomes, RACE scoring of
 * Activities of Integration and projects, the 1–3 formative identifiers, and the
 * 20% continuous assessment + 80% exam achievement levels.
 */

export type Domain = 'knowledge' | 'skills' | 'values';

export const DOMAINS: Readonly<Record<Domain, { label: string; short: string; hint: string }>> = {
  knowledge: { label: 'Knowledge & Understanding', short: 'Knowledge', hint: 'Explains why and how, not just what' },
  skills: { label: 'Skills & Practical Application', short: 'Skills', hint: 'Carries out procedures and applies them to real life' },
  values: { label: 'Values & Attitudes', short: 'Values', hint: 'Shows the national ethical values in daily work' },
};

export const GENERIC_SKILLS = [
  { key: 'critical', label: 'Critical Thinking & Problem-Solving', short: 'Problem-Solving' },
  { key: 'creativity', label: 'Creativity & Innovation', short: 'Creativity' },
  { key: 'communication', label: 'Communication', short: 'Communication' },
  { key: 'cooperation', label: 'Co-operation & Self-Directed Learning', short: 'Co-operation' },
  { key: 'computation', label: 'Mathematical Computation & ICT', short: 'Computation & ICT' },
] as const;
export type GenericSkill = (typeof GENERIC_SKILLS)[number]['key'];

/** Uganda's National Ethical Values. */
export const VALUES = [
  'Respect for humanity and the environment',
  'Honesty',
  'Justice and fairness',
  'Hard work for self-reliance',
  'Integrity',
  'Creativity and innovativeness',
  'Social responsibility',
  'Social harmony',
] as const;

/** The graduate profile every assessment builds toward. */
export const LEARNING_OUTCOMES = ['Self-assured individuals', 'Responsible and patriotic citizens', 'Lifelong learners', 'Positive contributors to society'] as const;

export type Identifier = { id: 1 | 2 | 3; label: 'Basic' | 'Moderate' | 'Outstanding' };

/** The formative 1–3 identifier: the score as an average on a 0–3 scale, cut at 1.5 and 2.5. */
export function identifierFor(score: number, max: number): Identifier {
  const avg = max > 0 ? (score / max) * 3 : 0;
  if (avg >= 2.5) return { id: 3, label: 'Outstanding' };
  if (avg >= 1.5) return { id: 2, label: 'Moderate' };
  return { id: 1, label: 'Basic' };
}

export interface RaceScore {
  relevance: number;
  accuracy: number;
  coherence: number;
  excellence: number;
}

export const RACE = [
  { key: 'relevance', label: 'Relevance', max: 3, hint: 'How well the response fits and solves the scenario' },
  { key: 'accuracy', label: 'Accuracy', max: 3, hint: 'Facts, principles, calculations and vocabulary are correct' },
  { key: 'coherence', label: 'Coherence', max: 3, hint: 'Ideas and steps connect logically and smoothly' },
  { key: 'excellence', label: 'Excellence', max: 1, hint: 'Exceptional quality, originality or presentation' },
] as const;

/** RACE marks for an Activity of Integration or project, out of 10. */
export function raceTotal(s: RaceScore): { score: number; max: number } {
  const score = RACE.reduce((sum, r) => sum + Math.min(r.max, Math.max(0, s[r.key])), 0);
  return { score, max: RACE.reduce((sum, r) => sum + r.max, 0) };
}

/** Continuous assessment counts 20%, the end-of-cycle exam 80%. */
export const CA_WEIGHT = 0.2;
// Achievement-level cut-offs on the combined percentage. Assumed bands: confirm against UNEB's published UCE scale.
const LEVELS = [
  { min: 80, level: 'A', label: 'Exceptional' },
  { min: 65, level: 'B', label: 'Outstanding' },
  { min: 50, level: 'C', label: 'Satisfactory' },
  { min: 35, level: 'D', label: 'Basic' },
  { min: 0, level: 'E', label: 'Elementary' },
] as const;

export function achievementLevel(caPercent: number, examPercent: number): { level: string; label: string; percent: number } {
  const percent = Math.round(caPercent * CA_WEIGHT + examPercent * (1 - CA_WEIGHT));
  const band = LEVELS.find((l) => percent >= l.min) ?? LEVELS[LEVELS.length - 1];
  return { level: band.level, label: band.label, percent };
}

/** The learning domain an outcome belongs to, read from its verb as the syllabus writes it. */
export function domainOf(outcome: string): Domain {
  const o = outcome.toLowerCase();
  if (/\b(appreciate|value|show concern|respect)\b/.test(o)) return 'values';
  if (/\bable to\b/.test(o)) return 'skills';
  return 'knowledge';
}
