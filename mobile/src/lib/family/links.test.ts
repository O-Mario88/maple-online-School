import { distinctChildSchools, linkStatus, parseChildClaimInput, relationshipLabel } from './links';

describe('linkStatus', () => {
  it.each([
    ['pending', 'Waiting for the school', 'warning'],
    ['approved', 'Confirmed', 'good'],
    ['declined', 'Declined', 'danger'],
  ] as const)('labels %s links', (status, label, tone) => {
    expect(linkStatus(status)).toEqual({ label, tone });
  });
});

describe('relationshipLabel', () => {
  it('capitalises the relationship', () => {
    expect(relationshipLabel('mother')).toBe('Mother');
    expect(relationshipLabel('')).toBe('Guardian');
  });
});

describe('parseChildClaimInput', () => {
  it('parses QR code URLs, claim codes, and platform login handles across schools', () => {
    expect(parseChildClaimInput('maple://claim/a7k9m3d2')).toEqual({ mode: 'qr', token: 'A7K9M3D2' });
    expect(parseChildClaimInput('https://maple.school/claim?code=smack-1120')).toEqual({ mode: 'qr', token: 'SMACK-1120' });
    expect(parseChildClaimInput('a7k9m3d2')).toEqual({ mode: 'code', token: 'A7K9M3D2' });
    expect(parseChildClaimInput('amina.k@kisubi.maple')).toEqual({ mode: 'login', token: 'amina.k@kisubi.maple' });
    expect(parseChildClaimInput('   ')).toBeNull();
  });
});

describe('distinctChildSchools', () => {
  it('collects unique schools for children across the platform', () => {
    expect(
      distinctChildSchools([
        { school: 'Maple Online School' },
        { school: 'Kampala High School' },
        { school: 'Maple Online School' },
        { school: 'Greenhill Academy' },
      ]),
    ).toEqual(['Maple Online School', 'Kampala High School', 'Greenhill Academy']);
  });
});
