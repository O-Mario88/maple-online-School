import { FRAME_HEADER, FRAME_SIDE, frameBody } from './frameBody';

describe('frameBody', () => {
  it('places the page beside the sidebar and under the header, so it never covers their buttons', () => {
    const s = frameBody({ top: 10, left: 18, right: 12, bottom: 20 });
    expect(s.marginLeft).toBe(FRAME_SIDE);
    expect(s.marginTop).toBe(FRAME_HEADER);
    expect([s.paddingTop, s.paddingLeft, s.paddingRight, s.paddingBottom]).toEqual([10, 18, 12, 20]);
  });

  it('matches the learner frame: a 187-wide sidebar and a 54-high header', () => {
    expect([FRAME_SIDE, FRAME_HEADER]).toEqual([187, 54]);
  });
});
