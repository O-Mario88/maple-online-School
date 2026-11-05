import { type Href, router } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';
import type { SchoolCard } from '@/mock/school-network';

import { type ApplicationForm, progressOf, STEPS, stepErrors, type StepKey } from './applicationForm';
import { saveApplication, seedApplication, useApplications } from './applications';
import type { Net } from './useSchoolNetwork';

const OLDEST = 25;
const YOUNGEST = 5;

const blankForm = (applyingFor: string): ApplicationForm => ({
  applyingFor,
  first: '',
  middle: '',
  last: '',
  dob: '',
  gender: '',
  nationality: '',
  guardian: { name: '', relationship: '', phone: '', email: '', occupation: '', address: '' },
  current: { school: '', grade: '', year: '' },
  academic: { stream: '', subjects: [], pleAggregate: '', pleIndex: '', pleYear: '', boarding: '', needs: '' },
  documents: {},
  consent: false,
});

/** The application form for one school: the draft, the step, errors once Continue is pressed, and saving. */
export function useApply(net: Net, school: SchoolCard) {
  seedApplication(net.apply.draft.schoolId, net.apply.draft.form);
  const saved = useApplications()[school.id];
  const [form, setForm] = useState<ApplicationForm>(saved?.form ?? blankForm(net.apply.programs[0]));
  const [step, setStep] = useState<StepKey>(saved?.step ?? 'applicant');
  const [submitted, setSubmitted] = useState(saved?.submitted ?? false);
  const [showErrors, setShowErrors] = useState(false);
  const today = todayISO();
  const docs = net.apply.documents.map((d) => d.id);
  const progress = progressOf(form, docs, today, submitted);
  const index = STEPS.findIndex((x) => x.key === step);
  const thisYear = Number(today.slice(0, 4));

  const persist = (next: Partial<{ form: ApplicationForm; step: StepKey; submitted: boolean }> = {}) =>
    saveApplication({ schoolId: school.id, form: next.form ?? form, step: next.step ?? step, submitted: next.submitted ?? submitted });
  const set = (patch: Partial<ApplicationForm>) => setForm((f) => ({ ...f, ...patch }));
  const move = (to: StepKey) => {
    setShowErrors(false);
    setStep(to);
    persist({ step: to });
  };
  const fileFor = (id: string) => net.apply.documents.find((d) => d.id === id)?.file ?? `${id}.pdf`;

  return {
    net,
    school,
    form,
    step,
    index,
    submitted,
    progress,
    errors: showErrors ? stepErrors(form, step, docs, today) : {},
    /** Years a learner aged 5 to 25 could be born in, newest first. */
    birthYears: Array.from({ length: OLDEST - YOUNGEST + 1 }, (_, i) => thisYear - YOUNGEST - i),
    set,
    setGuardian: (patch: Partial<ApplicationForm['guardian']>) => setForm((f) => ({ ...f, guardian: { ...f.guardian, ...patch } })),
    setCurrent: (patch: Partial<ApplicationForm['current']>) => setForm((f) => ({ ...f, current: { ...f.current, ...patch } })),
    setAcademic: (patch: Partial<ApplicationForm['academic']>) => setForm((f) => ({ ...f, academic: { ...f.academic, ...patch } })),
    toggleSubject: (v: string) =>
      setForm((f) => ({ ...f, academic: { ...f.academic, subjects: f.academic.subjects.includes(v) ? f.academic.subjects.filter((x) => x !== v) : [...f.academic.subjects, v] } })),
    attach: (id: string) => setForm((f) => ({ ...f, documents: { ...f.documents, [id]: fileFor(id) } })),
    detach: (id: string) => setForm((f) => ({ ...f, documents: Object.fromEntries(Object.entries(f.documents).filter(([k]) => k !== id)) })),
    /** Opens an earlier step, or the next one once every step before it is done. */
    goTo: (k: StepKey) => {
      if (STEPS.findIndex((x) => x.key === k) <= progress.done) move(k);
    },
    back: () => index > 0 && move(STEPS[index - 1].key),
    next: () => {
      if (Object.keys(stepErrors(form, step, docs, today)).length) {
        setShowErrors(true);
        toast('Check the highlighted fields.');
        return;
      }
      move(STEPS[index + 1].key);
    },
    submit: () => {
      if (Object.keys(stepErrors(form, 'review', docs, today)).length) {
        setShowErrors(true);
        return;
      }
      setSubmitted(true);
      persist({ submitted: true });
      toast(`Application submitted to ${school.name}.`);
    },
    saveLater: () => {
      persist();
      toast('Saved. Continue any time from the School Network.');
      router.push('/learn/schools' as Href);
    },
    backToProfile: () => {
      persist();
      router.push(`/learn/schools?profile=${school.id}` as Href);
    },
    /** A reference the learner can quote to the school. */
    reference: `MAPLE-${school.id.slice(0, 3).toUpperCase()}-${today.replace(/-/g, '')}`,
  };
}

export type Apply = ReturnType<typeof useApply>;
