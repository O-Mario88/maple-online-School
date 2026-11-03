import { isLiveDesign } from './live-designs';

describe('isLiveDesign', () => {
  it('is true for designed pages that run on real data, so the shell lets them draw their own frame', () => {
    expect(isLiveDesign('/admin/academics')).toBe(true);
  });

  it('is false for pages still on the plain layout or still design-only', () => {
    expect(isLiveDesign('/fees')).toBe(false);
    expect(isLiveDesign('/admin/settings')).toBe(false);
  });
});
