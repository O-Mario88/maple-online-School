import { useState } from 'react';

import { filterProjects, pageOf, type ProjectStatus, projectStats } from '@/lib/projects';
import type { MockData } from '@/mock';

export type Page = MockData['learner']['projectsPage'];
export type Project = Page['projects'][number];
export type DetailTab = 'Overview' | 'Instructions' | 'Resources' | 'Submission' | 'Assessment Criteria' | 'Discussion';
export type TaskState = 'done' | 'doing' | 'todo';

export const PAGE_SIZE = 5;
export const STATUS_LABEL: Record<ProjectStatus, string> = { in_progress: 'In Progress', completed: 'Completed', upcoming: 'Upcoming', attention: 'Needs Attention' };

/** The Projects page: list filters and paging, the open project, its task ticks, and new proposals. */
export function useProjects(page: Page) {
  const [proposed, setProposed] = useState<readonly Project[]>([]);
  const projects = [...page.projects, ...proposed];
  const [status, setStatusRaw] = useState<ProjectStatus | undefined>();
  const [subject, setSubjectRaw] = useState<string | undefined>();
  const [query, setQueryRaw] = useState('');
  const [attentionOnly, setAttentionRaw] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [openId, setOpenId] = useState(page.projects[0].id);
  const [tab, setTab] = useState<DetailTab>('Overview');
  const [panel, setPanel] = useState(true);
  const [ticks, setTicks] = useState<Readonly<Record<string, TaskState>>>({});
  const [submitted, setSubmitted] = useState<readonly string[]>([]);

  const filtered = filterProjects(projects, { status: attentionOnly ? 'attention' : status, subject, query });
  const paged = pageOf(filtered, pageNo, PAGE_SIZE);
  const open = projects.find((p) => p.id === openId) ?? projects[0];

  return {
    projects,
    stats: projectStats(projects),
    status,
    setStatus: (v: ProjectStatus | undefined) => {
      setStatusRaw(v);
      setPageNo(1);
    },
    subject,
    setSubject: (v: string | undefined) => {
      setSubjectRaw(v);
      setPageNo(1);
    },
    query,
    setQuery: (v: string) => {
      setQueryRaw(v);
      setPageNo(1);
    },
    attentionOnly,
    setAttentionOnly: (v: boolean) => {
      setAttentionRaw(v);
      setPageNo(1);
    },
    paged,
    pageNo,
    setPageNo,
    open,
    select: (id: string) => {
      setOpenId(id);
      setTab('Overview');
    },
    tab,
    setTab,
    panel,
    setPanel,
    taskState: (p: Project, i: number): TaskState => ticks[`${p.id}:${i}`] ?? p.tasks[i].state,
    toggleTask: (p: Project, i: number) => {
      const key = `${p.id}:${i}`;
      setTicks((t) => ({ ...t, [key]: (t[key] ?? p.tasks[i].state) === 'done' ? 'todo' : 'done' }));
    },
    isSubmitted: (p: Project) => submitted.includes(p.id),
    submit: (p: Project) => setSubmitted((s) => (s.includes(p.id) ? s : [...s, p.id])),
    /** A learner's own project idea, waiting for the teacher to approve it. */
    propose: (title: string, subj: string) => {
      const base = page.projects[0];
      const idea: Project = {
        ...base,
        id: `idea-${proposed.length + 1}`,
        title,
        subject: subj,
        status: 'upcoming',
        date: 'Waiting for teacher approval',
        progress: 0,
        card: 'Your project idea. Your teacher will approve it and set the due date.',
        description: 'Your project idea. Once your teacher approves it, you will see its tasks and due date here.',
        tasks: [{ title: 'Wait for your teacher to approve the idea', state: 'doing' }],
        instructions: ['Your teacher will add instructions after approving your idea.'],
        race: undefined,
        competency: undefined,
        feedback: undefined,
      };
      setProposed((p) => [...p, idea]);
      setOpenId(idea.id);
      setStatusRaw(undefined);
      setPageNo(Math.ceil((projects.length + 1) / PAGE_SIZE));
    },
  };
}

export type ProjectsState = ReturnType<typeof useProjects>;
