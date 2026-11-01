import { useMemo, useState } from 'react';

import { addTimestamp, moveItem } from '@/lib/course-builder';
import { toast } from '@/lib/toast';
import type { BlockKind, BuilderLesson, BuilderModule, BuilderSection, ContentBlock, CourseBuilder, Mark } from '@/mock/teacher-course';

export type LessonTab = 'content' | 'video' | 'interactive' | 'notes' | 'quiz' | 'settings';

export interface LessonSettings {
  type: string;
  duration: string;
  completion: string;
  toggles: Readonly<Record<string, boolean>>;
}

interface Located {
  lesson: BuilderLesson;
  module: BuilderModule;
  moduleIndex: number;
  lessonIndex: number;
  /** "1.1": the lesson's place in the course. */
  number: string;
}

let nextId = 1;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${nextId++}`;

function locate(modules: readonly BuilderModule[], id: string): Located | null {
  for (let mi = 0; mi < modules.length; mi++) {
    const li = modules[mi].lessons.findIndex((l) => l.id === id);
    if (li >= 0) return { lesson: modules[mi].lessons[li], module: modules[mi], moduleIndex: mi, lessonIndex: li, number: `${mi + 1}.${li + 1}` };
  }
  return null;
}

/** Everything the course builder edits, for both the desktop and phone layouts. */
export function useCourseBuilder(c: CourseBuilder) {
  const first = c.modules[0].lessons[0].id;
  const startCount = c.modules.reduce((n, m) => n + m.lessons.length, 0);
  const [modules, setModules] = useState<BuilderModule[]>(c.modules);
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set([c.modules[0].id]));
  const [selected, setSelected] = useState(first);
  const [content, setContent] = useState<Readonly<Record<string, ContentBlock[]>>>({ [first]: c.content });
  const [marks, setMarks] = useState<Readonly<Record<string, Mark[]>>>({ [first]: c.marks });
  const [videos, setVideos] = useState<ReadonlySet<string>>(new Set([first]));
  const [settings, setSettings] = useState<Readonly<Record<string, LessonSettings>>>({});
  const [status, setStatus] = useState(c.course.status);
  const [saved, setSaved] = useState('Last saved 2 minutes ago');
  const [section, setSection] = useState<BuilderSection>('content');
  const [tab, setTab] = useState<LessonTab>('content');

  const order = useMemo(() => modules.flatMap((m) => m.lessons.map((l) => l.id)), [modules]);
  const current = locate(modules, selected) ?? locate(modules, order[0]);
  const lessonCount = c.course.lessons + order.length - startCount;
  const changed = (what: string) => {
    setSaved('Unsaved changes');
    if (what) toast(what);
  };

  const defaults: LessonSettings = {
    type: c.settings.types[0],
    duration: c.settings.duration,
    completion: c.settings.completion[0],
    toggles: Object.fromEntries(c.settings.toggles.map((t) => [t.key, t.on])),
  };
  const lessonSettings = settings[selected] ?? defaults;

  const select = (id: string) => {
    setSelected(id);
    const at = locate(modules, id);
    if (at) setOpen((prev) => new Set(prev).add(at.module.id));
    setSection('content');
  };
  const step = (by: number) => {
    const i = order.indexOf(current?.lesson.id ?? '');
    const next = order[i + by];
    if (next) select(next);
  };
  const toggleModule = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const mapModule = (moduleId: string, fn: (m: BuilderModule) => BuilderModule) => setModules((prev) => prev.map((m) => (m.id === moduleId ? fn(m) : m)));

  const addModule = () => {
    const id = newId('m');
    setModules((prev) => [...prev, { id, title: 'New module', lessons: [] }]);
    setOpen((prev) => new Set(prev).add(id));
    changed('New module added at the end. Rename it in Course Setup.');
  };
  const addLesson = (moduleId?: string) => {
    const target = moduleId ?? current?.module.id ?? modules[0].id;
    const lesson: BuilderLesson = { id: newId('l'), title: 'New lesson', kind: 'lesson' };
    mapModule(target, (m) => ({ ...m, lessons: [...m.lessons, lesson] }));
    setOpen((prev) => new Set(prev).add(target));
    setSelected(lesson.id);
    changed('New lesson added. Give it a title in Lesson Settings.');
  };
  const renameLesson = (title: string) => {
    if (!current) return;
    mapModule(current.module.id, (m) => ({ ...m, lessons: m.lessons.map((l) => (l.id === current.lesson.id ? { ...l, title } : l)) }));
    setSaved('Unsaved changes');
  };
  const moveLesson = (id: string, by: number) => {
    const at = locate(modules, id);
    if (!at) return;
    mapModule(at.module.id, (m) => ({ ...m, lessons: moveItem(m.lessons, at.lessonIndex, at.lessonIndex + by) }));
    changed('');
  };
  const duplicateLesson = () => {
    if (!current) return;
    const copy: BuilderLesson = { ...current.lesson, id: newId('l'), title: `${current.lesson.title} (copy)` };
    mapModule(current.module.id, (m) => ({ ...m, lessons: [...m.lessons.slice(0, current.lessonIndex + 1), copy, ...m.lessons.slice(current.lessonIndex + 1)] }));
    setContent((prev) => ({ ...prev, [copy.id]: (prev[current.lesson.id] ?? []).map((b) => ({ ...b, id: newId('c') })) }));
    setMarks((prev) => ({ ...prev, [copy.id]: prev[current.lesson.id] ?? [] }));
    if (videos.has(current.lesson.id)) setVideos((prev) => new Set(prev).add(copy.id));
    setSelected(copy.id);
    changed('Lesson duplicated. You are now editing the copy.');
  };
  const deleteLesson = () => {
    if (!current || order.length <= 1) return;
    const i = order.indexOf(current.lesson.id);
    const fallback = order[i - 1] ?? order[i + 1];
    mapModule(current.module.id, (m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== current.lesson.id) }));
    setSelected(fallback);
    changed(`“${current.lesson.title}” deleted.`);
  };

  const blocks = content[selected] ?? [];
  const setBlocks = (next: ContentBlock[]) => setContent((prev) => ({ ...prev, [selected]: next }));
  const addBlock = (kind: BlockKind) => {
    setBlocks([...blocks, { id: newId('c'), kind, ...c.newBlock[kind] }]);
    changed(`${c.newBlock[kind].prefix} block added to the end of this lesson.`);
  };
  const moveBlock = (index: number, by: number) => {
    setBlocks(moveItem(blocks, index, index + by));
    changed('');
  };
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    changed('Block removed from this lesson.');
  };

  const lessonMarks = marks[selected] ?? [];
  const addMark = (at: number, label: string) => {
    setMarks((prev) => ({ ...prev, [selected]: addTimestamp(prev[selected] ?? [], { at, label, icon: 'bookmark', color: '#1463F3' }) }));
    changed('Timestamp added. Learners can jump straight to it.');
  };
  const removeMark = (at: number) => {
    setMarks((prev) => ({ ...prev, [selected]: (prev[selected] ?? []).filter((m) => m.at !== at) }));
    changed('Timestamp removed.');
  };
  const hasVideo = videos.has(selected);
  const uploadVideo = () => {
    setVideos((prev) => new Set(prev).add(selected));
    changed('Video uploaded. Add timestamps so learners can jump to each part.');
  };

  const updateSettings = (patch: Partial<LessonSettings>) => {
    setSettings((prev) => ({ ...prev, [selected]: { ...(prev[selected] ?? defaults), ...patch } }));
    setSaved('Unsaved changes');
  };

  const saveDraft = () => {
    setStatus('Draft');
    setSaved('Last saved just now');
    toast('Draft saved. Nothing is visible to learners yet.');
  };
  const publish = () => {
    setStatus('In review');
    setSaved('Last saved just now');
    toast('Sent for a quick quality check. It goes live once approved.');
  };

  return {
    modules, open, toggleModule, addModule, addLesson, moveLesson, duplicateLesson, deleteLesson, renameLesson,
    current, select, step, order, lessonCount,
    blocks, addBlock, moveBlock, removeBlock,
    marks: lessonMarks, addMark, removeMark, hasVideo, uploadVideo,
    lessonSettings, updateSettings,
    status, saved, saveDraft, publish,
    section, setSection, tab, setTab,
  };
}

export type Builder = ReturnType<typeof useCourseBuilder>;
