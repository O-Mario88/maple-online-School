import type { components } from '@/lib/api/schema';

import type { ApplicationForm } from '@/features/learner/schools/applicationForm';

import { formatDay, networkData, toApplicationBody, toCard } from './school-network';

type ApiSchool = components['schemas']['NetworkSchool'];

const school = (over: Partial<ApiSchool> = {}): ApiSchool => ({
  id: 7,
  slug: 'lakeview',
  name: 'Lakeview International School',
  town: 'Kampala',
  district: 'Kampala',
  curricula: ['UNEB'],
  levels: ['O-Level', 'A-Level'],
  stay: 'Day & Boarding',
  mode: 'Physical',
  programs: ['Sciences'],
  facilities: ['Library'],
  blurb: 'A leading school.',
  pass_rate: { rate: 98, board: 'UNEB', exam: 'UCE', year: 2025, source: 'school-published, verified by Maple' },
  learners: 1240,
  established: 2008,
  scholarships: false,
  admissions: { opens: '2026-11-01', deadline: '2027-01-15', fee_min_ugx: 1800000, fee_max_ugx: 2600000, requirements: ['Latest report card'] },
  exam_centre: { boards: ['UNEB'], exams: ['UCE', 'UACE'], external: true, register_by: '2027-02-28', fee_ugx: 220000 },
  vacancies: [{ id: 3, title: 'Mathematics Teacher', kind: 'Full-time', closes_on: '2026-11-30', subjects: ['Mathematics'] }],
  views: 5200,
  listed_at: '2026-03-01T09:00:00Z',
  apply: { intake: 'Term 1, 2027', fee_ugx: 50000, programs: ['Senior Five (S.5)'], documents: [{ id: 'report', label: 'Latest report card' }] },
  ...over,
});

