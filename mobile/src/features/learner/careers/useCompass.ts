import { type Href, router } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';
import type { MockData } from '@/mock';
import type { Program } from '@/mock/career-compass';

import { type Answers, areaMatches, type CareerSort, matchCareers, matchStrength, programStatus, searchCareers, sortCareers, stageFocus, subjectFit } from './careers';
import { bookSession, canContinue, cancelSession, compassProgress, type InterestStep, type Slot, upcoming } from './compass';
import { paginate } from './directory';
import { careerProfile, type Preferences, withPreferences } from './profile';
import { type CompassSection, isCompassSection } from '@/lib/careers/sections';
import { addCareerStep } from './CareerPath';
import { seedCounseling, seedSaves, setCounseling, toggleAction, toggleCareer, toggleProgram, useCareerSaves, useCounseling } from './saved';

export type CC = MockData['learner']['careerCompass'];
const ANY = 'all';
const STEPS: readonly InterestStep[] = ['interests', 'work', 'skills', 'preferences', 'results'];
const pad = (n: number) => String(n).padStart(2, '0');
const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Everything the Premium Career Compass needs. Interests, saves, plans and counseling stay private to the learner. */
export function useCompass(cc: CC, urlTab?: string) {
  // The section lives in the address (?tab=), so the sidebar, phone tabs and links all open it.
  const tab: CompassSection = isCompassSection(urlTab) ? urlTab : 'home';
  const setTab = (key: CompassSection) => router.setParams({ tab: key === 'home' ? undefined : key });
  const [answers, setAnswers] = useState<Answers>(cc.answers);
  const [prefs, setPrefs] = useState<Preferences>(cc.preferences);
  // What matching uses: the picks plus the interests the learner agreed with.
  const scored = withPreferences(answers, prefs);
  const [interests, setInterests] = useState(false);
  const [assessed, setAssessed] = useState(true);
  const [step, setStep] = useState<InterestStep | null>(null);
  const [view, setView] = useState<'assessment' | 'results'>('assessment');
  const [viewed, setViewed] = useState<readonly string[]>(cc.viewed);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [area, setAreaState] = useState<string | null>(null);
  const [picks, setPicks] = useState<{ level?: string; environment?: string; subject?: string; field?: string }>({});
  const [sort, setSort] = useState<CareerSort>('relevant');
  const [page, setPage] = useState(1);
  const [grid, setGrid] = useState(true);
  const [howTo, setHowTo] = useState(false);
  const setArea = (a: string | null) => {
    setAreaState(a);
    setPage(1);
  };
  const [careerId, setCareerId] = useState<string | null>(null);
  const [programId, openProgram] = useState<string | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [field, setField] = useState(ANY);
  const [award, setAward] = useState(ANY);
  const [topic, setTopic] = useState<string>(cc.counseling.topics[0]);
  seedSaves({ ...cc.saved, actions: cc.actions, events: cc.registrations });
  seedCounseling({ credits: cc.counseling.credits, sessions: cc.counseling.booked });
  const saves = useCareerSaves();
  const counseling = useCounseling();
  const today = todayISO();

  const matches = matchCareers(cc.careers, scored);
  const found = sortCareers(searchCareers(cc.careers, { query, area: area ?? undefined, ...picks }), scored, sort);
  const openCareer = (id: string | null) => {
    setCareerId(id);
    if (id && !viewed.includes(id)) setViewed([...viewed, id]);
  };
  const stepAt = step ? STEPS.indexOf(step) : -1;
  const next = () => {
    if (!step || !canContinue(step, answers, prefs)) return;
    if (step === 'results') {
      setAssessed(true);
      setStep(null);
      setView('results');
      return toast('Saved. Your suggestions are updated.');
    }
    setStep(STEPS[stepAt + 1]);
  };
  const back = () => setStep(stepAt > 0 ? STEPS[stepAt - 1] : null);
  const goals = cc.careers.filter((c) => saves.careers.includes(c.id));
  const goal = goals.find((g) => g.id === goalId) ?? goals[0] ?? matches[0].career;
  const progress = compassProgress({
    assessed,
    viewed: viewed.length,
    savedCareers: saves.careers.length,
    subjectsFit: subjectFit(goal.essentials, cc.learner.subjects).status === 'meets',
    savedPrograms: saves.programs.length,
    applying: saves.actions.some((a) => a.done && a.text.startsWith('Apply')),
    roadmapSteps: saves.actions.length,
    sessions: counseling.sessions.length,
  });
  const uni = (id: string) => cc.universities.find((u) => u.id === id);
  const status = (p: Program) => programStatus(p.accreditation, today);
  const fit = (p: Program) => subjectFit(p.essentials, cc.learner.subjects);
  const scholarshipsFor = (p: Program) => cc.scholarships.filter((x) => p.scholarshipIds.includes(x.id));
  const goalPrograms = cc.programs.filter((p) => goal.programIds.includes(p.id));
  const savedPrograms = cc.programs.filter((p) => saves.programs.includes(p.id));
  const fields = [...new Set(cc.programs.map((p) => p.faculty))];
  const programs = cc.programs.filter((p) => (field === ANY || p.faculty === field) && (award === ANY || p.award === award));
  const linkedScholarships = new Set([...savedPrograms, ...goalPrograms].flatMap((p) => p.scholarshipIds));
  const deadlines = upcoming(
    [
      ...savedPrograms.map((p) => ({ id: p.id, title: p.title, date: p.deadline, kind: 'Application' })),
      ...cc.scholarships.filter((x) => linkedScholarships.has(x.id)).map((x) => ({ id: x.id, title: x.title, date: x.deadline, kind: 'Scholarship' })),
      ...cc.events.map((e) => ({ id: e.id, title: e.title, date: e.date, kind: e.kind })),
      ...saves.actions.filter((a) => !a.done).map((a) => ({ id: a.id, title: a.text, date: a.due, kind: 'My action' })),
    ],
    today,
    6,
  );

  // Career steps live in My Plan's Career Path, not a separate roadmap.
  const plan = (text: string, due: string) => addCareerStep(saves.actions, text, due);
  const book = (slot: Slot, about: string = topic) => {
    const r = bookSession(counseling, slot, about);
    if (!r.ok) return toast(r.reason === 'taken' ? 'That time was just taken. Pick another.' : 'No included sessions left. You can book a paid session.');
    setCounseling(r.next);
    toast('Session booked. Your counselor will see your topic, not your grades.');
  };
  /** Moves a session to another time: free a day or more ahead, otherwise it uses a new session. */
  const reschedule = (id: string, slot: Slot) => {
    const old = counseling.sessions.find((b) => b.id === id);
    const freed = cancelSession(counseling, id, nowLocal());
    const r = bookSession(freed.next, slot, old?.topic ?? topic);
    if (!r.ok) return toast(r.reason === 'taken' ? 'That time was just taken. Pick another.' : 'Less than a day’s notice and no sessions left, so this can’t be moved.');
    setCounseling(r.next);
    toast(freed.refunded ? 'Session moved.' : 'Session moved. With less than a day’s notice, it used another session.');
  };
  const cancel = (id: string) => {
    const r = cancelSession(counseling, id, nowLocal());
    setCounseling(r.next);
    toast(r.refunded ? 'Session cancelled. Your session credit is back.' : 'Session cancelled. Less than a day’s notice, so the credit is used.');
  };

  return {
    cc,
    tab,
    setTab,
    answers,
    setAnswers,
    interests,
    setInterests,
    matches,
    goals,
    goal,
    setGoal: setGoalId,
    stage: stageFocus(cc.learner.level),
    saves,
    toggleCareer,
    toggleProgram,
    toggleAction,
    career: cc.careers.find((c) => c.id === careerId),
    strength: (id: string) => {
      const c = cc.careers.find((x) => x.id === id);
      return c ? matchStrength(c, scored) : 0;
    },
    areaScores: areaMatches(cc.careers, scored).map((a) => ({ ...a, label: cc.areas.find((x) => x.id === a.area)?.label ?? a.area })),
    progress,
    assessed,
    step,
    stepAt,
    steps: STEPS,
    startAssessment: () => setStep('interests'),
    next,
    back,
    canNext: step ? canContinue(step, answers, prefs) : false,
    prefs,
    setPrefs,
    profile: careerProfile(answers, prefs),
    view,
    setView,
    query,
    setQuery: (q: string) => {
      setQuery(q);
      setDraft(q);
      setPage(1);
    },
    draft,
    setDraft,
    search: () => {
      setQuery(draft);
      setPage(1);
    },
    area,
    setArea,
    picks,
    pick: (patch: Partial<typeof picks>) => {
      setPicks({ ...picks, ...patch });
      setPage(1);
    },
    clearExplorer: () => {
      setQuery('');
      setDraft('');
      setAreaState(null);
      setPicks({});
      setPage(1);
    },
    sort,
    setSort,
    grid,
    setGrid,
    howTo,
    setHowTo,
    found,
    careerPage: paginate(found, page),
    setPage,
    featured: matches[0].career,
    subjects: [...new Set(cc.careers.flatMap((c) => c.strengths))].sort(),
    environments: [...new Set(cc.careers.flatMap((c) => c.environments))].sort(),
    industries: [...new Set(cc.careers.map((c) => c.field))].sort(),
    openCareer,
    program: cc.programs.find((p) => p.id === programId),
    openProgram,
    uni,
    status,
    fit,
    scholarshipsFor,
    goalPrograms,
    savedPrograms,
    fields,
    field,
    setField,
    award,
    setAward,
    programs,
    deadlines,
    plan,
    counseling,
    topic,
    setTopic,
    openPlan: () => router.push('/learn/plan?tab=career' as Href),
    book,
    reschedule,
    cancel,
    now: nowLocal(),
    today,
  };
}
export type Compass = ReturnType<typeof useCompass>;
