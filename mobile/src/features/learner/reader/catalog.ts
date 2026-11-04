/**
 * Turns any library item into a reader book: its kind (e-book, video, audiobook…), its units and
 * chapters from the subject outline, a written opening page per chapter, the learner's saved place,
 * and the subject's reading tools, quizzes and activity.
 */
import type { Engagement } from '@/lib/engagement';
import type { IconName } from '@/lib/icons';
import type { Block, PageSpread, Question, Unit } from '@/mock/book-reader';

export type ResourceKind = 'book' | 'video' | 'audio' | 'paper' | 'guide' | 'cards' | 'article';

const KINDS: Readonly<Record<string, ResourceKind>> = {
  'E-books': 'book',
  Videos: 'video',
  Audiobooks: 'audio',
  'Practice Papers': 'paper',
  'Teacher Guides': 'guide',
  Flashcards: 'cards',
  Articles: 'article',
};

export function kindOf(type: string): ResourceKind {
  return KINDS[type] ?? 'book';
}

/** How each kind is labelled: the format pill, what a "page" is called, the play button and its icon. */
export const KIND_LOOK: Readonly<Record<ResourceKind, { format: string; unit: 'page' | 'part' | 'track' | 'section' | 'card'; play: string; icon: IconName }>> = {
  book: { format: 'eBook', unit: 'page', play: 'Read Aloud', icon: 'book' },
  video: { format: 'Video', unit: 'part', play: 'Play Video', icon: 'video' },
  audio: { format: 'Audiobook', unit: 'track', play: 'Listen', icon: 'volume' },
  paper: { format: 'Practice Paper', unit: 'section', play: 'Read Aloud', icon: 'clipboard' },
  guide: { format: 'Teacher Guide', unit: 'page', play: 'Read Aloud', icon: 'notes' },
  cards: { format: 'Flashcards', unit: 'card', play: 'Read Aloud', icon: 'layers' },
  article: { format: 'Article', unit: 'page', play: 'Read Aloud', icon: 'doc' },
};

export interface OutlineChapter {
  title: string;
  summary: string;
  keyIdea: string;
  points: readonly string[];
}

/** A subject's teaching outline: what every book in that subject is built from. */
export interface Outline {
  about: string;
  keyIdeaTranslations: readonly { language: string; text: string }[];
  units: readonly { title: string; chapters: readonly OutlineChapter[] }[];
  quiz: readonly Question[];
  dictionary: Readonly<Record<string, string>>;
  activity: { title: string; steps: readonly string[] };
  tutor: string;
  related: readonly { title: string; meta: string; kind: 'video' | 'pdf' | 'doc'; thumb?: number }[];
}

export interface ShelfItem extends Engagement {
  id: string;
  title: string;
  subject: string;
  level: string;
  type: string;
  cover: number;
  publisher: string;
}

const CHAPTERS_PER_UNIT = 2;

/**
 * A book with its own topics: its chapters take those titles, two to a unit, while the subject's
 * quizzes, dictionary, activity and resources stay.
 */
export function withTopics(outline: Outline, topics: readonly string[]): Outline {
  if (!topics.length) return outline;
  const chapters: OutlineChapter[] = topics.map((t) => ({
    title: t,
    summary: `In this chapter you learn about ${t.toLowerCase()}: what it is, why it matters and where you see it around you.`,
    keyIdea: `Understanding ${t.toLowerCase()} helps you make sense of the world around you.`,
    points: ['What it is', 'Examples around us', 'Try it yourself'],
  }));
  const units: { title: string; chapters: readonly OutlineChapter[] }[] = [];
  for (let i = 0; i < chapters.length; i += CHAPTERS_PER_UNIT) {
    const part = chapters.slice(i, i + CHAPTERS_PER_UNIT);
    units.push({ title: part.map((c) => c.title).join(' and '), chapters: part });
  }
  return { ...outline, units };
}

/** A small stable number from an id, so a book's sample figures never change between visits. */
export function stableSeed(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 100_003;
  return h;
}

/** Chapters start after the front matter and share the remaining pages evenly. */
export function layoutChapters(titles: readonly string[], pages: number, front: number): readonly { id: string; title: string; start: number }[] {
  const span = Math.max(1, Math.floor((pages - front) / Math.max(1, titles.length)));
  return titles.map((title, i) => ({ id: `c${i + 1}`, title, start: front + 1 + i * span }));
}

const MIN_READ_PCT = 10;
const READ_SPREAD = 71;
const MAX_READ_SHARE = 0.8;

/** Where the learner left off: the first pages read, between 10% and 80% of the book. */
export function savedProgress(id: string, pages: number, minPages: number): { lastPage: number; read: readonly number[] } {
  const pct = MIN_READ_PCT + (stableSeed(id) % READ_SPREAD);
  const n = Math.min(Math.floor(pages * MAX_READ_SHARE), Math.max(minPages, Math.round((pages * pct) / 100)));
  return { lastPage: Math.max(1, n), read: Array.from({ length: n }, (_, i) => i + 1) };
}

const FRONT_PAGES = 3;
const PAGES_PER_CHAPTER = 8;
const MINUTES_PER_PART = 4;

