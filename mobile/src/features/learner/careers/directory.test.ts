import { type DirFilters, feeBand, filterInstitutions, levelOf, paginate, sortInstitutions } from './directory';

const uni = (id: string, type: string, town: string, verified = true) => ({ id, name: id, type, town, about: `${id} about`, verification: { status: verified ? ('verified' as const) : ('pending' as const) } });
const prog = (id: string, universityId: string, over: Partial<{ title: string; faculty: string; award: string; mode: string; feesUGX: number; verifiedOn: string | null }> = {}) => ({
  id,
  universityId,
  title: over.title ?? id,
  faculty: over.faculty ?? 'Health Sciences',
  award: over.award ?? 'Bachelor',
  mode: over.mode ?? 'Full-time',
  feesUGX: over.feesUGX ?? 2_000_000,
  accreditation: { status: over.verifiedOn === null ? ('pending' as const) : ('accredited' as const), verifiedOn: over.verifiedOn === undefined ? '2026-06-01' : over.verifiedOn },
});
const UNIS = [uni('lakes', 'University', 'Kampala'), uni('nile', 'Technical Institute', 'Jinja'), uni('elgon', 'College', 'Mbale', false), uni('ankole', 'University', 'Mbarara')];
const PROGS = [
  prog('nursing', 'lakes', { title: 'Bachelor of Nursing' }),
  prog('mba', 'ankole', { title: 'Master of Business Administration', faculty: 'Business', award: 'Master', mode: 'Part-time', feesUGX: 3_200_000 }),
  prog('elec', 'nile', { title: 'Diploma in Electrical Engineering', faculty: 'Engineering', award: 'Diploma', feesUGX: 1_200_000 }),
  prog('agri', 'elgon', { title: 'Bachelor of Agriculture', faculty: 'Agriculture', verifiedOn: null }),
];
const NONE: DirFilters = { query: '', type: 'all', level: 'all', area: 'all', town: 'all', mode: 'all', fees: 'all', accreditation: 'all' };
const ids = (xs: readonly { id: string }[]) => xs.map((x) => x.id);

describe('university and program directory', () => {
  test('study level comes from the award, and vocational providers teach vocational programs', () => {
    expect(levelOf('Bachelor', 'University')).toBe('Undergraduate');
    expect(levelOf('Master', 'University')).toBe('Postgraduate');
    expect(levelOf('Diploma', 'College')).toBe('Diploma & Certificate');
    expect(levelOf('Certificate', 'Vocational Provider')).toBe('Vocational & Technical');
  });

  test('fees fall into three bands a semester', () => {
    expect(feeBand(1_400_000)).toBe('low');
    expect(feeBand(1_500_000)).toBe('mid');
    expect(feeBand(2_500_001)).toBe('high');
  });

  test('institution filters keep institutions of that type and place', () => {
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, type: 'University' }, '2026-11-05'))).toEqual(['lakes', 'ankole']);
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, town: 'Jinja' }, '2026-11-05'))).toEqual(['nile']);
  });

  test('program filters keep institutions offering at least one matching program', () => {
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, level: 'Postgraduate' }, '2026-11-05'))).toEqual(['ankole']);
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, fees: 'low' }, '2026-11-05'))).toEqual(['nile']);
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, accreditation: 'unverified' }, '2026-11-05'))).toEqual(['elgon']);
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, mode: 'Part-time', area: 'Business' }, '2026-11-05'))).toEqual(['ankole']);
  });

  test('search matches an institution’s name or town, or the title of a program it offers', () => {
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, query: 'nursing' }, '2026-11-05'))).toEqual(['lakes']);
    expect(ids(filterInstitutions(UNIS, PROGS, { ...NONE, query: 'MBALE' }, '2026-11-05'))).toEqual(['elgon']);
  });

  test('most relevant puts verified institutions first, then those with more programs; never by payment', () => {
    const progs = [...PROGS, prog('bcom', 'ankole', { faculty: 'Business' })];
    expect(ids(sortInstitutions(UNIS, progs, 'relevant'))).toEqual(['ankole', 'lakes', 'nile', 'elgon']);
    expect(ids(sortInstitutions(UNIS, progs, 'name'))).toEqual(['ankole', 'elgon', 'lakes', 'nile']);
  });

  test('pages hold six, with the range shown and the page kept in bounds', () => {
    const list = Array.from({ length: 14 }, (_, i) => ({ id: String(i) }));
    expect(paginate(list, 1)).toMatchObject({ page: 1, pages: 3, from: 1, to: 6, total: 14 });
    expect(ids(paginate(list, 3).items)).toEqual(['12', '13']);
    expect(paginate(list, 9).page).toBe(3);
    expect(paginate([], 1)).toMatchObject({ page: 1, pages: 1, from: 0, to: 0, total: 0 });
  });
});
