/** Sample data for the exam simulator: UCE Mathematics 2023 Paper 1, Section A (40 one-mark questions). */
import { photos } from './photos';

export interface ExamStep {
  label: string;
  math: string;
}

export interface ExamQuestion {
  n: number;
  text: string;
  figure?: number;
  options: string[];
  answer: number;
  steps: ExamStep[];
  scheme: { award: string; answer: string; notes: string[] };
  topic: { title: string; meta: string };
  /** The NCDC learning domain the question assesses. */
  domain: 'knowledge' | 'skills';
  /** One line under the correct answer, in words. */
  summary: string;
  /** The walkthrough's length in seconds, the line its captions show, and whether the filmed whiteboard matches. */
  walkthrough: { seconds: number; caption: string; board: boolean };
}

/** Puts the correct option at a fixed slot so answers spread across A–D. */
function place(correct: string, others: [string, string, string], slot: number): { options: string[]; answer: number } {
  const options = [...others];
  options.splice(slot, 0, correct);
  return { options, answer: slot };
}

type Made = Omit<ExamQuestion, 'n' | 'walkthrough'> & { caption: string };

function pythagoras(n: number): Made {
  const k = (n % 3) + 1;
  const [a, b, c] = [3 * k, 4 * k, 5 * k];
  return {
    text: `A right-angled triangle has shorter sides of ${a} cm and ${b} cm. Find the length of the longest side.`,
    ...place(`${c} cm`, [`${a + b} cm`, `${c + 1} cm`, `${c - 1} cm`], n % 4),
    steps: [
      { label: 'Use Pythagoras’ theorem:', math: 'c² = a² + b²' },
      { label: 'Substitute the values:', math: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}` },
      { label: 'Take the square root:', math: `c = √${c * c} = ${c} cm` },
    ],
    scheme: { award: 'B1', answer: `${c} cm`, notes: ['Units required.', 'Accept an exact equivalent such as 10.0 cm.'] },
    domain: 'skills',
    topic: { title: 'Pythagoras’ Theorem', meta: 'S2 Mathematics • 3 lessons • 32 min' },
    summary: `The longest side is ${c} cm.`,
    caption: `The longest side is the hypotenuse, so c squared is ${a} squared plus ${b} squared.`,
  };
}

function percentage(n: number): Made {
  const p = [10, 20, 25, 50][n % 4];
  const old = 2000 + 400 * (n % 3);
  const rise = (old * p) / 100;
  const fmt = (v: number) => v.toLocaleString('en-US');
  return {
    text: `A boda-boda fare rises from UGX ${fmt(old)} to UGX ${fmt(old + rise)}. Find the percentage increase.`,
    ...place(`${p}%`, [`${p + 5}%`, `${p / 2}%`, `${Math.round((rise / (old + rise)) * 1000) / 10}%`], (n + 1) % 4),
    steps: [
      { label: 'Find the increase:', math: `${fmt(old + rise)} − ${fmt(old)} = ${fmt(rise)}` },
      { label: 'Divide by the original fare:', math: `${fmt(rise)} ÷ ${fmt(old)} × 100` },
      { label: 'Work it out:', math: `= ${p}%` },
    ],
    scheme: { award: 'B1', answer: `${p}%`, notes: ['Divide by the original amount, not the new one.'] },
    domain: 'skills',
    topic: { title: 'Percentage Change', meta: 'S1 Mathematics • 2 lessons • 24 min' },
    summary: `The fare rose by ${p}%.`,
    caption: 'Always divide the increase by the original amount.',
  };
}

function equation(n: number): Made {
  const a = 2 + (n % 5);
  const x = 1 + (n % 7);
  const b = 3 + (n % 4);
  return {
    text: `Solve the equation ${a}x + ${b} = ${a * x + b}.`,
    ...place(`x = ${x}`, [`x = ${x + 1}`, `x = ${x + 2}`, `x = ${x - 1}`], (n + 2) % 4),
    steps: [
      { label: `Subtract ${b} from both sides:`, math: `${a}x = ${a * x}` },
      { label: `Divide both sides by ${a}:`, math: `x = ${a * x} ÷ ${a}` },
      { label: 'So:', math: `x = ${x}` },
    ],
    scheme: { award: 'B1', answer: `x = ${x}`, notes: ['Check by substituting back into the equation.'] },
    domain: 'knowledge',
    topic: { title: 'Linear Equations', meta: 'S1 Mathematics • 4 lessons • 40 min' },
    summary: `${a} × ${x} + ${b} = ${a * x + b}, so x = ${x} works.`,
    caption: 'Undo the addition first, then undo the multiplication.',
  };
}

function gradient(n: number): Made {
  const m = 1 + (n % 4);
  const d = 2 + (n % 3);
  const y = n % 5;
  return {
    text: `Find the gradient of the line through (1, ${y}) and (${1 + d}, ${y + m * d}).`,
    ...place(`${m}`, [`${-m}`, `${m + 1}`, `1/${m + 1}`], (n + 3) % 4),
    steps: [
      { label: 'Use the gradient formula:', math: 'm = (y₂ − y₁) ÷ (x₂ − x₁)' },
      { label: 'Substitute the points:', math: `m = (${y + m * d} − ${y}) ÷ (${1 + d} − 1) = ${m * d} ÷ ${d}` },
      { label: 'Simplify:', math: `m = ${m}` },
    ],
    scheme: { award: 'B1', answer: `${m}`, notes: ['Change in y over change in x.'] },
    domain: 'knowledge',
    topic: { title: 'Coordinate Geometry', meta: 'S2 Mathematics • 3 lessons • 35 min' },
    summary: `The line rises ${m} for every 1 across.`,
    caption: 'Rise over run: the change in y divided by the change in x.',
  };
}

function perimeter(n: number): Made {
  const w = 3 + (n % 4);
  const l = w + 1 + (n % 3);
  return {
    text: `A rectangular garden is ${l} m long and ${w} m wide. Find its perimeter.`,
    ...place(`${2 * (l + w)} m`, [`${l + w} m`, `${2 * l + w} m`, `${l + 2 * w} m`], n % 4),
    steps: [
      { label: 'Perimeter of a rectangle:', math: 'P = 2(l + w)' },
      { label: 'Substitute the values:', math: `P = 2(${l} + ${w}) = 2 × ${l + w}` },
      { label: 'So:', math: `P = ${2 * (l + w)} m` },
    ],
    scheme: { award: 'B1', answer: `${2 * (l + w)} m`, notes: ['Units required.'] },
    domain: 'skills',
    topic: { title: 'Perimeter and Area', meta: 'S1 Mathematics • 3 lessons • 30 min' },
    summary: `The fence around the garden is ${2 * (l + w)} m long.`,
    caption: 'Add the length and the width, then double it.',
  };
}

function fraction(n: number): Made {
  const [p, q] = [[2, 3], [3, 4], [3, 5], [4, 7], [5, 6]][n % 5];
  const g = 2 + (n % 4);
  return {
    text: `Write ${p * g}/${q * g} in its simplest form.`,
    ...place(`${p}/${q}`, [`${q}/${p}`, `${p + 1}/${q}`, `${p}/${q + 1}`], (n + 1) % 4),
    steps: [
      { label: 'Find the HCF:', math: `HCF(${p * g}, ${q * g}) = ${g}` },
      { label: `Divide top and bottom by ${g}:`, math: `${p * g} ÷ ${g} = ${p},  ${q * g} ÷ ${g} = ${q}` },
      { label: 'So:', math: `${p * g}/${q * g} = ${p}/${q}` },
    ],
    scheme: { award: 'B1', answer: `${p}/${q}`, notes: ['Must be fully simplified.'] },
    domain: 'knowledge',
    topic: { title: 'Equivalent Fractions', meta: 'S1 Mathematics • 4 lessons • 51 min' },
    summary: `${p * g}/${q * g} simplifies to ${p}/${q}.`,
    caption: 'Divide the top and the bottom by the same number.',
  };
}

const MAKERS = [pythagoras, percentage, equation, gradient, perimeter, fraction];

/** Question 14 is the reference's: the triangle has its right angle at B, so AC is the hypotenuse. */
const question14: Made = {
  text: 'In the diagram below, triangle ABC is a right-angled triangle. Find the length of AC.',
  figure: photos.exam.diagram,
  options: ['7 cm', '8 cm', '10 cm', '12 cm'],
  answer: 2,
  steps: [
    { label: 'Use Pythagoras’ theorem:', math: 'AC² = AB² + BC²' },
    { label: 'Substitute the values:', math: 'AC² = 6² + 8² = 36 + 64 = 100' },
    { label: 'Find AC:', math: 'AC = √100 = 10 cm' },
  ],
  scheme: { award: 'B1', answer: 'AC = 10 cm', notes: ['Units required.', 'AC is the hypotenuse because the right angle is at B.'] },
  domain: 'skills',
  topic: { title: 'Pythagoras’ Theorem', meta: 'S2 Mathematics • 3 lessons • 32 min' },
  summary: 'The length of AC is 10 cm.',
  caption: 'So AC squared equals six squared plus eight squared.',
};

const questions: ExamQuestion[] = Array.from({ length: 40 }, (_, i) => {
  const n = i + 1;
  const { caption, ...q } = n === 14 ? question14 : MAKERS[n % MAKERS.length](n);
  return { n, ...q, walkthrough: { seconds: n === 14 ? 134 : 90 + ((n * 7) % 50), caption, board: n === 14 } };
});

/** The learner's sheet as the reference shows it: 1–14 answered (5 and 9 wrong), 13 flagged, on question 14. */
const answers: Record<number, number> = Object.fromEntries(
  questions.slice(0, 14).map((q) => [q.n, q.n === 5 || q.n === 9 ? (q.answer + 1) % 4 : q.answer]),
);

export const examSimulator = {
  id: 'uce-math-2023-p1',
  crumbs: ['Past Papers', 'UCE Mathematics', '2023 Paper 1', 'Section A'],
  phoneCrumbs: ['Past Papers', 'UCE Math 2023'],
  title: 'UCE Mathematics - 2023 Paper 1',
  phoneTitle: 'UCE Math - 2023 Paper 1',
  sub: 'Practice the end-of-cycle exam (80% of your UCE result) with instant feedback and teacher explanations.',
  secondsLeft: 1 * 3600 + 28 * 60 + 45,
  sections: [
    { key: 'A', title: 'Section A', sub: '40 questions • 1 mark each' },
    { key: 'B', title: 'Section B', sub: '12 questions • 4 marks each' },
    { key: 'C', title: 'Section C', sub: '6 questions • 6 marks each' },
  ],
  teacher: 'Ms. Nakato',
  video: photos.exam.video,
  questions,
  start: { current: 14, answers, flagged: [13] },
};
