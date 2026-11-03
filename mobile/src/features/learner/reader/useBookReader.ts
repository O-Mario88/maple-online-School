import { useEffect, useMemo, useState } from 'react';

import { setReaderFocus, useReaderFocus } from '@/lib/reader-focus';
import { toast } from '@/lib/toast';

import type { ReaderData } from './catalog';
import { addNote, type BookShape, chapterAt, chapterDone, goTo, nextTextSize, progressPct, type ReadingState, startReading, syncPayload, toggleBookmark, toggleHighlight } from './reader';

export type { ReaderData } from './catalog';

/** Last page and reading marks per book for this session, so leaving and coming back resumes. */
const memory = new Map<string, ReadingState>();
const RATES: readonly number[] = [1, 1.25, 1.5, 0.75];

export function useBookReader(r: ReaderData) {
  const shape: BookShape = useMemo(() => ({ id: r.book.id, pages: r.book.pages, offline: r.book.offline, chapters: r.book.chapters }), [r.book]);
  const [s, setS] = useState<ReadingState>(() => memory.get(shape.id) ?? startReading(shape, r.saved));
  const [size, setSize] = useState(14);
  // Focus Reading Mode is shared with the app shell, which hides its bars; leaving the reader ends it.
  const focus = useReaderFocus();
  const setFocus = setReaderFocus;
  useEffect(() => () => setReaderFocus(false), []);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(168);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [mine, setMine] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [offline, setOffline] = useState(false);
  const [openUnits, setOpenUnits] = useState<readonly string[]>(['u1']);
  const total = r.book.audioSeconds;
  const atEnd = elapsed >= total;

  useEffect(() => {
    if (!playing || atEnd) return undefined;
    const t = setInterval(() => setElapsed((e) => Math.min(total, e + rate)), 1000);
    return () => clearInterval(t);
  }, [playing, atEnd, rate, total]);

  const save = (next: ReadingState) => {
    memory.set(shape.id, next);
    setS(next);
  };
  const turnTo = (page: number) => {
    const next = goTo(shape, s, page);
    if (next.page === s.page) return;
    save(next);
    setElapsed(0);
    setPlaying(false);
  };
  const chapter = chapterAt(shape, s.page);
  const spread = r.spreads[s.page] ?? null;
  const progress = completed ? 100 : progressPct(shape, s);
  const sync = syncPayload(shape, s, r.learner.id);

  const bookmark = () => {
    const next = toggleBookmark(s, s.page);
    save(next);
    toast(next.bookmarks.includes(s.page) ? `Page ${s.page} bookmarked.` : `Bookmark on page ${s.page} removed.`);
  };
  const highlight = (block: string, text: string) => save(toggleHighlight(s, { page: s.page, block, text }));
  const note = (text: string): string | undefined => {
    const res = addNote(s, s.page, text);
    if (res.error) return res.error;
    save(res.state);
    toast(`Note saved on page ${s.page}.`);
    return undefined;
  };
  const textSize = (dir: 1 | -1) => setSize((n) => nextTextSize(n, dir));
  const togglePlay = () => {
    if (atEnd) setElapsed(0);
    setPlaying(atEnd ? true : !playing);
  };
  const seek = (fraction: number) => setElapsed(Math.round(Math.min(1, Math.max(0, fraction)) * total));
  const nextRate = () => {
    const n = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(n);
    toast(`Read aloud at ${n}× speed.`);
  };
  const toggleMine = () => {
    setMine((m) => !m);
    toast(mine ? 'Removed from My Books.' : 'Added to My Books.');
  };
  const complete = () => {
    if (completed) return toast('You already completed this book.');
    setCompleted(true);
    toast('Book completed! It shows on your dashboard and in your parent’s portal.');
  };
  const download = () => {
    if (!shape.offline) return toast('The publisher does not allow offline reading for this book.');
    setOffline((o) => !o);
    toast(offline ? 'Offline copy removed.' : 'Saved for offline reading. Your progress syncs when you are back online.');
  };
  const toggleUnit = (id: string) => setOpenUnits((u) => (u.includes(id) ? u.filter((x) => x !== id) : [...u, id]));
  const isDone = (chapterId: string) => completed || chapterDone(shape, s, chapterId);
  return { r, shape, s, page: s.page, chapter, spread, progress, sync, size, textSize, focus, setFocus, playing: playing && !atEnd, elapsed, total, togglePlay, seek, rate, nextRate, muted, setMuted, mine, toggleMine, completed, complete, offline, download, openUnits, toggleUnit, isDone, turnTo, bookmark, highlight, note, bookmarked: s.bookmarks.includes(s.page) };
}

export type Reader = ReturnType<typeof useBookReader>;
