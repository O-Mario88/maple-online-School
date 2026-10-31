import { useState } from 'react';

import { filterBooks } from '@/lib/library/shelf';
import type { MockData } from '@/mock';

export type Hub = MockData['learner']['libraryHub'];
export type Book = Hub['books'][number];

const DEFAULT_LEVEL = 'Primary 6';
const DEFAULT_LANGUAGES: readonly string[] = ['English'];

const toggle = (list: readonly string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** The library page: subject, level, search and the left-hand filters. Curated rows show until a filter changes. */
export function useShelf(hub: Hub, start: { subject?: string; query?: string } = {}) {
  const [subject, setSubject] = useState<string | undefined>(start.subject);
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [query, setQuery] = useState(start.query ?? '');
  const [types, setTypes] = useState<readonly string[]>([]);
  const [languages, setLanguages] = useState<readonly string[]>(DEFAULT_LANGUAGES);
  const [publishers, setPublishers] = useState<readonly string[]>([]);

  const byId = (id: string) => hub.books.find((b) => b.id === id);
  const pick = (ids: readonly string[]) => ids.map(byId).filter((b): b is Book => b != null);
  const searching = subject != null || query.trim() !== '' || level !== DEFAULT_LEVEL || types.length > 0 || publishers.length > 0 || languages.join() !== DEFAULT_LANGUAGES.join();
  const results = filterBooks(hub.books, { subject, level, query, types, languages, publishers });

  return {
    subject,
    setSubject: (v: string | undefined) => setSubject((s) => (s === v ? undefined : v)),
    level,
    setLevel,
    query,
    setQuery,
    types,
    toggleType: (v: string) => setTypes((t) => toggle(t, v)),
    allTypes: () => setTypes([]),
    languages,
    toggleLanguage: (v: string) => setLanguages((t) => toggle(t, v)),
    publishers,
    togglePublisher: (v: string) => setPublishers((t) => toggle(t, v)),
    reset: () => {
      setSubject(undefined);
      setLevel(DEFAULT_LEVEL);
      setQuery('');
      setTypes([]);
      setLanguages(DEFAULT_LANGUAGES);
      setPublishers([]);
    },
    searching,
    results,
    byId,
    pick,
  };
}

export type ShelfState = ReturnType<typeof useShelf>;