describe('School Network from the API', () => {
  test('dates read like the design: 1 Nov 2026', () => {
    expect(formatDay('2026-11-01')).toBe('1 Nov 2026');
    expect(formatDay('2027-02-28')).toBe('28 Feb 2027');
  });

  test('a school becomes a card with its results, admissions, exam centre and published facts', () => {
    const c = toCard(school());
    expect(c).toMatchObject({
      id: '7',
      name: 'Lakeview International School',
      tags: ['UNEB', 'O-Level', 'A-Level', 'Day & Boarding'],
      passRate: 98,
      passLabel: 'UCE Pass Rate',
      passSource: 'UNEB UCE 2025, school-published, verified by Maple',
      est: 2008,
      views: 5200,
      added: '2026-03-01',
      admissions: { opens: '1 Nov 2026', deadline: '15 Jan 2027', feesUGX: [1800000, 2600000], requirements: ['Latest report card'] },
      exam: { boards: ['UNEB'], exams: ['UCE', 'UACE'], external: true, deadline: '28 Feb 2027', feeUGX: 220000 },
      apply: { intake: 'Term 1, 2027', feeUGX: 50000, programs: ['Senior Five (S.5)'], documents: [{ id: 'report', label: 'Latest report card' }] },
    });
  });

  test('Maple does not know distance or reviews yet, so it never makes them up', () => {
    const c = toCard(school());
    expect(c.km).toBeNull();
    expect(c.rating).toBeNull();
    expect(c.reviews).toBe(0);
    expect(c.photo).toBeUndefined();
  });

  test('missing facts read honestly: no pass rate, open all year, rolling, fees on request, hidden views', () => {
    const c = toCard(
      school({ pass_rate: null, established: null, views: null, exam_centre: null, mode: 'Online', admissions: { opens: null, deadline: null, fee_min_ugx: null, fee_max_ugx: null, requirements: [] } }),
    );
    expect(c.passRate).toBeNull();
    expect(c.passLabel).toBe('Pass rate');
    expect(c.passSource).toBe('Not published yet');
    expect(c.est).toBeNull();
    expect(c.views).toBe(0);
    expect(c.exam).toBeUndefined();
    expect(c.tags.at(-1)).toBe('Online');
    expect(c.admissions).toEqual({ opens: 'Open all year', deadline: 'Rolling', feesUGX: null, requirements: [] });
  });

  test('the page data: the learner’s own saves and applications, counts per tile, filter choices and vacancies', () => {
    const riverside = school({ id: 9, name: 'Riverside High School', district: 'Wakiso', mode: 'Hybrid', stay: 'Day', scholarships: true, pass_rate: null, curricula: ['UNEB', 'Cambridge'], vacancies: [] });
    const net = networkData({
      schools: [school(), riverside],
      saved: [{ school: 9 }],
      applications: [
        { school: 9, status: 'started' },
        { school: 7, status: 'submitted' },
      ],
      today: '2026-11-05',
    });
    expect(net.saved).toEqual(['9']);
    expect(net.applications).toEqual([
      { schoolId: '9', submitted: false },
      { schoolId: '7', submitted: true },
    ]);
    expect(net.categoryCounts).toEqual({ all: 2, near: 0, top: 1, online: 1, boarding: 1, scholarships: 1 });
    expect(net.districts).toEqual(['Kampala', 'Wakiso']);
    expect(net.curricula).toEqual(['Cambridge', 'UNEB']);
    expect(net.levels).toEqual(['A-Level', 'O-Level']);
    expect(net.vacancies).toEqual([{ id: '3', schoolId: '7', title: 'Mathematics Teacher', type: 'Full-time', closes: '30 Nov 2026', subjects: ['Mathematics'] }]);
    expect(net.prefs).toEqual({});
    expect(net.title).toBe('School Network');
    expect(net.plans).toEqual([]);
  });

  test('the form keeps the shared choice lists, with the last three years, and no sample draft', () => {
    const { apply } = networkData({ schools: [], saved: [], applications: [], today: '2026-11-05' });
    expect(apply.years).toEqual(['2024', '2025', '2026']);
    expect(apply.relationships).toContain('Guardian');
    expect(apply.draft).toBeUndefined();
    expect(apply.documents).toEqual([]);
  });

  const form = (over: Partial<ApplicationForm> = {}): ApplicationForm => ({
    applyingFor: 'Senior Five (S.5)',
    first: ' Aisha ',
    middle: '',
    last: 'Kato',
    dob: '2011-03-14',
    gender: 'Female',
    nationality: 'Ugandan',
    guardian: { name: 'John Kato', relationship: 'Father', phone: '772 345 678', email: '', occupation: '', address: 'Ntinda, Kampala' },
    current: { school: '', grade: '', year: '' },
    academic: { stream: 'Sciences', subjects: [], pleAggregate: '12', pleIndex: '012345/001', pleYear: '2025', boarding: '', needs: '  ' },
    documents: { report: 'report-2025.pdf' },
    consent: true,
    ...over,
  });

  test('a submission sends only what the learner filled in, trimmed, and leaves out empty optional fields', () => {
    expect(toApplicationBody(form())).toEqual({
      consent: true,
      applying_for: 'Senior Five (S.5)',
      applicant: { first: 'Aisha', last: 'Kato', dob: '2011-03-14', gender: 'Female', nationality: 'Ugandan' },
      guardian: { name: 'John Kato', relationship: 'Father', phone: '772 345 678', address: 'Ntinda, Kampala' },
      academic: { stream: 'Sciences', ple_aggregate: 12, ple_index: '012345/001', ple_year: 2025 },
      documents: [{ id: 'report', file: 'report-2025.pdf' }],
    });
  });

  test('optional details the learner gave go with it', () => {
    const body = toApplicationBody(
      form({
        middle: 'Nalubega',
        guardian: { name: 'John Kato', relationship: 'Father', phone: '0772345678', email: 'john@example.com', occupation: 'Accountant', address: 'Ntinda' },
        current: { school: 'Bright Future Junior School', grade: 'P.7', year: '' },
        academic: { stream: 'STEM', subjects: ['Physics'], pleAggregate: '8', pleIndex: 'X1', pleYear: '2025', boarding: 'Boarding', needs: 'Asthma inhaler' },
      }),
    );
    expect(body.applicant.middle).toBe('Nalubega');
    expect(body.guardian).toMatchObject({ email: 'john@example.com', occupation: 'Accountant' });
    expect(body.current).toEqual({ school: 'Bright Future Junior School', grade: 'P.7' });
    expect(body.academic).toMatchObject({ subjects: ['Physics'], boarding: 'Boarding', needs: 'Asthma inhaler' });
  });
});
