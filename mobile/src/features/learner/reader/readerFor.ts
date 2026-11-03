import type { MockData } from '@/mock';

import { buildReaderBook, type ReaderData, withTopics } from './catalog';

/** The subject whose outline stands in when a book's subject has none. */
const FALLBACK_SUBJECT = 'Science';

/**
 * The reader for a library item in a design build: "Our Environment" has its pages written out;
 * every other book, video or resource is built from its subject's outline.
 */
export function readerFor(mock: MockData, id: string): ReaderData | null {
  if (id === mock.bookReader.book.id) return mock.bookReader;
  const item = mock.learner.libraryHub.books.find((b) => b.id === id);
  if (!item) return null;
  const outlines = mock.readerLibrary.outlines;
  const outline = withTopics(outlines[item.subject] ?? outlines[FALLBACK_SUBJECT], mock.readerLibrary.bookTopics[item.id] ?? []);
  return { ...buildReaderBook(item, outline), learner: mock.bookReader.learner };
}
