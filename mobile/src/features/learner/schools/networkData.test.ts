import { APPLY_CHOICES, formFor, type NetApply, recentYears, type SchoolCard } from './networkData';

const network: NetApply = {
  intake: 'Term 1, 2027',
  feeUGX: 50_000,
  programs: ['Senior Secondary (S.1)'],
  documents: [{ id: 'report', label: 'Report', file: 'report.pdf' }],
  requirements: ['Completed application form'],
  ...APPLY_CHOICES,
  years: ['2024', '2025', '2026'],
};

const card = (over: Partial<SchoolCard> = {}): SchoolCard => ({
  id: '7',
  name: 'Lakeview',
  town: 'Kampala',
  district: 'Kampala',
  km: null,
  rating: null,
  reviews: 0,
  curricula: ['UNEB'],
  levels: ['A-Level'],
  stay: 'Day',
  mode: 'Physical',
  programs: [],
  blurb: '',
  passRate: null,
  learners: 0,
  est: null,
  scholarships: false,
  views: 0,
  added: '2026-11-01',
  tags: [],
  passLabel: 'Pass rate',
  passSource: 'Not published yet',
  facilities: [],
  admissions: { opens: 'Open all year', deadline: 'Rolling', feesUGX: null, requirements: ['Latest report card'] },
  ...over,
});

describe('a school’s application form', () => {
  test('a school with its own form replaces the intake, fee, programs, documents and requirements, and keeps the choice lists', () => {
    const own = { intake: null, feeUGX: null, programs: ['Senior Five (S.5)'], documents: [{ id: 'birth', label: 'Birth certificate' }] };
    const form = formFor(network, card({ apply: own }));
    expect(form).toMatchObject({ ...own, requirements: ['Latest report card'], years: network.years, relationships: network.relationships });
  });

  test('without its own form, the network’s sample form is used', () => {
    expect(formFor(network, card())).toBe(network);
  });

  test('the year lists are the last three years, oldest first', () => {
    expect(recentYears('2026-11-05')).toEqual(['2024', '2025', '2026']);
    expect(recentYears('2027-01-02')).toEqual(['2025', '2026', '2027']);
  });
});
