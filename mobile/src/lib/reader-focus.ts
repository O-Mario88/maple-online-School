/**
 * Whether the book reader is in Focus Reading Mode. The reader sets it; the app shell reads it to
 * hide its bars. It is not in the URL: changing route params on native navigates away.
 */
import { useSyncExternalStore } from 'react';

let focused = false;
const listeners = new Set<() => void>();

export function readerFocus(): boolean {
  return focused;
}

export function setReaderFocus(on: boolean): void {
  if (on === focused) return;
  focused = on;
  listeners.forEach((l) => l());
}

export function subscribeReaderFocus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReaderFocus(): boolean {
  return useSyncExternalStore(subscribeReaderFocus, readerFocus, readerFocus);
}
