/**
 * What every piece of content shows about how people use it: who uploaded it, how many have
 * viewed it, its rating out of five, and its likes and comments. Video lessons, past papers,
 * library books and recorded live lessons all carry it.
 */
import { formatCount } from './shorts';

export interface Engagement {
  /** The teacher or team who uploaded it. */
  uploader: string;
  views: number;
  /** Out of 5. */
  rating: number;
  likes: number;
  comments: number;
}

/** "4.8" — one decimal, never above 5 or below 0. */
export const ratingLabel = (rating: number) => (Math.round(Math.min(5, Math.max(0, rating)) * 10) / 10).toFixed(1);

/** The short line under a title: "12K views · 4.8/5". */
export const statsLine = (e: Engagement) => `${formatCount(e.views)} ${e.views === 1 ? 'view' : 'views'} · ${ratingLabel(e.rating)}/5`;

const counted = (n: number, one: string) => `${n.toLocaleString('en-US')} ${n === 1 ? one : `${one}s`}`;

/** What a screen reader says: every number in full, and who uploaded it. */
export const statsSpoken = (e: Engagement) =>
  `Uploaded by ${e.uploader}. ${counted(e.views, 'view')}, rated ${ratingLabel(e.rating)} out of 5, ${counted(e.likes, 'like')}, ${counted(e.comments, 'comment')}`;

export { formatCount };
