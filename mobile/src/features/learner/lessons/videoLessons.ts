/**
 * Rules behind the Video Lessons page: what each lesson's status is, the tabs, filters and
 * sorting, progress in a subject, what to continue watching, and a topic's learning path.
 */
import type { Engagement } from '@/lib/engagement';

export interface VideoLessonItem extends Engagement {
  id: string;
  title: string;
  subject: string;
  /** "UACE" or "UCE". */
  level: string;
  topic: string;
  /** Its number in the subject. */
  n: number;
  seconds: number;
  /** Seconds watched so far. */
  watched: number;
  /** The day it was added, YYYY-MM-DD. */
  added: string;
  /** The day it was last watched, if ever. */
  lastWatched?: string;
  /** In one of the learner's own subjects. */
  mine: boolean;
  /** What its chalkboard thumbnail shows. */
  board: string;
}

export type LessonStatus = 'done' | 'progress' | 'new';
export type LessonTab = 'all' | 'mine' | 'downloaded' | 'later' | 'completed';
export type LessonSort = 'latest' | 'popular' | 'rating' | 'order';

export const lessonStatus = (l: VideoLessonItem): LessonStatus => (l.watched >= l.seconds ? 'done' : l.watched > 0 ? 'progress' : 'new');

export interface LessonFilter {
  tab: LessonTab;
  subject?: string;
  level?: string;
  topic?: string;
  sort: LessonSort;
  /** The lesson ids the learner downloaded or saved to watch later. */
  saved: { downloaded: readonly string[]; later: readonly string[] };
}

const SORTS: Readonly<Record<LessonSort, (a: VideoLessonItem, b: VideoLessonItem) => number>> = {
  latest: (a, b) => b.added.localeCompare(a.added),
  popular: (a, b) => b.views - a.views,
  rating: (a, b) => b.rating - a.rating || b.views - a.views,
  order: (a, b) => a.n - b.n,
};

export function filterLessons(list: readonly VideoLessonItem[], f: LessonFilter): readonly VideoLessonItem[] {
  const onTab = (l: VideoLessonItem) =>
    f.tab === 'mine' ? l.mine : f.tab === 'downloaded' ? f.saved.downloaded.includes(l.id) : f.tab === 'later' ? f.saved.later.includes(l.id) : f.tab === 'completed' ? lessonStatus(l) === 'done' : true;
  return list.filter((l) => onTab(l) && (!f.subject || l.subject === f.subject) && (!f.level || l.level === f.level) && (!f.topic || l.topic === f.topic)).sort(SORTS[f.sort]);
}

export function subjectProgress(list: readonly VideoLessonItem[], subject: string): { completed: number; inProgress: number; notStarted: number; pct: number } {
  const mine = list.filter((l) => l.subject === subject);
  const count = (s: LessonStatus) => mine.filter((l) => lessonStatus(l) === s).length;
  const total = mine.reduce((n, l) => n + l.seconds, 0);
  const watched = mine.reduce((n, l) => n + Math.min(l.watched, l.seconds), 0);
  return { completed: count('done'), inProgress: count('progress'), notStarted: count('new'), pct: total ? Math.round((watched / total) * 100) : 0 };
}

/** The lesson in progress in a subject that was watched most recently. */
export function continueWatching(list: readonly VideoLessonItem[], subject: string): VideoLessonItem | undefined {
  return list.filter((l) => l.subject === subject && lessonStatus(l) === 'progress').sort((a, b) => (b.lastWatched ?? '').localeCompare(a.lastWatched ?? ''))[0];
}

export const learningPath = (list: readonly VideoLessonItem[], subject: string, topic: string) => list.filter((l) => l.subject === subject && l.topic === topic).sort(SORTS.order);

export const topicsOf = (list: readonly VideoLessonItem[], subject: string) => [...new Set(list.filter((l) => l.subject === subject).map((l) => l.topic))];

/** "24:18" for 1458 seconds. */
export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
