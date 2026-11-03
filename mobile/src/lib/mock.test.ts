import { designDataEnabled, mockEnabled } from './mock';

describe('mockEnabled', () => {
  it('is on only when the build sets EXPO_PUBLIC_MOCK_DATA to "true"', () => {
    expect(mockEnabled('true')).toBe(true);
    expect(mockEnabled(undefined)).toBe(false);
    expect(mockEnabled('')).toBe(false);
    expect(mockEnabled('false')).toBe(false);
    expect(mockEnabled('1')).toBe(false);
  });
});

describe('designDataEnabled', () => {
  it('gives the designed pages their sample data with either switch, so the real app can show the designs', () => {
    expect(designDataEnabled('true', undefined)).toBe(true);
    expect(designDataEnabled(undefined, 'true')).toBe(true);
    expect(designDataEnabled('true', 'true')).toBe(true);
  });

  it('is off in a deployment build, which sets neither', () => {
    expect(designDataEnabled(undefined, undefined)).toBe(false);
    expect(designDataEnabled('false', '1')).toBe(false);
  });
});

describe('demoPortalFromSearch', () => {
  // Imported lazily so the fixtures only load for this test.
  const { demoPortalFromSearch } = jest.requireActual<typeof import('@/mock/shared')>('@/mock/shared');

  it('reads the portal from ?as= in a design-build address', () => {
    expect(demoPortalFromSearch('?as=parent')).toBe('parent');
    expect(demoPortalFromSearch('?x=1&as=command')).toBe('command');
  });

  it('ignores a missing or unknown portal', () => {
    expect(demoPortalFromSearch('')).toBeNull();
    expect(demoPortalFromSearch('?as=hacker')).toBeNull();
  });
});
