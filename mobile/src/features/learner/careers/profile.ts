/**
 * The assessment's agree/disagree statements and the five-area career profile. Agreeing with a
 * statement adds the interest it points to; the profile is a picture of what the learner said,
 * never a test result.
 */
import type { Answers } from './careers';

export const LIKERT = [
  { label: 'Strongly Agree', score: 3 },
  { label: 'Agree', score: 2 },
  { label: 'Neutral', score: 1 },
  { label: 'Disagree', score: 0 },
] as const;
/** Agree or stronger counts as an interest. */
const AGREE = 2;

export const PREFERENCE_STATEMENTS = [
  { id: 'real-world', group: 'Activities', text: 'I enjoy solving real-world problems.', interest: 'design and building' },
  { id: 'living-things', group: 'Activities', text: 'I like finding out how living things work.', interest: 'science' },
  { id: 'creativity', group: 'Subjects', text: 'I like subjects that involve creativity.', interest: 'the arts' },
  { id: 'numbers', group: 'Subjects', text: 'I enjoy working with numbers and data.', interest: 'business' },
  { id: 'helping', group: 'Work Preferences', text: 'I prefer work that involves helping people.', interest: 'working with people' },
  { id: 'outdoors', group: 'Work Preferences', text: 'I’d like to work outdoors or with nature.', interest: 'the environment' },
] as const;

export type Preferences = Readonly<Record<string, number>>;

/** The answers with the interests the learner agreed with added. */
export function withPreferences(a: Answers, prefs: Preferences): Answers {
  const added = PREFERENCE_STATEMENTS.filter((s) => (prefs[s.id] ?? 0) >= AGREE && !a.interests.includes(s.interest)).map((s) => s.interest);
  return added.length ? { ...a, interests: [...a.interests, ...added] } : a;
}

const AXES = [
  { axis: 'Science', interests: ['science'], statement: 'living-things' },
  { axis: 'Problem Solving', interests: ['design and building', 'technology'], statement: 'real-world' },
  { axis: 'Helping People', interests: ['working with people'], statement: 'helping' },
  { axis: 'Creativity', interests: ['the arts'], statement: 'creativity' },
  { axis: 'Working with Data', interests: ['business'], statement: 'numbers' },
] as const;
/** A picked interest counts 2; a statement counts up to 3. */
const PICK = 2;
const MAX = PICK + LIKERT[0].score;

export function careerProfile(a: Answers, prefs: Preferences) {
  return AXES.map((x) => {
    const score = ((x.interests.some((i) => a.interests.includes(i)) ? PICK : 0) + (prefs[x.statement] ?? 0)) / MAX;
    return { axis: x.axis, score, level: score >= 0.6 ? ('High' as const) : score >= 0.3 ? ('Medium' as const) : ('Low' as const) };
  });
}
