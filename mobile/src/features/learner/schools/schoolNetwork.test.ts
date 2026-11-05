import { inCategory, listFor, matchReasons, searchSchools, sortSchools, type NetworkSchool, type SchoolPrefs } from './schoolNetwork';

const school = (over: Partial<NetworkSchool>): NetworkSchool => ({
  id: 'x',
  name: 'Sample School',
  town: 'Kampala',
  district: 'Kampala',
  km: 10,
  rating: 4.5,
  reviews: 100,
  curricula: ['UNEB'],
  levels: ['O-Level'],
  stay: 'Day',
  mode: 'Physical',
  programs: [],
  blurb: '',
  passRate: 90,
  learners: 500,
  est: 2000,
  scholarships: false,
  views: 1000,
  added: '2026-01-01',
  ...over,
});

const lakeview = school({ id: 'lakeview', name: 'Lakeview International School', km: 12, rating: 4.8, levels: ['O-Level', 'A-Level'], stay: 'Day & Boarding', passRate: 98, views: 5200, added: '2026-03-01' });
const riverside = school({ id: 'riverside', name: 'Riverside High School', town: 'Entebbe', district: 'Wakiso', km: 38, rating: 4.7, programs: ['STEM'], mode: 'Hybrid', passRate: 96, views: 7400, added: '2026-09-20', scholarships: true });
const greenhill = school({ id: 'greenhill', name: 'Greenhill Academy', town: 'Jinja', district: 'Jinja', km: 82, rating: 4.7, curricula: ['UNEB', 'Cambridge'], levels: ['O-Level', 'A-Level'], passRate: 95, views: 3100, added: '2026-10-30' });
const online = school({ id: 'online', name: 'Maple Online Academy', mode: 'Online', km: 0, passRate: 88, views: 900, added: '2026-06-01' });
const ALL = [lakeview, riverside, greenhill, online];

const prefs: SchoolPrefs = { district: 'Kampala', curriculum: 'UNEB', level: 'A-Level', stay: 'Day & Boarding', subjects: ['STEM'] };

describe('School Network', () => {
  test('search finds schools by name, town, curriculum, level or program, ignoring case', () => {
    expect(searchSchools(ALL, { query: 'river' }).map((s) => s.id)).toEqual(['riverside']);
    expect(searchSchools(ALL, { query: 'jinja' }).map((s) => s.id)).toEqual(['greenhill']);
    expect(searchSchools(ALL, { query: 'cambridge' }).map((s) => s.id)).toEqual(['greenhill']);
    expect(searchSchools(ALL, { query: 'stem' }).map((s) => s.id)).toEqual(['riverside']);
    expect(searchSchools(ALL, { query: '  ' })).toHaveLength(4);
  });

  test('the location, curriculum and level filters narrow the list together', () => {
    expect(searchSchools(ALL, { district: 'Wakiso' }).map((s) => s.id)).toEqual(['riverside']);
    expect(searchSchools(ALL, { curriculum: 'Cambridge' }).map((s) => s.id)).toEqual(['greenhill']);
    expect(searchSchools(ALL, { level: 'A-Level', district: 'Kampala' }).map((s) => s.id)).toEqual(['lakeview']);
  });

  test('the category tiles: near me, top performing, online, boarding and scholarships', () => {
    const ids = (c: Parameters<typeof inCategory>[1]) => ALL.filter((s) => inCategory(s, c)).map((s) => s.id);
    expect(ids('all')).toHaveLength(4);
    expect(ids('near')).toEqual(['lakeview', 'riverside']);
    expect(ids('top')).toEqual(['lakeview', 'riverside', 'greenhill']);
    expect(ids('online')).toEqual(['riverside', 'online']);
    expect(ids('boarding')).toEqual(['lakeview']);
    expect(ids('scholarships')).toEqual(['riverside']);
  });

  test('every recommendation says why, from the preferences the learner chose', () => {
    expect(matchReasons(lakeview, prefs)).toEqual([
      'Offers the curriculum you selected',
      'Located in your preferred district',
      'Teaches A-Level, the level you chose',
      'Day & Boarding, as you prefer',
    ]);
    expect(matchReasons(riverside, prefs)).toEqual(['Offers the curriculum you selected', 'Has the STEM programs you are exploring']);
    expect(matchReasons(online, { ...prefs, curriculum: 'Cambridge' })).toEqual([]);
  });

  test('Recommended puts the best matches first and leaves out schools with no reason', () => {
    expect(listFor(ALL, 'recommended', prefs).map((s) => s.id)).toEqual(['lakeview', 'greenhill', 'riverside', 'online']);
    expect(listFor(ALL, 'recommended', { curriculum: 'Cambridge' }).map((s) => s.id)).toEqual(['greenhill']);
  });

  test('Popular goes by profile views and Recently Added by the date a school joined', () => {
    expect(listFor(ALL, 'popular', prefs).map((s) => s.id)).toEqual(['riverside', 'lakeview', 'greenhill', 'online']);
    expect(listFor(ALL, 'recent', prefs).map((s) => s.id)).toEqual(['greenhill', 'riverside', 'online', 'lakeview']);
  });

  test('sorting by rating, distance and pass rate', () => {
    expect(sortSchools(ALL, 'rating').map((s) => s.id)).toEqual(['lakeview', 'riverside', 'greenhill', 'online']);
    expect(sortSchools(ALL, 'distance').map((s) => s.id)).toEqual(['online', 'lakeview', 'riverside', 'greenhill']);
    expect(sortSchools(ALL, 'passRate').map((s) => s.id)).toEqual(['lakeview', 'riverside', 'greenhill', 'online']);
    expect(sortSchools(ALL, 'relevance')).toEqual(ALL);
  });
});
