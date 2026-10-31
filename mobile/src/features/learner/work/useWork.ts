import { useEffect, useState } from 'react';

import { answeredCount, canSubmit, checklist, type WorkProgress } from '@/lib/assignment-work';
import type { MockData } from '@/mock';

export type Work = MockData['learner']['assignmentWork'];
export type WorkTab = 'text' | 'code' | 'files' | 'scanner' | 'viva';
export type VivaMode = 'idle' | 'recording' | 'paused' | 'saved';

const TICK_MS = 1000;
const HISTORY = 100;
const SAVE_MS = 700;
const TOAST_MS = 2600;
const CAPTURE_MS = 700;
const AUTO_CAPTURE_MS = 1600;
const MAX_PAGES = 6;

function useEditor(initial: string, onSaved: (label: string) => void) {
  const [text, setTextRaw] = useState(initial);
  const [past, setPast] = useState<readonly string[]>([]);
  const [future, setFuture] = useState<readonly string[]>([]);
  const [sel, setSel] = useState({ start: initial.length, end: initial.length });
  const commit = (next: string) => {
    if (next === text) return;
    setPast((p) => [...p, text].slice(-HISTORY));
    setFuture([]);
    setTextRaw(next);
    onSaved('Saving…');
    setTimeout(() => onSaved('Saved just now'), SAVE_MS);
  };
  const lineStart = text.lastIndexOf('\n', Math.max(0, sel.start - 1)) + 1;
  return {
    text,
    setText: commit,
    sel,
    setSel,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo: () => {
      if (past.length === 0) return;
      setFuture((f) => [text, ...f]);
      setTextRaw(past[past.length - 1]);
      setPast((p) => p.slice(0, -1));
    },
    redo: () => {
      if (future.length === 0) return;
      setPast((p) => [...p, text]);
      setTextRaw(future[0]);
      setFuture((f) => f.slice(1));
    },
    /** Wraps the selection in a mark such as ** for bold. */
    wrap: (mark: string) => commit(`${text.slice(0, sel.start)}${mark}${text.slice(sel.start, sel.end) || 'text'}${mark}${text.slice(sel.end)}`),
    /** Adds or removes a prefix such as "# " or "• " at the start of the cursor's line. */
    prefix: (p: string) => commit(text.startsWith(p, lineStart) ? text.slice(0, lineStart) + text.slice(lineStart + p.length) : text.slice(0, lineStart) + p + text.slice(lineStart)),
    insert: (s: string) => commit(text.slice(0, sel.start) + s + text.slice(sel.end)),
  };
}

function useScanner(w: Work, toast: (m: string) => void) {
  const [pages, setPages] = useState<readonly number[]>(w.pages);
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const capture = (how: 'scan' | 'retake' | 'gallery') => {
    if (capturing) return;
    if (how !== 'retake' && pages.length >= MAX_PAGES) {
      toast(`You can add up to ${MAX_PAGES} pages`);
      return;
    }
    setCapturing(true);
    setTimeout(
      () => {
        if (how === 'retake') {
          toast(`Page ${current + 1} retaken • edges found, perspective corrected`);
        } else {
          setPages((p) => [...p, w.pages[p.length % w.pages.length]]);
          setCurrent(pages.length);
          toast(how === 'gallery' ? `Page ${pages.length + 1} added from gallery` : `Page ${pages.length + 1} scanned • perspective corrected`);
        }
        setCapturing(false);
      },
      auto && how === 'scan' ? AUTO_CAPTURE_MS : CAPTURE_MS,
    );
  };
  return {
    pages,
    current,
    setCurrent,
    auto,
    setAuto,
    capturing,
    capture,
    remove: (i: number) => {
      setPages((p) => p.filter((_, j) => j !== i));
      setCurrent((c) => Math.max(0, Math.min(c, pages.length - 2)));
      toast(`Page ${i + 1} removed`);
    },
  };
}

function useViva(w: Work) {
  const [mode, setMode] = useState<VivaMode>('saved');
  const [seconds, setSeconds] = useState(w.viva.seconds);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const full = seconds >= w.viva.max;
  // A take that reaches the limit stops by itself.
  const shown: VivaMode = mode === 'recording' && full ? 'saved' : mode;
  const recording = shown === 'recording';
  const playingNow = shown === 'saved' && playing && playPos < seconds;

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => Math.min(w.viva.max, s + 1)), TICK_MS);
    return () => clearInterval(id);
  }, [recording, w.viva.max]);

  useEffect(() => {
    if (!playingNow) return;
    const id = setInterval(() => setPlayPos((p) => p + 1), TICK_MS);
    return () => clearInterval(id);
  }, [playingNow]);

  return {
    mode: shown,
    seconds,
    max: w.viva.max,
    playing: playingNow,
    playPos,
    record: () => {
      setSeconds(0);
      setPlaying(false);
      setPlayPos(0);
      setMode('recording');
    },
    stop: () => setMode('saved'),
    pause: () => setMode((m) => (m === 'recording' ? 'paused' : 'recording')),
    togglePlay: () => {
      if (playPos >= seconds) setPlayPos(0);
      setPlaying(!playingNow);
    },
    discard: () => {
      setMode('idle');
      setSeconds(0);
      setPlaying(false);
      setPlayPos(0);
    },
  };
}

/** The whole workspace: editor, code, extra files, scanner, viva, toasts and hand-in. */
export function useWork(w: Work) {
  const [saved, setSaved] = useState('Saved a few seconds ago');
  const [toastText, setToastText] = useState<string | null>(null);
  const toast = (m: string) => {
    setToastText(m);
    setTimeout(() => setToastText((t) => (t === m ? null : t)), TOAST_MS);
  };
  const editor = useEditor(w.editor, setSaved);
  const scanner = useScanner(w, toast);
  const viva = useViva(w);
  const [code, setCode] = useState('');
  const [extra, setExtra] = useState<readonly string[]>([]);
  const [tab, setTab] = useState<WorkTab>('text');
  const [submitted, setSubmitted] = useState(false);
  const progress: WorkProgress = { answered: answeredCount(editor.text), pages: scanner.pages.length, vivaSeconds: viva.mode === 'saved' ? viva.seconds : 0, submitted };
  return {
    editor,
    scanner,
    viva,
    saved,
    toast,
    toastText,
    code,
    setCode,
    extra,
    addFile: () => {
      const name = `Rough working ${extra.length + 1}.pdf`;
      setExtra((e) => [...e, name]);
      toast(`${name} uploaded`);
    },
    tab,
    setTab,
    progress,
    checks: checklist(progress),
    submitted,
    submit: () => {
      if (!canSubmit(progress)) {
        const missing = checklist(progress)
          .slice(0, 3)
          .filter((c) => !c.done)
          .map((c) => c.label.toLowerCase());
        toast(submitted ? 'Already submitted' : `Before you submit: ${missing.join(', ')}`);
        return;
      }
      setSubmitted(true);
      toast('Submitted. Your teacher will mark it by Sun 26 Oct.');
    },
  };
}

export type WorkState = ReturnType<typeof useWork>;
