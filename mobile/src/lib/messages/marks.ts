/**
 * Which conversations were opened and which are starred, shared by the Messages page and the
 * conversation page. Kept for this visit only until the API stores them.
 */
import { useSyncExternalStore } from 'react';

import { markSeen, type Marks, NO_MARKS, toggleStar } from './view';

let current: Marks = NO_MARKS;
const listeners = new Set<() => void>();

function publish(next: Marks): void {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const read = (): Marks => current;

export function useMarks(): Marks {
  return useSyncExternalStore(subscribe, read, read);
}

/** Notes that a conversation was read up to its latest message. */
export function markOpened(id: number, at: string): void {
  if (current.seen[id] === at) return;
  publish(markSeen(current, id, at));
}

export function flipStar(id: number): void {
  publish(toggleStar(current, id));
}
