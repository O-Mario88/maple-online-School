/**
 * Rules behind the Digital Library book reader: moving through pages, what counts as read,
 * bookmarks, highlights and notes, reading tools, quiz marking, and the progress record that
 * goes to the learner's dashboard and the parent portal.
 */

export interface ChapterShape {
  id: string;
  title: string;
  /** First page of the chapter; it runs to the page before the next chapter. */
  start: number;
}

export interface BookShape {
  id: string;
  pages: number;
  chapters: readonly ChapterShape[];
  /** Whether the publisher allows offline reading. */
  offline: boolean;
}

export interface Highlight {
  page: number;
  block: string;
  text: string;
}

export interface Note {
  id: string;
  page: number;
  text: string;
}

export interface ReadingState {
  page: number;
  read: readonly number[];
  bookmarks: readonly number[];
  highlights: readonly Highlight[];
  notes: readonly Note[];
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const withPage = (list: readonly number[], page: number) => (list.includes(page) ? list : [...list, page].sort((a, b) => a - b));

/** Opens the book where the learner left off, or at the first page. */
export function startReading(book: BookShape, saved: { lastPage: number; read: readonly number[] } | undefined): ReadingState {
  const page = clamp(saved?.lastPage ?? 1, 1, book.pages);
  return { page, read: withPage(saved?.read ?? [], page), bookmarks: [], highlights: [], notes: [] };
}

export function goTo(book: BookShape, s: ReadingState, page: number): ReadingState {
  const p = clamp(Math.round(page), 1, book.pages);
  return { ...s, page: p, read: withPage(s.read, p) };
}

function chapterEnd(book: BookShape, i: number): number {
  return (book.chapters[i + 1]?.start ?? book.pages + 1) - 1;
}

export function chapterAt(book: BookShape, page: number): ChapterShape | null {
  const i = book.chapters.findIndex((c, n) => page >= c.start && page <= chapterEnd(book, n));
  return i < 0 ? null : book.chapters[i];
}

export function chapterDone(book: BookShape, s: Pick<ReadingState, 'read'>, id: string): boolean {
  const i = book.chapters.findIndex((c) => c.id === id);
  if (i < 0) return false;
  for (let p = book.chapters[i].start; p <= chapterEnd(book, i); p += 1) if (!s.read.includes(p)) return false;
  return true;
}

export function progressPct(book: BookShape, s: Pick<ReadingState, 'read'>): number {
  return Math.round((s.read.length / book.pages) * 100);
}

export function toggleBookmark(s: ReadingState, page: number): ReadingState {
  return { ...s, bookmarks: s.bookmarks.includes(page) ? s.bookmarks.filter((p) => p !== page) : withPage(s.bookmarks, page) };
}

/** Highlights a passage, or removes the highlight if it is already there. */
export function toggleHighlight(s: ReadingState, h: Highlight): ReadingState {
  const has = s.highlights.some((x) => x.page === h.page && x.block === h.block);
  return { ...s, highlights: has ? s.highlights.filter((x) => !(x.page === h.page && x.block === h.block)) : [...s.highlights, h] };
}

export function addNote(s: ReadingState, page: number, text: string): { state: ReadingState; error?: string } {
  const t = text.trim();
  if (!t) return { state: s, error: 'Write your note first.' };
  return { state: { ...s, notes: [{ id: `n${s.notes.length + 1}-${page}`, page, text: t }, ...s.notes] } };
}

export const TEXT_SIZES: readonly number[] = [14, 16, 18, 20, 22];

export function nextTextSize(size: number, dir: 1 | -1): number {
  const i = TEXT_SIZES.indexOf(size);
  return TEXT_SIZES[clamp((i < 0 ? 1 : i) + dir, 0, TEXT_SIZES.length - 1)];
}

/** "2:48" from seconds. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function lookUp(word: string, dict: Readonly<Record<string, string>>): string | null {
  const key = word.toLowerCase().replace(/[^a-z-]/g, '');
  return dict[key] ?? null;
}

const PASS_PCT = 60;

export function gradeQuiz(questions: readonly { id: string; answer: number }[], answers: Readonly<Record<string, number>>): { score: number; total: number; pct: number; passed: boolean; unanswered: number } {
  const score = questions.filter((q) => answers[q.id] === q.answer).length;
  const total = questions.length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  return { score, total, pct, passed: pct >= PASS_PCT, unanswered: questions.filter((q) => answers[q.id] === undefined).length };
}

/** What is sent after each page turn so the dashboard and the parent portal stay current. */
export function syncPayload(book: BookShape, s: ReadingState, learner: string) {
  return {
    learner,
    bookId: book.id,
    lastPage: s.page,
    progress: progressPct(book, s),
    chapter: chapterAt(book, s.page)?.title ?? 'Front matter',
    bookmarks: s.bookmarks.length,
    highlights: s.highlights.length,
    notes: s.notes.length,
    targets: ['learner-dashboard', 'parent-portal'] as const,
  };
}
