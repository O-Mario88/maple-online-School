import { isLiveDesign } from './live-designs';

describe('isLiveDesign', () => {
  it('is true for designed pages that run on real data, so the shell lets them draw their own frame', () => {
    expect(isLiveDesign('/admin/academics')).toBe(true);
  });

  it('includes the School Network, which runs on the API’s listed schools', () => {
    expect(isLiveDesign('/learn/schools')).toBe(true);
  });

  it('includes the school application form, which sends to the API', () => {
    expect(isLiveDesign('/learn/apply')).toBe(true);
  });

  it('is false for pages still on the plain layout or still design-only', () => {
    expect(isLiveDesign('/fees')).toBe(false);
    expect(isLiveDesign('/admin/settings')).toBe(false);
  });
});
