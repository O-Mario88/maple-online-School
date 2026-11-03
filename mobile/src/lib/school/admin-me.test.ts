import { adminMe, countryName, initials } from './admin-me';

const member = (role: string, institution_id = 1) => ({ institution_id, institution_name: 'Alpha', role, status: 'active' as const });

describe('adminMe', () => {
  it('shows the signed-in person with their role at the school and their unread count', () => {
    expect(adminMe({ full_name: 'Grace Namaganda', memberships: [member('dos')] }, 1, 4)).toEqual({
      name: 'Grace Namaganda',
      role: 'Director of studies',
      initial: 'G',
      notifications: 4,
    });
  });

  it('falls back to a plain label when the person has no role at that school', () => {
    expect(adminMe({ full_name: '', memberships: [member('headteacher', 2)] }, 1, 0)).toEqual({ name: '', role: 'School staff', initial: '?', notifications: 0 });
  });
});

describe('countryName', () => {
  it('names the countries Maple runs in, and keeps any other code as it is', () => {
    expect(countryName('UG')).toBe('Uganda');
    expect(countryName('ZZ')).toBe('ZZ');
  });
});

describe('initials', () => {
  it('takes the first letters of the first two names, as the top bar avatar shows them', () => {
    expect(initials('Daniel Okello')).toBe('DO');
    expect(initials('  test school admin ')).toBe('TS');
    expect(initials('Mary')).toBe('M');
    expect(initials('')).toBe('?');
  });
});
