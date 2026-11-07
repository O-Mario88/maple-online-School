import { type BasicInfo, canPublish, profileCompletion, PROFILE_SECTIONS, validateBasic } from './profile';

const basic: BasicInfo = {
  name: 'Riverside High School',
  type: 'Secondary School',
  ownership: 'Private',
  established: '2012',
  registration: 'PSS/3421/2012',
  description: 'Riverside High School is a leading secondary school in Entebbe, committed to academic excellence.',
  country: 'Uganda',
  district: 'Wakiso',
  town: 'Entebbe',
  address: 'Plot 45, Airport Road, Entebbe',
};
const ALL_DONE = PROFILE_SECTIONS.map((x) => x.key);

describe('school profile management', () => {
  test('completion adds up each finished section’s weight; branding missing leaves 92%', () => {
    expect(profileCompletion(ALL_DONE)).toBe(100);
    expect(profileCompletion(ALL_DONE.filter((k) => k !== 'branding'))).toBe(92);
    expect(profileCompletion([])).toBe(0);
  });

  test('the basic information needs its required fields, a real year and a 50–500 character description', () => {
    expect(validateBasic(basic, 2026)).toEqual({});
    expect(validateBasic({ ...basic, name: ' ', district: '' }, 2026)).toEqual({ name: 'Enter the school’s name', district: 'Choose the district' });
    expect(validateBasic({ ...basic, established: '2030' }, 2026).established).toBe('Enter a year between 1900 and 2026');
    expect(validateBasic({ ...basic, description: 'Too short.' }, 2026).description).toBe('Write at least 50 characters about your school');
    expect(validateBasic({ ...basic, description: 'x'.repeat(501) }, 2026).description).toBe('Keep the description to 500 characters');
  });

  test('publishing needs valid information, accepted network policies and Maple-verified performance figures', () => {
    const ok = { basic, policyAccepted: true, performanceVerified: true };
    expect(canPublish(ok, 2026)).toEqual({ ok: true, reasons: [] });
    expect(canPublish({ ...ok, policyAccepted: false, performanceVerified: false }, 2026)).toEqual({
      ok: false,
      reasons: ['Accept the School Network policies.', 'Maple must verify your published results before they appear.'],
    });
    expect(canPublish({ ...ok, basic: { ...basic, name: '' } }, 2026).reasons).toEqual(['Fix the highlighted fields in Basic Information.']);
  });
});
