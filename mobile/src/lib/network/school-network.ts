/**
 * The School Network on the real API: turns listed schools, the learner's own saves and
 * applications into what the designed pages draw, and a filled-in form into the submit body.
 * Maple doesn't know distance or reviews yet, so those stay empty rather than invented.
 */
import type { ApplicationForm } from '@/features/learner/schools/applicationForm';
import { APPLY_CHOICES, NETWORK_COPY, type NetApply, type NetVacancy, recentYears, type SchoolCard, type SchoolNetworkData } from '@/features/learner/schools/networkData';
import { type Category, inCategory } from '@/features/learner/schools/schoolNetwork';
import type { components } from '@/lib/api/schema';

type ApiSchool = components['schemas']['NetworkSchool'];
type Submission = components['schemas']['NetworkSubmission'];
type Status = components['schemas']['NetworkApplication']['status'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_TAGS = 4;
const CATEGORIES: readonly Category[] = ['all', 'near', 'top', 'online', 'boarding', 'scholarships'];

/** "2026-11-01" → "1 Nov 2026". */
export function formatDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function toCard(s: ApiSchool): SchoolCard {
  const pass = s.pass_rate;
  const a = s.admissions;
  const exam = s.exam_centre;
  return {
    id: String(s.id),
    name: s.name,
    town: s.town,
    district: s.district,
    km: null,
    rating: null,
    reviews: 0,
    curricula: s.curricula,
    levels: s.levels,
    stay: s.stay,
    mode: s.mode,
    programs: s.programs,
    blurb: s.blurb,
    passRate: pass?.rate ?? null,
    learners: s.learners,
    est: s.established,
    scholarships: s.scholarships,
    views: s.views ?? 0,
    added: s.listed_at.slice(0, 10),
    tags: [...s.curricula, ...s.levels, s.mode === 'Physical' ? s.stay : s.mode].slice(0, MAX_TAGS),
    passLabel: pass ? `${pass.exam} Pass Rate` : 'Pass rate',
    passSource: pass ? `${pass.board} ${pass.exam} ${pass.year}, ${pass.source}` : 'Not published yet',
    facilities: s.facilities,
    admissions: {
      opens: a.opens ? formatDay(a.opens) : 'Open all year',
      deadline: a.deadline ? formatDay(a.deadline) : 'Rolling',
      feesUGX: a.fee_min_ugx != null && a.fee_max_ugx != null ? [a.fee_min_ugx, a.fee_max_ugx] : null,
      requirements: a.requirements,
    },
    exam: exam ? { boards: exam.boards, exams: exam.exams, external: exam.external, deadline: exam.register_by ? formatDay(exam.register_by) : null, feeUGX: exam.fee_ugx } : undefined,
    apply: { intake: s.apply.intake, feeUGX: s.apply.fee_ugx, programs: s.apply.programs, documents: s.apply.documents },
  };
}

const choices = (lists: readonly (readonly string[])[]) => [...new Set(lists.flat())].sort();

export interface NetworkInput {
  schools: readonly ApiSchool[];
  saved: readonly { school: number }[];
  /** The learner's applications, most recent first. */
  applications: readonly { school: number; status: Status }[];
  /** YYYY-MM-DD, for the form's year lists. */
  today: string;
  hero?: number;
}

/** The form's shared parts; each school's own form fills in the rest (formFor). */
const baseForm = (today: string): NetApply => ({ intake: null, feeUGX: null, programs: [], documents: [], requirements: [], ...APPLY_CHOICES, years: recentYears(today) });

/** Everything the designed pages need, from the API. */
export function networkData({ schools, saved, applications, today, hero }: NetworkInput): SchoolNetworkData {
  const cards = schools.map(toCard);
  const vacancies: NetVacancy[] = schools.flatMap((s) =>
    s.vacancies.map((v) => ({ id: String(v.id), schoolId: String(s.id), title: v.title, type: v.kind, closes: formatDay(v.closes_on), subjects: v.subjects })),
  );
  const categoryCounts = Object.fromEntries(CATEGORIES.map((c) => [c, cards.filter((x) => inCategory(x, c)).length])) as Record<Category, number>;
  return {
    ...NETWORK_COPY,
    hero,
    schools: cards,
    categoryCounts,
    prefs: {},
    districts: choices(cards.map((c) => [c.district])),
    curricula: choices(cards.map((c) => c.curricula)),
    levels: choices(cards.map((c) => c.levels)),
    saved: saved.map((x) => String(x.school)),
    applications: applications.map((x) => ({ schoolId: String(x.school), submitted: x.status === 'submitted' })),
    apply: baseForm(today),
    vacancies,
    plans: [],
  };
}

/** Trimmed values with empty ones left out. */
function filled<T extends Record<string, string | number | readonly string[]>>(o: T): Partial<T> {
  const entries = Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v] as const);
  return Object.fromEntries(entries.filter(([, v]) => (typeof v === 'string' ? v !== '' : Array.isArray(v) ? v.length > 0 : true))) as Partial<T>;
}

/** The submit body: only what the learner filled in, trimmed; empty optional fields are left out. Maple checks it again. */
export function toApplicationBody(f: ApplicationForm): Submission {
  const g = f.guardian;
  const a = f.academic;
  const current = filled({ school: f.current.school, grade: f.current.grade, year: f.current.year });
  const body: Submission = {
    consent: f.consent,
    applying_for: f.applyingFor.trim(),
    applicant: { first: f.first.trim(), last: f.last.trim(), dob: f.dob.trim(), gender: f.gender, nationality: f.nationality, ...filled({ middle: f.middle }) },
    guardian: { name: g.name.trim(), relationship: g.relationship, phone: g.phone.trim(), address: g.address.trim(), ...filled({ email: g.email, occupation: g.occupation }) },
    academic: {
      stream: a.stream,
      ple_aggregate: Number(a.pleAggregate),
      ple_index: a.pleIndex.trim(),
      ple_year: Number(a.pleYear),
      ...filled({ subjects: [...a.subjects], boarding: a.boarding, needs: a.needs }),
    },
    documents: Object.entries(f.documents).map(([id, file]) => ({ id, file })),
  };
  return Object.keys(current).length ? { ...body, current } : body;
}
