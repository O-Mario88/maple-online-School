import { type Href, router } from 'expo-router';
import { useRef, useState } from 'react';

import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';

import { type ApplicationForm, progressOf, STEPS, stepErrors, type StepKey } from './applicationForm';
import { saveApplication, seedApplication, useApplications } from './applications';
import { formFor, type SchoolCard } from './networkData';
import { ugx } from './SchoolParts';
import type { Net } from './useSchoolNetwork';

const OLDEST = 25;
const YOUNGEST = 5;

/** What the form asks the API to do in real builds. Design builds leave it out and keep everything on the page. */
export interface ApplyActions {
  /** Starts the application on Maple, or finds the one already started. The school counts starts, never who. */
  start: (schoolId: string) => Promise<void>;
  /** Sends the form to the school, with the learner's consent. */
  submit: (schoolId: string, form: ApplicationForm) => Promise<void>;
  setSaved: (schoolId: string, on: boolean) => Promise<void>;
  /** Lets the learner choose a file: its name, or null if they cancelled. Undefined where the app can't open files. */
  pickFile?: () => Promise<string | null>;
}

export const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

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

function feeNote(fee: number | null, school: string, live: boolean): string {
  if (fee === null) return `${school} doesn’t charge an application fee.`;
  if (!live) return `Application fee: ${ugx(fee)}, non-refundable, paid when you submit. In this preview no payment is taken.`;
  return `Application fee: ${ugx(fee)}, non-refundable. ${school} will tell you how to pay it; Maple doesn’t take this payment.`;
}

/** The application form for one school: the draft, the step, errors once Continue is pressed, and saving. */
export function useApply(network: Net, school: SchoolCard, actions?: ApplyActions) {
  // The school's own form, where it has one.
  const net: Net = { ...network, apply: formFor(network.apply, school) };
  if (net.apply.draft) seedApplication(net.apply.draft.schoolId, net.apply.draft.form);
  const saved = useApplications()[school.id];
  const sentOnMaple = net.applications.some((x) => x.schoolId === school.id && x.submitted);
  const [form, setForm] = useState<ApplicationForm>(saved?.form ?? blankForm(net.apply.programs[0] ?? ''));
  const [step, setStep] = useState<StepKey>(saved?.step ?? 'applicant');
  const [submitted, setSubmitted] = useState(saved?.submitted || sentOnMaple);
  const [sending, setSending] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const started = useRef(net.applications.some((x) => x.schoolId === school.id));
  const today = todayISO();
  const docs = net.apply.documents.map((d) => d.id);
  const progress = progressOf(form, docs, today, submitted);
  const index = STEPS.findIndex((x) => x.key === step);
  const thisYear = Number(today.slice(0, 4));

  const persist = (next: Partial<{ form: ApplicationForm; step: StepKey; submitted: boolean }> = {}) =>
    saveApplication({ schoolId: school.id, form: next.form ?? form, step: next.step ?? step, submitted: next.submitted ?? submitted });
  // Counted once the learner moves on or saves. If it fails, the next try (or submitting) starts it.
  const start = () => {
    if (!actions || started.current) return;
    started.current = true;
    actions.start(school.id).catch(() => {
      started.current = false;
    });
  };
  const set = (patch: Partial<ApplicationForm>) => setForm((f) => ({ ...f, ...patch }));
  const move = (to: StepKey) => {
    setShowErrors(false);
    setStep(to);
    persist({ step: to });
  };
  const setDocument = (id: string, file: string) => setForm((f) => ({ ...f, documents: { ...f.documents, [id]: file } }));
  const sampleFile = (id: string) => net.apply.documents.find((d) => d.id === id)?.file ?? `${id}.pdf`;
  const finish = () => {
    setSubmitted(true);
    persist({ submitted: true });
    toast(`Application submitted to ${school.name}.`);
  };

  return {
    net,
    school,
    form,
    step,
    index,
    submitted,
    sending,
    progress,
    errors: showErrors ? stepErrors(form, step, docs, today) : {},
    feeNote: feeNote(net.apply.feeUGX, school.name, !!actions),
    docsNote: actions ? `Only the file names go with the application for now; bring the documents when ${school.name} asks for them.` : 'In this preview, Attach adds a sample file.',
    /** Years a learner aged 5 to 25 could be born in, newest first. */
    birthYears: Array.from({ length: OLDEST - YOUNGEST + 1 }, (_, i) => thisYear - YOUNGEST - i),
    set,
    setGuardian: (patch: Partial<ApplicationForm['guardian']>) => setForm((f) => ({ ...f, guardian: { ...f.guardian, ...patch } })),
    setCurrent: (patch: Partial<ApplicationForm['current']>) => setForm((f) => ({ ...f, current: { ...f.current, ...patch } })),
    setAcademic: (patch: Partial<ApplicationForm['academic']>) => setForm((f) => ({ ...f, academic: { ...f.academic, ...patch } })),
    toggleSubject: (v: string) =>
      setForm((f) => ({ ...f, academic: { ...f.academic, subjects: f.academic.subjects.includes(v) ? f.academic.subjects.filter((x) => x !== v) : [...f.academic.subjects, v] } })),
    attach: (id: string) => {
      if (!actions) return setDocument(id, sampleFile(id));
      if (!actions.pickFile) return toast('Attach documents from Maple on the web for now. This app can’t open files yet.');
      actions.pickFile().then(
        (file) => file && setDocument(id, file),
        (e: unknown) => toast(message(e)),
      );
    },
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
      start();
      move(STEPS[index + 1].key);
    },
    submit: () => {
      if (sending) return;
      if (Object.keys(stepErrors(form, 'review', docs, today)).length) {
        setShowErrors(true);
        return;
      }
      if (!actions) return finish();
      setSending(true);
      actions
        .submit(school.id, form)
        .then(finish, (e: unknown) => toast(message(e)))
        .finally(() => setSending(false));
    },
    saveLater: () => {
      start();
      persist();
      toast(submitted ? 'Your application is with the school.' : 'Saved on this device. Continue any time from the School Network.');
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
