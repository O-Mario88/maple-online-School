/**
 * Rules for the assignment workspace: the editor's light maths markup
 * ("2/3" fractions, **bold**, *italic*, __underline__, "# " headings) and the hand-in checklist.
 */

export type MathToken =
  | { kind: 'text'; text: string; bold?: true; italic?: true; underline?: true }
  | { kind: 'frac'; num: string; den: string; after?: string };

export interface DocLine {
  heading: boolean;
  text: string;
}

export interface WorkProgress {
  answered: number;
  pages: number;
  vivaSeconds: number;
  submitted: boolean;
}

/** A viva shorter than this does not count as recorded. */
export const MIN_VIVA_SECONDS = 10;
/** A fraction: whole numbers or single letters over each other, e.g. 2/3 or a/b. */
const FRACTION = /^(\d+|[a-z])\/(\d+|[a-z])([^\w/]*)$/;
/** A word's trailing punctuation, kept apart so marks such as **total**. still close. */
const TAIL = /^(.*?)([.,;:!?)]*)$/;
const MARKS = [
  ['**', 'bold'],
  ['__', 'underline'],
  ['*', 'italic'],
] as const;

type Mark = (typeof MARKS)[number][1];

/** Splits a line into words and stacked fractions, carrying text marks across words. */
export function parseMath(line: string): MathToken[] {
  const open = new Set<Mark>();
  const tokens: MathToken[] = [];
  for (const raw of line.split(/\s+/).filter(Boolean)) {
    const [, body, tail] = TAIL.exec(raw) ?? ['', raw, ''];
    let word = body;
    const closing: Mark[] = [];
    for (const [sym, mark] of MARKS) {
      if (word.startsWith(sym)) {
        open.add(mark);
        word = word.slice(sym.length);
      }
      if (word.endsWith(sym) && word.length > sym.length - 1) {
        closing.push(mark);
        word = word.slice(0, -sym.length);
      }
    }
    const frac = FRACTION.exec(word + tail);
    if (frac) {
      tokens.push(frac[3] ? { kind: 'frac', num: frac[1], den: frac[2], after: frac[3] } : { kind: 'frac', num: frac[1], den: frac[2] });
    } else if (word + tail) {
      tokens.push({ kind: 'text', text: word + tail, ...(open.has('bold') && { bold: true }), ...(open.has('italic') && { italic: true }), ...(open.has('underline') && { underline: true }) });
    }
    for (const m of closing) open.delete(m);
  }
  return tokens;
}

/** The editor's text as headings and paragraphs; blank lines are dropped. */
export function parseDoc(text: string): DocLine[] {
  return text
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => (l.startsWith('# ') ? { heading: true, text: l.slice(2).trim() } : { heading: false, text: l.trim() }));
}

/** How many "Question" headings have writing under them. */
export function answeredCount(text: string): number {
  const sections = text.split(/^# /m).slice(1);
  return sections.filter((s) => /^Question/i.test(s) && s.split('\n').slice(1).some((l) => l.trim())).length;
}

export function checklist(p: WorkProgress): { label: string; done: boolean }[] {
  return [
    { label: 'Answers written in editor', done: p.answered > 0 },
    { label: 'Handwritten work uploaded', done: p.pages > 0 },
    { label: 'Viva recording completed', done: p.vivaSeconds >= MIN_VIVA_SECONDS },
    { label: 'Submit assignment', done: p.submitted },
  ];
}

export function canSubmit(p: WorkProgress): boolean {
  return !p.submitted && checklist(p).slice(0, 3).every((c) => c.done);
}