function openingSpread(kind: ResourceKind, n: number, c: OutlineChapter, cover: number, title: string): PageSpread {
  const bullets: Block = { kind: 'bullets', items: c.points.map((p) => ({ bold: p, text: '' })) };
  const idea: Block = { kind: 'idea', title: 'Key Idea', text: c.keyIdea };
  if (kind === 'video' || kind === 'audio') {
    return {
      left: [{ kind: 'media', media: kind, image: cover, title: c.title, caption: `${title} • ${kind === 'video' ? 'Part' : 'Track'} ${n}` }, { kind: 'heading', text: c.title }, { kind: 'para', id: `s${n}`, text: c.summary }],
      right: [idea, { kind: 'heading', text: kind === 'video' ? 'Watch For' : 'Listen For' }, bullets],
    };
  }
  return {
    left: [{ kind: 'tag', text: `${kind === 'paper' ? 'Section' : 'Chapter'} ${n}` }, { kind: 'title', text: c.title }, { kind: 'rule' }, { kind: 'para', id: `s${n}`, text: c.summary }, idea],
    right: [{ kind: 'figure', caption: `Figure ${n}.1: ${c.title}.`, image: cover }, { kind: 'heading', text: 'Key Points' }, bullets],
  };
}

/** What the reader shows for one book or resource. */
export interface ReaderData {
  learner: { id: string; name: string; level: string; avatar: number; notifications: number };
  units: readonly Unit[];
  book: {
    id: string;
    title: string;
    subject: string;
    level: string;
    rating: number;
    /** Who uploaded it, and its views, rating, likes and comments. */
    stats: Engagement;
    format: string;
    kind: ResourceKind;
    unit: string;
    play: string;
    art?: 'environment';
    pages: number;
    offline: boolean;
    cover: number;
    about: string;
    chapters: readonly { id: string; title: string; start: number }[];
    audioSeconds: number;
  };
  saved: { lastPage: number; read: readonly number[] };
  spreads: Readonly<Record<number, PageSpread>>;
  dictionary: Readonly<Record<string, string>>;
  translations: readonly { language: string; text: string }[];
  quickQuestions: readonly Question[];
  chapterQuiz: readonly Question[];
  activity: { title: string; steps: readonly string[] };
  summaries: Readonly<Record<string, readonly string[]>>;
  tutorAnswers: readonly { match: RegExp; answer: string }[];
  related: readonly { title: string; meta: string; kind: 'video' | 'pdf' | 'doc'; thumb?: number }[];
}

/** Everything the reader needs for one library item, apart from who is reading. */
export function buildReaderBook(item: ShelfItem, outline: Outline): Omit<ReaderData, 'learner'> {
  const kind = kindOf(item.type);
  const look = KIND_LOOK[kind];
  const flat = outline.units.flatMap((u) => u.chapters);
  const timed = kind === 'video' || kind === 'audio';
  const front = timed ? 0 : FRONT_PAGES;
  const pages = timed ? flat.length : front + flat.length * PAGES_PER_CHAPTER;
  const chapters = layoutChapters(
    flat.map((c) => c.title),
    pages,
    front,
  );
  let n = 0;
  const units: readonly Unit[] = outline.units.map((u, ui) => ({
    id: `u${ui + 1}`,
    title: `Unit ${ui + 1}: ${u.title}`,
    chapters: u.chapters.map((c) => {
      const ch = chapters[n];
      n += 1;
      return { id: ch.id, title: `${kind === 'paper' ? 'Section' : timed ? (kind === 'video' ? 'Part' : 'Track') : 'Chapter'} ${n}: ${c.title}`, start: ch.start, summary: c.summary };
    }),
  }));
  const spreads: Record<number, PageSpread> = {};
  flat.forEach((c, i) => {
    spreads[chapters[i].start] = openingSpread(kind, i + 1, c, item.cover, item.title);
  });
  const summaries: Record<string, readonly string[]> = {};
  flat.forEach((c, i) => {
    summaries[chapters[i].id] = [c.summary, c.keyIdea, ...c.points];
  });
  const seed = stableSeed(item.id);
  const half = Math.ceil(outline.quiz.length / 2);
  return {
    units,
    book: {
      id: item.id,
      title: item.title,
      subject: item.subject,
      level: item.level,
      rating: item.rating,
      stats: { uploader: item.uploader, views: item.views, rating: item.rating, likes: item.likes, comments: item.comments },
      format: look.format,
      kind,
      unit: look.unit,
      play: look.play,
      pages,
      offline: kind !== 'video',
      cover: item.cover,
      about: `${item.title}: ${outline.about}`,
      chapters,
      audioSeconds: timed ? flat.length * MINUTES_PER_PART * 60 : 240 + (seed % 300),
    },
    saved: savedProgress(item.id, pages, timed ? 1 : FRONT_PAGES + 1),
    spreads,
    dictionary: outline.dictionary,
    translations: outline.keyIdeaTranslations,
    quickQuestions: outline.quiz.slice(0, Math.max(half, Math.min(5, outline.quiz.length))),
    chapterQuiz: outline.quiz,
    activity: outline.activity,
    summaries,
    tutorAnswers: [{ match: /./, answer: outline.tutor }],
    related: outline.related,
  };
}
