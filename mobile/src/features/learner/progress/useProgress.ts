import { useState } from 'react';

import { nextMilestone, overall, treeCounts } from '@/lib/progress';
import type { MockData } from '@/mock';

export type Progress = MockData['learner']['progressMap'];
export type Subject = Progress['subjects'][number];
export type View = 'overview' | 'tree' | 'analytics' | 'history' | 'badges' | 'goals' | 'reports' | 'time';
export type PhoneTab = 'overview' | 'tree' | 'analytics';
/** A node on the tree: the root, a topic, the capstone, or a key skill under a topic. */
export type Picked = { id: string; topic?: string };

/** The Learning Progress page: subject, the sidebar view, the chosen node and chart period. */
export function useProgress(p: Progress) {
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [view, setView] = useState<View>('overview');
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('tree');
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [curriculum, setCurriculum] = useState(p.curricula[0]);
  const [picked, setPicked] = useState<Picked | null>(null);
  const subject = p.subjects[subjectIndex];
  return {
    subjects: p.subjects,
    subject,
    subjectIndex,
    setSubject: (i: number) => {
      setSubjectIndex(i);
      setPicked(null);
    },
    tree: subject.tree,
    counts: treeCounts(subject.tree),
    milestone: nextMilestone(subject.tree),
    totals: overall(p.subjects),
    view,
    setView,
    phoneTab,
    setPhoneTab,
    period,
    setPeriod,
    curriculum,
    setCurriculum,
    picked,
    pick: (x: Picked | null) => setPicked(x),
    /** Opens a goal's topic on its subject's tree. */
    openNode: (subjectAt: number, id: string) => {
      setSubjectIndex(subjectAt);
      setView('overview');
      setPhoneTab('tree');
      setPicked({ id });
    },
  };
}
export type ProgressState = ReturnType<typeof useProgress>;
